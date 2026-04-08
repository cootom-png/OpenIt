import { bigint, boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
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
 * File upload records - tracks every file uploaded by users for analytics.
 * Records both supported and unsupported file formats.
 */
export const fileUploads = mysqlTable("file_uploads", {
  id: int("id").autoincrement().primaryKey(),
  /** File name as uploaded by the user */
  fileName: varchar("fileName", { length: 512 }).notNull(),
  /** File extension (lowercase, without dot), e.g. 'stp', 'dwg', 'pdf' */
  fileExt: varchar("fileExt", { length: 32 }).notNull(),
  /** File size in bytes */
  fileSize: bigint("fileSize", { mode: "number" }).notNull(),
  /** MIME type if available */
  mimeType: varchar("mimeType", { length: 128 }),
  /** Category: '3d', 'cad', 'image', 'video', 'document', 'unknown' */
  category: varchar("category", { length: 32 }).notNull(),
  /** Whether this format is supported by our viewer */
  isSupported: boolean("isSupported").notNull().default(true),
  /** Whether the file was successfully previewed (parsed without error) */
  previewSuccess: boolean("previewSuccess"),
  /** Error message if preview failed */
  errorMessage: text("errorMessage"),
  /** User agent string for device/browser analytics */
  userAgent: text("userAgent"),
  /** IP address (anonymized) for geographic analytics */
  ipAddress: varchar("ipAddress", { length: 64 }),
  /** Logged-in user ID (nullable for anonymous uploads) */
  userId: int("userId"),
  /** User name if logged in */
  userName: text("userName"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FileUpload = typeof fileUploads.$inferSelect;
export type InsertFileUpload = typeof fileUploads.$inferInsert;