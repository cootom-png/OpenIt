/**
 * File manager — handles user file CRUD, quota checks, and share tokens.
 */
import type { UserFile, InsertUserFile, DownloadRequest } from "../drizzle/schema";
import crypto from "crypto";

let dataDepsPromise: Promise<{
  eq: typeof import("drizzle-orm").eq;
  desc: typeof import("drizzle-orm").desc;
  and: typeof import("drizzle-orm").and;
  count: typeof import("drizzle-orm").count;
  sql: typeof import("drizzle-orm").sql;
  like: typeof import("drizzle-orm").like;
  or: typeof import("drizzle-orm").or;
  userFiles: typeof import("../drizzle/schema").userFiles;
  emailUsers: typeof import("../drizzle/schema").emailUsers;
  downloadRequests: typeof import("../drizzle/schema").downloadRequests;
  getDb: typeof import("./db").getDb;
}> | null = null;

let dbDepPromise: Promise<{
  getDb: typeof import("./db").getDb;
}> | null = null;

function getDbDep() {
  dbDepPromise ??= import("./db").then((db) => ({ getDb: db.getDb }));
  return dbDepPromise;
}

function getDataDeps() {
  dataDepsPromise ??= Promise.all([
    import("drizzle-orm"),
    import("../drizzle/schema"),
    import("./db"),
  ]).then(([orm, schema, db]) => ({
    eq: orm.eq,
    desc: orm.desc,
    and: orm.and,
    count: orm.count,
    sql: orm.sql,
    like: orm.like,
    or: orm.or,
    userFiles: schema.userFiles,
    emailUsers: schema.emailUsers,
    downloadRequests: schema.downloadRequests,
    getDb: db.getDb,
  }));

  return dataDepsPromise;
}

async function getDbContext() {
  const { getDb } = await getDbDep();
  const db = await getDb();
  if (!db) {
    return { db } as Awaited<ReturnType<typeof getDataDeps>> & { db: typeof db };
  }

  const deps = await getDataDeps();
  return { ...deps, db };
}

async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
) {
  const storage = await import("./storage");
  return storage.storagePut(relKey, data, contentType);
}

// ─── Constants ───
export const MAX_FILES_PER_USER = 50;
export const MAX_TOTAL_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB
export const MAX_SINGLE_FILE_BYTES = 100 * 1024 * 1024; // 100 MB

// ─── Quota ───

export async function getUserQuota(userId: number) {
  const { db, userFiles, emailUsers, downloadRequests, eq, desc, and, count, sql, like, or } = await getDbContext();
  if (!db) return { fileCount: 0, totalSize: 0, maxFiles: MAX_FILES_PER_USER, maxTotalSize: MAX_TOTAL_SIZE_BYTES, maxSingleFile: MAX_SINGLE_FILE_BYTES };

  const result = await db
    .select({
      fileCount: count(),
      totalSize: sql<number>`COALESCE(SUM(${userFiles.fileSize}), 0)`,
    })
    .from(userFiles)
    .where(eq(userFiles.userId, userId));

  return {
    fileCount: result[0]?.fileCount || 0,
    totalSize: Number(result[0]?.totalSize) || 0,
    maxFiles: MAX_FILES_PER_USER,
    maxTotalSize: MAX_TOTAL_SIZE_BYTES,
    maxSingleFile: MAX_SINGLE_FILE_BYTES,
  };
}

export function checkQuota(
  quota: { fileCount: number; totalSize: number },
  newFileSize: number
): { ok: boolean; reason?: string } {
  if (newFileSize > MAX_SINGLE_FILE_BYTES) {
    return { ok: false, reason: `单个文件不能超过 ${MAX_SINGLE_FILE_BYTES / (1024 * 1024)}MB` };
  }
  if (quota.fileCount >= MAX_FILES_PER_USER) {
    return { ok: false, reason: `文件数量已达上限 ${MAX_FILES_PER_USER} 个` };
  }
  if (quota.totalSize + newFileSize > MAX_TOTAL_SIZE_BYTES) {
    return { ok: false, reason: `存储空间不足，总容量 ${MAX_TOTAL_SIZE_BYTES / (1024 * 1024)}MB` };
  }
  return { ok: true };
}

// ─── Upload ───

function generateShareToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

export async function uploadUserFile(params: {
  userId: number;
  fileName: string;
  fileExt: string;
  fileSize: number;
  mimeType: string;
  category: string;
  fileBuffer: Buffer;
}): Promise<UserFile> {
  const { db, userFiles, emailUsers, downloadRequests, eq, desc, and, count, sql, like, or } = await getDbContext();
  if (!db) throw new Error("Database not available");

  const { userId, fileName, fileExt, fileSize, mimeType, category, fileBuffer } = params;

  // Upload to S3
  const randomSuffix = crypto.randomBytes(4).toString("hex");
  const s3Key = `user-files/${userId}/${Date.now()}-${randomSuffix}.${fileExt}`;
  const { url: s3Url } = await storagePut(s3Key, fileBuffer, mimeType || "application/octet-stream");

  // Generate share token
  const shareToken = generateShareToken();

  // For image files, use the S3 URL directly as thumbnail
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(fileExt.toLowerCase());

  // Insert record
  const result = await db.insert(userFiles).values({
    userId,
    fileName,
    fileExt,
    fileSize,
    mimeType,
    category,
    s3Key,
    s3Url,
    shareToken,
    shareEnabled: false,
    thumbnailUrl: isImage ? s3Url : null,
  });

  // Update user quota counters
  await db
    .update(emailUsers)
    .set({
      fileCount: sql`${emailUsers.fileCount} + 1`,
      totalFileSize: sql`${emailUsers.totalFileSize} + ${fileSize}`,
    })
    .where(eq(emailUsers.id, userId));

  // Fetch and return the inserted record
  const inserted = await db
    .select()
    .from(userFiles)
    .where(eq(userFiles.id, result[0].insertId))
    .limit(1);

  return inserted[0];
}

// ─── User File Operations ───

export async function listUserFiles(userId: number, opts: { page: number; pageSize: number; search?: string; category?: string }) {
  const { db, userFiles, emailUsers, downloadRequests, eq, desc, and, count, sql, like, or } = await getDbContext();
  if (!db) return { records: [], total: 0 };

  const conditions: any[] = [eq(userFiles.userId, userId)];
  if (opts.search) {
    conditions.push(like(userFiles.fileName, `%${opts.search}%`));
  }
  if (opts.category) {
    conditions.push(eq(userFiles.category, opts.category));
  }

  const whereClause = and(...conditions);

  const [records, totalResult] = await Promise.all([
    db
      .select()
      .from(userFiles)
      .where(whereClause)
      .orderBy(desc(userFiles.createdAt))
      .limit(opts.pageSize)
      .offset((opts.page - 1) * opts.pageSize),
    db
      .select({ count: count() })
      .from(userFiles)
      .where(whereClause),
  ]);

  return { records, total: totalResult[0]?.count || 0 };
}

export async function deleteUserFile(fileId: number, userId: number): Promise<boolean> {
  const { db, userFiles, emailUsers, downloadRequests, eq, desc, and, count, sql, like, or } = await getDbContext();
  if (!db) throw new Error("Database not available");

  // Get file info first
  const file = await db
    .select()
    .from(userFiles)
    .where(and(eq(userFiles.id, fileId), eq(userFiles.userId, userId)))
    .limit(1);

  if (!file.length) return false;

  // Delete the record
  await db.delete(userFiles).where(eq(userFiles.id, fileId));

  // Update user quota counters
  await db
    .update(emailUsers)
    .set({
      fileCount: sql`GREATEST(${emailUsers.fileCount} - 1, 0)`,
      totalFileSize: sql`GREATEST(${emailUsers.totalFileSize} - ${file[0].fileSize}, 0)`,
    })
    .where(eq(emailUsers.id, userId));

  return true;
}

export async function toggleFileShare(fileId: number, userId: number, enabled: boolean): Promise<UserFile | null> {
  const { db, userFiles, emailUsers, downloadRequests, eq, desc, and, count, sql, like, or } = await getDbContext();
  if (!db) throw new Error("Database not available");

  // Verify ownership
  const file = await db
    .select()
    .from(userFiles)
    .where(and(eq(userFiles.id, fileId), eq(userFiles.userId, userId)))
    .limit(1);

  if (!file.length) return null;

  // Ensure share token exists
  let shareToken = file[0].shareToken;
  if (!shareToken) {
    shareToken = generateShareToken();
  }

  // When enabling share, set 7-day expiry; when disabling, clear expiry
  const shareExpiresAt = enabled ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null;

  await db
    .update(userFiles)
    .set({ shareEnabled: enabled, shareToken, shareExpiresAt })
    .where(eq(userFiles.id, fileId));

  const updated = await db.select().from(userFiles).where(eq(userFiles.id, fileId)).limit(1);
  return updated[0] || null;
}

/**
 * Renew share — reset the expiry to 7 days from now.
 * Only works if the file is currently shared.
 */
export async function renewFileShare(fileId: number, userId: number): Promise<UserFile | null> {
  const { db, userFiles, emailUsers, downloadRequests, eq, desc, and, count, sql, like, or } = await getDbContext();
  if (!db) throw new Error("Database not available");

  const file = await db
    .select()
    .from(userFiles)
    .where(and(eq(userFiles.id, fileId), eq(userFiles.userId, userId)))
    .limit(1);

  if (!file.length) return null;

  const shareExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  let shareToken = file[0].shareToken;
  if (!shareToken) {
    shareToken = generateShareToken();
  }

  await db
    .update(userFiles)
    .set({ shareEnabled: true, shareToken, shareExpiresAt })
    .where(eq(userFiles.id, fileId));

  const updated = await db.select().from(userFiles).where(eq(userFiles.id, fileId)).limit(1);
  return updated[0] || null;
}

// ─── Share ───

export async function getFileByShareToken(token: string): Promise<(UserFile & { ownerNickname: string; expired: boolean }) | null> {
  const { db, userFiles, emailUsers, downloadRequests, eq, desc, and, count, sql, like, or } = await getDbContext();
  if (!db) return null;

  const result = await db
    .select({
      file: userFiles,
      ownerNickname: emailUsers.nickname,
    })
    .from(userFiles)
    .innerJoin(emailUsers, eq(userFiles.userId, emailUsers.id))
    .where(and(eq(userFiles.shareToken, token), eq(userFiles.shareEnabled, true)))
    .limit(1);

  if (!result.length) return null;

  // Check if share has expired
  const file = result[0].file;
  const expired = file.shareExpiresAt ? new Date(file.shareExpiresAt) < new Date() : false;

  return { ...file, ownerNickname: result[0].ownerNickname, expired };
}

/**
 * Update allowDownload setting for a user's file.
 */
export async function updateAllowDownload(fileId: number, userId: number, allowDownload: boolean): Promise<UserFile | null> {
  const { db, userFiles, emailUsers, downloadRequests, eq, desc, and, count, sql, like, or } = await getDbContext();
  if (!db) throw new Error("Database not available");

  const file = await db
    .select()
    .from(userFiles)
    .where(and(eq(userFiles.id, fileId), eq(userFiles.userId, userId)))
    .limit(1);

  if (!file.length) return null;

  await db
    .update(userFiles)
    .set({ allowDownload })
    .where(eq(userFiles.id, fileId));

  const updated = await db.select().from(userFiles).where(eq(userFiles.id, fileId)).limit(1);
  return updated[0] || null;
}

// ─── Admin File Operations ───

export async function adminListFiles(opts: {
  page: number;
  pageSize: number;
  search?: string;
  userId?: number;
  category?: string;
}) {
  const { db, userFiles, emailUsers, downloadRequests, eq, desc, and, count, sql, like, or } = await getDbContext();
  if (!db) return { records: [], total: 0 };

  const conditions: any[] = [];
  if (opts.userId) {
    conditions.push(eq(userFiles.userId, opts.userId));
  }
  if (opts.category) {
    conditions.push(eq(userFiles.category, opts.category));
  }
  if (opts.search) {
    conditions.push(like(userFiles.fileName, `%${opts.search}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [records, totalResult] = await Promise.all([
    whereClause
      ? db
          .select({
            file: userFiles,
            ownerNickname: emailUsers.nickname,
            ownerEmail: emailUsers.email,
          })
          .from(userFiles)
          .innerJoin(emailUsers, eq(userFiles.userId, emailUsers.id))
          .where(whereClause)
          .orderBy(desc(userFiles.createdAt))
          .limit(opts.pageSize)
          .offset((opts.page - 1) * opts.pageSize)
      : db
          .select({
            file: userFiles,
            ownerNickname: emailUsers.nickname,
            ownerEmail: emailUsers.email,
          })
          .from(userFiles)
          .innerJoin(emailUsers, eq(userFiles.userId, emailUsers.id))
          .orderBy(desc(userFiles.createdAt))
          .limit(opts.pageSize)
          .offset((opts.page - 1) * opts.pageSize),
    whereClause
      ? db.select({ count: count() }).from(userFiles).where(whereClause)
      : db.select({ count: count() }).from(userFiles),
  ]);

  return {
    records: records.map((r) => ({
      ...r.file,
      ownerNickname: r.ownerNickname,
      ownerEmail: r.ownerEmail,
    })),
    total: totalResult[0]?.count || 0,
  };
}

export async function adminDeleteFile(fileId: number): Promise<boolean> {
  const { db, userFiles, emailUsers, downloadRequests, eq, desc, and, count, sql, like, or } = await getDbContext();
  if (!db) throw new Error("Database not available");

  const file = await db.select().from(userFiles).where(eq(userFiles.id, fileId)).limit(1);
  if (!file.length) return false;

  await db.delete(userFiles).where(eq(userFiles.id, fileId));

  // Update user quota
  await db
    .update(emailUsers)
    .set({
      fileCount: sql`GREATEST(${emailUsers.fileCount} - 1, 0)`,
      totalFileSize: sql`GREATEST(${emailUsers.totalFileSize} - ${file[0].fileSize}, 0)`,
    })
    .where(eq(emailUsers.id, file[0].userId));

  return true;
}

export async function adminGetFileStats() {
  const { db, userFiles, emailUsers, downloadRequests, eq, desc, and, count, sql, like, or } = await getDbContext();
  if (!db) return { totalFiles: 0, totalSize: 0, totalShared: 0 };

  const [filesResult, sharedResult] = await Promise.all([
    db
      .select({
        totalFiles: count(),
        totalSize: sql<number>`COALESCE(SUM(${userFiles.fileSize}), 0)`,
      })
      .from(userFiles),
    db
      .select({ count: count() })
      .from(userFiles)
      .where(eq(userFiles.shareEnabled, true)),
  ]);

  return {
    totalFiles: filesResult[0]?.totalFiles || 0,
    totalSize: Number(filesResult[0]?.totalSize) || 0,
    totalShared: sharedResult[0]?.count || 0,
  };
}

// ─── Public 3D Parts Gallery ───

export async function listPublic3DParts(opts: { page: number; pageSize: number; search?: string; fileExt?: string }) {
  const { db, userFiles, emailUsers, downloadRequests, eq, desc, and, count, sql, like, or } = await getDbContext();
  if (!db) return { records: [], total: 0 };

  // List all 3D category files from approved users
  const conditions: any[] = [
    eq(userFiles.category, "3d"),
  ];

  // Add search filter if provided
  if (opts.search && opts.search.trim()) {
    conditions.push(like(userFiles.fileName, `%${opts.search.trim()}%`));
  }

  // Add file extension filter if provided
  if (opts.fileExt && opts.fileExt.trim()) {
    conditions.push(eq(userFiles.fileExt, opts.fileExt.trim().toLowerCase()));
  }

  const whereClause = and(...conditions);

  const [records, totalResult] = await Promise.all([
    db
      .select({
        id: userFiles.id,
        fileName: userFiles.fileName,
        fileExt: userFiles.fileExt,
        fileSize: userFiles.fileSize,
        thumbnailUrl: userFiles.thumbnailUrl,
        s3Url: userFiles.s3Url,
        viewCount: userFiles.viewCount,
        downloadRequestCount: userFiles.downloadRequestCount,
        createdAt: userFiles.createdAt,
        ownerNickname: emailUsers.nickname,
      })
      .from(userFiles)
      .innerJoin(emailUsers, eq(userFiles.userId, emailUsers.id))
      .where(whereClause)
      .orderBy(desc(userFiles.createdAt))
      .limit(opts.pageSize)
      .offset((opts.page - 1) * opts.pageSize),
    db.select({ count: count() }).from(userFiles).where(whereClause),
  ]);

  return { records, total: totalResult[0]?.count || 0 };
}

// ─── Thumbnail ───

export async function updateFileThumbnail(fileId: number, userId: number, thumbnailBase64: string): Promise<string | null> {
  const { db, userFiles, emailUsers, downloadRequests, eq, desc, and, count, sql, like, or } = await getDbContext();
  if (!db) throw new Error("Database not available");

  // Verify ownership
  const file = await db.select().from(userFiles).where(and(eq(userFiles.id, fileId), eq(userFiles.userId, userId))).limit(1);
  if (!file.length) return null;

  // Decode base64 and upload thumbnail to S3
  const thumbBuffer = Buffer.from(thumbnailBase64, "base64");
  const randomSuffix = crypto.randomBytes(4).toString("hex");
  const thumbKey = `user-files/${userId}/thumbs/${fileId}-${randomSuffix}.png`;
  const { url: thumbnailUrl } = await storagePut(thumbKey, thumbBuffer, "image/png");

  // Update record
  await db.update(userFiles).set({ thumbnailUrl }).where(eq(userFiles.id, fileId));

  return thumbnailUrl;
}

// ─── Update user profile ───

export async function updateEmailUserNickname(userId: number, nickname: string): Promise<void> {
  const { db, userFiles, emailUsers, downloadRequests, eq, desc, and, count, sql, like, or } = await getDbContext();
  if (!db) throw new Error("Database not available");

  await db.update(emailUsers).set({ nickname }).where(eq(emailUsers.id, userId));
}

// ─── Download Requests & View Tracking ───

/**
 * Increment view count for a file (called when someone previews a 3D part).
 */
export async function incrementViewCount(fileId: number): Promise<void> {
  const { db, userFiles, emailUsers, downloadRequests, eq, desc, and, count, sql, like, or } = await getDbContext();
  if (!db) return;

  await db
    .update(userFiles)
    .set({ viewCount: sql`${userFiles.viewCount} + 1` })
    .where(eq(userFiles.id, fileId));
}

/**
 * Submit a download request for a file.
 * Returns the created request.
 */
export async function submitDownloadRequest(data: {
  fileId: number;
  email: string;
  phone: string;
  company: string;
  realName: string;
  message?: string;
}): Promise<DownloadRequest> {
  const { db, userFiles, emailUsers, downloadRequests, eq, desc, and, count, sql, like, or } = await getDbContext();
  if (!db) throw new Error("Database not available");

  // Verify file exists
  const file = await db.select().from(userFiles).where(eq(userFiles.id, data.fileId)).limit(1);
  if (!file.length) throw new Error("文件不存在");

  // Insert request
  const result = await db.insert(downloadRequests).values({
    fileId: data.fileId,
    email: data.email,
    phone: data.phone,
    company: data.company,
    realName: data.realName,
    message: data.message || null,
  });

  // Increment download request count on the file
  await db
    .update(userFiles)
    .set({ downloadRequestCount: sql`${userFiles.downloadRequestCount} + 1` })
    .where(eq(userFiles.id, data.fileId));

  // Return the created request
  const created = await db.select().from(downloadRequests).where(eq(downloadRequests.id, Number(result[0].insertId))).limit(1);
  return created[0];
}

/**
 * List download requests for a specific file (for file owner).
 */
export async function listDownloadRequestsByFile(fileId: number, opts: { page: number; pageSize: number }) {
  const { db, userFiles, emailUsers, downloadRequests, eq, desc, and, count, sql, like, or } = await getDbContext();
  if (!db) return { records: [], total: 0 };

  const whereClause = eq(downloadRequests.fileId, fileId);

  const [records, totalResult] = await Promise.all([
    db
      .select()
      .from(downloadRequests)
      .where(whereClause)
      .orderBy(desc(downloadRequests.createdAt))
      .limit(opts.pageSize)
      .offset((opts.page - 1) * opts.pageSize),
    db.select({ count: count() }).from(downloadRequests).where(whereClause),
  ]);

  return { records, total: totalResult[0]?.count || 0 };
}

/**
 * List all download requests (for admin).
 */
export async function adminListDownloadRequests(opts: {
  page: number;
  pageSize: number;
  status?: string;
  search?: string;
}) {
  const { db, userFiles, emailUsers, downloadRequests, eq, desc, and, count, sql, like, or } = await getDbContext();
  if (!db) return { records: [], total: 0 };

  const conditions: any[] = [];
  if (opts.status) {
    conditions.push(eq(downloadRequests.status, opts.status as "pending" | "approved" | "rejected"));
  }
  if (opts.search && opts.search.trim()) {
    const s = `%${opts.search.trim()}%`;
    conditions.push(
      or(
        like(downloadRequests.email, s),
        like(downloadRequests.company, s),
        like(downloadRequests.realName, s),
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [records, totalResult] = await Promise.all([
    whereClause
      ? db
          .select({
            request: downloadRequests,
            fileName: userFiles.fileName,
            fileExt: userFiles.fileExt,
            ownerNickname: emailUsers.nickname,
          })
          .from(downloadRequests)
          .innerJoin(userFiles, eq(downloadRequests.fileId, userFiles.id))
          .innerJoin(emailUsers, eq(userFiles.userId, emailUsers.id))
          .where(whereClause)
          .orderBy(desc(downloadRequests.createdAt))
          .limit(opts.pageSize)
          .offset((opts.page - 1) * opts.pageSize)
      : db
          .select({
            request: downloadRequests,
            fileName: userFiles.fileName,
            fileExt: userFiles.fileExt,
            ownerNickname: emailUsers.nickname,
          })
          .from(downloadRequests)
          .innerJoin(userFiles, eq(downloadRequests.fileId, userFiles.id))
          .innerJoin(emailUsers, eq(userFiles.userId, emailUsers.id))
          .orderBy(desc(downloadRequests.createdAt))
          .limit(opts.pageSize)
          .offset((opts.page - 1) * opts.pageSize),
    whereClause
      ? db.select({ count: count() }).from(downloadRequests).where(whereClause)
      : db.select({ count: count() }).from(downloadRequests),
  ]);

  return {
    records: records.map((r) => ({
      ...r.request,
      fileName: r.fileName,
      fileExt: r.fileExt,
      ownerNickname: r.ownerNickname,
    })),
    total: totalResult[0]?.count || 0,
  };
}

/**
 * Get download request statistics.
 */
export async function getDownloadRequestStats() {
  const { db, userFiles, emailUsers, downloadRequests, eq, desc, and, count, sql, like, or } = await getDbContext();
  if (!db) return { total: 0, pending: 0, approved: 0, rejected: 0 };

  const results = await db
    .select({
      status: downloadRequests.status,
      count: count(),
    })
    .from(downloadRequests)
    .groupBy(downloadRequests.status);

  const stats = { total: 0, pending: 0, approved: 0, rejected: 0 };
  for (const r of results) {
    stats[r.status as keyof typeof stats] += r.count;
    stats.total += r.count;
  }
  return stats;
}

/**
 * Update download request status (admin).
 */
export async function updateDownloadRequestStatus(requestId: number, status: "approved" | "rejected"): Promise<boolean> {
  const { db, userFiles, emailUsers, downloadRequests, eq, desc, and, count, sql, like, or } = await getDbContext();
  if (!db) throw new Error("Database not available");

  const result = await db
    .update(downloadRequests)
    .set({ status })
    .where(eq(downloadRequests.id, requestId));

  return true;
}
