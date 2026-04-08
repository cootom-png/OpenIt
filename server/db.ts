import { eq, desc, sql, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, InsertFileUpload, users, fileUploads } from "../drizzle/schema";
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
