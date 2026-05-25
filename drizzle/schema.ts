import { bigint, boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing Manus OAuth auth flow.
 * Keep this for existing OAuth users.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Email-based users — independent from Manus OAuth.
 * Registration requires admin approval before full access.
 */
export const emailUsers = mysqlTable("email_users", {
  id: int("id").autoincrement().primaryKey(),
  /** Email address, unique per user */
  email: varchar("email", { length: 320 }).notNull().unique(),
  /** bcrypt hashed password */
  passwordHash: varchar("passwordHash", { length: 256 }).notNull(),
  /** Display name / nickname */
  nickname: varchar("nickname", { length: 128 }).notNull(),
  /** Real name */
  realName: varchar("realName", { length: 128 }),
  /** Company name */
  company: varchar("company", { length: 256 }),
  /** Phone number */
  phone: varchar("phone", { length: 32 }),
  /** Account status: pending (awaiting approval), approved, rejected */
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  /** Role: user or admin */
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  /** Total number of files uploaded (for quota tracking) */
  fileCount: int("fileCount").default(0).notNull(),
  /** Total file size in bytes (for quota tracking) */
  totalFileSize: bigint("totalFileSize", { mode: "number" }).default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn"),
});

export type EmailUser = typeof emailUsers.$inferSelect;
export type InsertEmailUser = typeof emailUsers.$inferInsert;

/**
 * User files — files uploaded by registered (approved) users.
 * These are persisted permanently (until user or admin deletes).
 * Guest uploads are NOT stored here — they are temporary and cleaned daily.
 */
export const userFiles = mysqlTable("user_files", {
  id: int("id").autoincrement().primaryKey(),
  /** Owner user ID (references emailUsers.id) */
  userId: int("userId").notNull(),
  /** Original file name */
  fileName: varchar("fileName", { length: 512 }).notNull(),
  /** File extension (lowercase, without dot) */
  fileExt: varchar("fileExt", { length: 32 }).notNull(),
  /** File size in bytes */
  fileSize: bigint("fileSize", { mode: "number" }).notNull(),
  /** MIME type */
  mimeType: varchar("mimeType", { length: 128 }),
  /** Category: '3d', 'cad', 'image', 'video', 'document' */
  category: varchar("category", { length: 32 }).notNull(),
  /** S3 storage key */
  s3Key: varchar("s3Key", { length: 1024 }).notNull(),
  /** S3 public URL */
  s3Url: text("s3Url").notNull(),
  /** Share token — unique random string for sharing */
  shareToken: varchar("shareToken", { length: 64 }).unique(),
  /** Whether sharing is enabled */
  shareEnabled: boolean("shareEnabled").default(false).notNull(),
  /** Share expiry time — defaults to 7 days after sharing is enabled */
  shareExpiresAt: timestamp("shareExpiresAt"),
  /** Whether to allow download on shared link (default: false) */
  allowDownload: boolean("allowDownload").default(false).notNull(),
  /** Thumbnail image URL (stored in S3) */
  thumbnailUrl: text("thumbnailUrl"),
  /** View count — incremented each time the file is previewed in parts gallery */
  viewCount: int("viewCount").default(0).notNull(),
  /** Download request count — incremented each time someone submits a download request */
  downloadRequestCount: int("downloadRequestCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserFile = typeof userFiles.$inferSelect;
export type InsertUserFile = typeof userFiles.$inferInsert;

/**
 * File upload records - tracks every file uploaded by users for analytics.
 * Records both supported and unsupported file formats.
 */
export const fileUploads = mysqlTable("file_uploads", {
  id: int("id").autoincrement().primaryKey(),
  fileName: varchar("fileName", { length: 512 }).notNull(),
  fileExt: varchar("fileExt", { length: 32 }).notNull(),
  fileSize: bigint("fileSize", { mode: "number" }).notNull(),
  mimeType: varchar("mimeType", { length: 128 }),
  category: varchar("category", { length: 32 }).notNull(),
  isSupported: boolean("isSupported").notNull().default(true),
  isEncrypted: boolean("isEncrypted").default(false),
  previewSuccess: boolean("previewSuccess"),
  errorMessage: text("errorMessage"),
  userAgent: text("userAgent"),
  ipAddress: varchar("ipAddress", { length: 64 }),
  userId: int("userId"),
  userName: text("userName"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FileUpload = typeof fileUploads.$inferSelect;
export type InsertFileUpload = typeof fileUploads.$inferInsert;

/**
 * Password reset tokens — generated by admin for users who forgot their password.
 * Each token has a 24-hour expiry and can only be used once.
 */
export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: int("id").autoincrement().primaryKey(),
  /** The email user requesting the reset */
  userId: int("userId").notNull(),
  /** The user's email (for lookup convenience) */
  email: varchar("email", { length: 320 }).notNull(),
  /** 6-digit reset code */
  resetCode: varchar("resetCode", { length: 16 }).notNull(),
  /** Whether this token has been used */
  used: boolean("used").default(false).notNull(),
  /** Expiry time (24 hours from creation) */
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;

/**
 * Download requests — visitors can request to download a 3D part file
 * by providing their contact information.
 */
export const downloadRequests = mysqlTable("download_requests", {
  id: int("id").autoincrement().primaryKey(),
  /** The file being requested */
  fileId: int("fileId").notNull(),
  /** Requester's email */
  email: varchar("email", { length: 320 }).notNull(),
  /** Requester's phone */
  phone: varchar("phone", { length: 32 }).notNull(),
  /** Requester's company name */
  company: varchar("company", { length: 256 }).notNull(),
  /** Requester's real name */
  realName: varchar("realName", { length: 128 }).notNull(),
  /** Optional message from requester */
  message: text("message"),
  /** Status: pending, approved, rejected */
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DownloadRequest = typeof downloadRequests.$inferSelect;
export type InsertDownloadRequest = typeof downloadRequests.$inferInsert;
