import { eq, desc, sql, count, and, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, InsertFileUpload, users, fileUploads, emailUsers, InsertEmailUser, EmailUser, passwordResetTokens } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── Email User Auth ───

export async function createEmailUser(data: {
  email: string;
  passwordHash: string;
  nickname: string;
  realName?: string;
  company?: string;
  phone?: string;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(emailUsers).values({
    email: data.email,
    passwordHash: data.passwordHash,
    nickname: data.nickname,
    realName: data.realName || null,
    company: data.company || null,
    phone: data.phone || null,
    status: "pending",
    role: "user",
  });

  return result[0].insertId;
}

/** Update email user's password hash */
export async function updateEmailUserPassword(id: number, passwordHash: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(emailUsers).set({ passwordHash }).where(eq(emailUsers.id, id));
}

// ─── Password Reset Tokens ───

export async function createPasswordResetToken(data: {
  userId: number;
  email: string;
  resetCode: string;
  expiresAt: Date;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(passwordResetTokens).values(data);
  return result[0].insertId;
}

export async function getValidResetToken(email: string, resetCode: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(passwordResetTokens)
    .where(and(
      eq(passwordResetTokens.email, email),
      eq(passwordResetTokens.resetCode, resetCode),
      eq(passwordResetTokens.used, false),
    ))
    .orderBy(desc(passwordResetTokens.createdAt))
    .limit(1);
  if (result.length === 0) return undefined;
  const token = result[0];
  // Check expiry
  if (new Date() > token.expiresAt) return undefined;
  return token;
}

export async function markResetTokenUsed(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.id, id));
}

export async function getPendingResetRequests() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(passwordResetTokens)
    .where(eq(passwordResetTokens.used, false))
    .orderBy(desc(passwordResetTokens.createdAt))
    .limit(50);
  return result;
}

export async function getEmailUserByEmail(email: string): Promise<EmailUser | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(emailUsers).where(eq(emailUsers.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getEmailUserById(id: number): Promise<EmailUser | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(emailUsers).where(eq(emailUsers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateEmailUserLastSignedIn(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(emailUsers).set({ lastSignedIn: new Date() }).where(eq(emailUsers.id, id));
}

// ─── Admin: Email User Management ───

export async function listEmailUsers(opts: {
  page: number;
  pageSize: number;
  status?: "pending" | "approved" | "rejected";
  search?: string;
}) {
  const db = await getDb();
  if (!db) return { records: [], total: 0 };

  const conditions: any[] = [];
  if (opts.status) {
    conditions.push(eq(emailUsers.status, opts.status));
  }
  if (opts.search) {
    conditions.push(
      or(
        like(emailUsers.email, `%${opts.search}%`),
        like(emailUsers.nickname, `%${opts.search}%`)
      )
    );
  }

  const whereClause = conditions.length > 0
    ? and(...conditions)
    : undefined;

  const [records, totalResult] = await Promise.all([
    whereClause
      ? db.select().from(emailUsers).where(whereClause).orderBy(desc(emailUsers.createdAt)).limit(opts.pageSize).offset((opts.page - 1) * opts.pageSize)
      : db.select().from(emailUsers).orderBy(desc(emailUsers.createdAt)).limit(opts.pageSize).offset((opts.page - 1) * opts.pageSize),
    whereClause
      ? db.select({ count: count() }).from(emailUsers).where(whereClause)
      : db.select({ count: count() }).from(emailUsers),
  ]);

  // Strip passwordHash from results
  const safeRecords = records.map(({ passwordHash, ...rest }) => rest);

  return { records: safeRecords, total: totalResult[0]?.count || 0 };
}

export async function updateEmailUserStatus(id: number, status: "approved" | "rejected"): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(emailUsers).set({ status }).where(eq(emailUsers.id, id));
}

export async function updateEmailUserRole(id: number, role: "user" | "admin"): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(emailUsers).set({ role }).where(eq(emailUsers.id, id));
}

export async function deleteEmailUser(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(emailUsers).where(eq(emailUsers.id, id));
}

export async function getEmailUserStats() {
  const db = await getDb();
  if (!db) return { total: 0, pending: 0, approved: 0, rejected: 0 };

  const [totalResult, pendingResult, approvedResult, rejectedResult] = await Promise.all([
    db.select({ count: count() }).from(emailUsers),
    db.select({ count: count() }).from(emailUsers).where(eq(emailUsers.status, "pending")),
    db.select({ count: count() }).from(emailUsers).where(eq(emailUsers.status, "approved")),
    db.select({ count: count() }).from(emailUsers).where(eq(emailUsers.status, "rejected")),
  ]);

  return {
    total: totalResult[0]?.count || 0,
    pending: pendingResult[0]?.count || 0,
    approved: approvedResult[0]?.count || 0,
    rejected: rejectedResult[0]?.count || 0,
  };
}

// ─── File Upload Tracking ───

export async function recordFileUpload(record: InsertFileUpload) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot record file upload: database not available");
    return;
  }
  try {
    await db.insert(fileUploads).values(record);
  } catch (error) {
    console.error("[Database] Failed to record file upload:", error);
  }
}

export async function updateFileUploadPreview(id: number, success: boolean, errorMessage?: string) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.update(fileUploads)
      .set({ previewSuccess: success, errorMessage: errorMessage || null })
      .where(eq(fileUploads.id, id));
  } catch (error) {
    console.error("[Database] Failed to update file upload preview:", error);
  }
}

export async function getFileUploads(opts: { page: number; pageSize: number; category?: string; isSupported?: boolean }) {
  const db = await getDb();
  if (!db) return { records: [], total: 0 };

  const conditions: any[] = [];
  if (opts.category) conditions.push(eq(fileUploads.category, opts.category));
  if (opts.isSupported !== undefined) conditions.push(eq(fileUploads.isSupported, opts.isSupported));

  const whereClause = conditions.length > 0
    ? sql`${sql.join(conditions, sql` AND `)}`
    : undefined;

  const [records, totalResult] = await Promise.all([
    whereClause
      ? db.select().from(fileUploads).where(whereClause).orderBy(desc(fileUploads.createdAt)).limit(opts.pageSize).offset((opts.page - 1) * opts.pageSize)
      : db.select().from(fileUploads).orderBy(desc(fileUploads.createdAt)).limit(opts.pageSize).offset((opts.page - 1) * opts.pageSize),
    whereClause
      ? db.select({ count: count() }).from(fileUploads).where(whereClause)
      : db.select({ count: count() }).from(fileUploads),
  ]);

  return { records, total: totalResult[0]?.count || 0 };
}

export async function getFileUploadStats() {
  const db = await getDb();
  if (!db) return { total: 0, byCategory: [], byExt: [], unsupported: [], recentUploads: [] };

  const [totalResult, byCategoryResult, byExtResult, unsupportedResult, recentResult] = await Promise.all([
    db.select({ count: count() }).from(fileUploads),
    db.select({ category: fileUploads.category, count: count() }).from(fileUploads).groupBy(fileUploads.category),
    db.select({ ext: fileUploads.fileExt, count: count() }).from(fileUploads).groupBy(fileUploads.fileExt).orderBy(desc(count())),
    db.select({ ext: fileUploads.fileExt, count: count() }).from(fileUploads).where(eq(fileUploads.isSupported, false)).groupBy(fileUploads.fileExt).orderBy(desc(count())),
    db.select().from(fileUploads).orderBy(desc(fileUploads.createdAt)).limit(20),
  ]);

  return {
    total: totalResult[0]?.count || 0,
    byCategory: byCategoryResult,
    byExt: byExtResult,
    unsupported: unsupportedResult,
    recentUploads: recentResult,
  };
}
