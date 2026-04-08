/**
 * Cleanup module — handles periodic cleanup of guest temporary file upload records.
 *
 * Guest uploads are tracked in the `file_uploads` table for analytics purposes.
 * Unlike registered user files (stored in `user_files` with S3 persistence),
 * guest uploads are only metadata records — the actual files are not persisted on S3.
 *
 * This module:
 * 1. Deletes old guest upload records (file_uploads where userId IS NULL) older than 7 days
 * 2. Runs automatically on a weekly schedule via setInterval
 * 3. Can also be triggered manually via the admin API
 */

import { sql, isNull, and, lt, count } from "drizzle-orm";
import { fileUploads } from "../drizzle/schema";
import { getDb } from "./db";

// ─── Cleanup Logic ───

/**
 * Clean up guest (anonymous) file upload records older than the specified number of days.
 * Returns the number of records deleted.
 */
export async function cleanupGuestUploadRecords(olderThanDays: number = 7): Promise<{
  deletedCount: number;
  timestamp: Date;
  error?: string;
}> {
  const timestamp = new Date();
  const db = await getDb();
  if (!db) {
    console.warn("[Cleanup] Database not available, skipping cleanup");
    return { deletedCount: 0, timestamp, error: "Database not available" };
  }

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    // Count records to be deleted (for logging)
    const countResult = await db
      .select({ count: count() })
      .from(fileUploads)
      .where(
        and(
          isNull(fileUploads.userId),
          lt(fileUploads.createdAt, cutoffDate)
        )
      );

    const toDelete = countResult[0]?.count || 0;

    if (toDelete === 0) {
      console.log(`[Cleanup] No guest upload records older than ${olderThanDays} days found. Nothing to clean.`);
      return { deletedCount: 0, timestamp };
    }

    // Delete old guest upload records
    await db
      .delete(fileUploads)
      .where(
        and(
          isNull(fileUploads.userId),
          lt(fileUploads.createdAt, cutoffDate)
        )
      );

    console.log(`[Cleanup] Successfully deleted ${toDelete} guest upload records older than ${olderThanDays} days.`);
    return { deletedCount: toDelete, timestamp };
  } catch (error: any) {
    console.error("[Cleanup] Failed to clean up guest upload records:", error);
    return { deletedCount: 0, timestamp, error: error.message || "Unknown error" };
  }
}

// ─── Scheduled Task ───

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Start the weekly cleanup scheduler.
 * Runs immediately on first call, then every 7 days.
 */
export function startCleanupScheduler(): void {
  if (cleanupTimer) {
    console.log("[Cleanup] Scheduler already running, skipping duplicate start.");
    return;
  }

  console.log("[Cleanup] Starting weekly guest file cleanup scheduler.");

  // Run first cleanup after a short delay (30 seconds after server start)
  setTimeout(async () => {
    console.log("[Cleanup] Running initial cleanup check...");
    const result = await cleanupGuestUploadRecords(7);
    console.log(`[Cleanup] Initial cleanup complete: ${result.deletedCount} records deleted.`);
  }, 30_000);

  // Schedule weekly cleanup
  cleanupTimer = setInterval(async () => {
    console.log("[Cleanup] Running scheduled weekly cleanup...");
    const result = await cleanupGuestUploadRecords(7);
    console.log(`[Cleanup] Weekly cleanup complete: ${result.deletedCount} records deleted.`);
  }, ONE_WEEK_MS);

  // Prevent the timer from keeping the process alive
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }
}

/**
 * Stop the cleanup scheduler.
 */
export function stopCleanupScheduler(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
    console.log("[Cleanup] Scheduler stopped.");
  }
}
