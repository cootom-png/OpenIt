/**
 * File manager — handles user file CRUD, quota checks, and share tokens.
 */
import { eq, desc, and, count, sql, like, or, sum } from "drizzle-orm";
import { userFiles, emailUsers, type UserFile, type InsertUserFile } from "../drizzle/schema";
import { getDb } from "./db";
import { storagePut } from "./storage";
import crypto from "crypto";

// ─── Constants ───
export const MAX_FILES_PER_USER = 50;
export const MAX_TOTAL_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB
export const MAX_SINGLE_FILE_BYTES = 100 * 1024 * 1024; // 100 MB

// ─── Quota ───

export async function getUserQuota(userId: number) {
  const db = await getDb();
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
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { userId, fileName, fileExt, fileSize, mimeType, category, fileBuffer } = params;

  // Upload to S3
  const randomSuffix = crypto.randomBytes(4).toString("hex");
  const s3Key = `user-files/${userId}/${Date.now()}-${randomSuffix}.${fileExt}`;
  const { url: s3Url } = await storagePut(s3Key, fileBuffer, mimeType || "application/octet-stream");

  // Generate share token
  const shareToken = generateShareToken();

  // For image files, use the S3 URL directly as thumbnail
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(fileExt.toLowerCase());

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

export async function listUserFiles(userId: number, opts: { page: number; pageSize: number }) {
  const db = await getDb();
  if (!db) return { records: [], total: 0 };

  const [records, totalResult] = await Promise.all([
    db
      .select()
      .from(userFiles)
      .where(eq(userFiles.userId, userId))
      .orderBy(desc(userFiles.createdAt))
      .limit(opts.pageSize)
      .offset((opts.page - 1) * opts.pageSize),
    db
      .select({ count: count() })
      .from(userFiles)
      .where(eq(userFiles.userId, userId)),
  ]);

  return { records, total: totalResult[0]?.count || 0 };
}

export async function deleteUserFile(fileId: number, userId: number): Promise<boolean> {
  const db = await getDb();
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
  const db = await getDb();
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

  await db
    .update(userFiles)
    .set({ shareEnabled: enabled, shareToken })
    .where(eq(userFiles.id, fileId));

  const updated = await db.select().from(userFiles).where(eq(userFiles.id, fileId)).limit(1);
  return updated[0] || null;
}

// ─── Share ───

export async function getFileByShareToken(token: string): Promise<(UserFile & { ownerNickname: string }) | null> {
  const db = await getDb();
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

  return { ...result[0].file, ownerNickname: result[0].ownerNickname };
}

// ─── Admin File Operations ───

export async function adminListFiles(opts: {
  page: number;
  pageSize: number;
  search?: string;
  userId?: number;
  category?: string;
}) {
  const db = await getDb();
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
  const db = await getDb();
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
  const db = await getDb();
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

export async function listPublic3DParts(opts: { page: number; pageSize: number }) {
  const db = await getDb();
  if (!db) return { records: [], total: 0 };

  // List all 3D category files that have share enabled or are public gallery items
  // Show all 3D files from approved users with thumbnails
  const conditions = [
    eq(userFiles.category, "3d"),
  ];

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
  const db = await getDb();
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
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(emailUsers).set({ nickname }).where(eq(emailUsers.id, userId));
}
