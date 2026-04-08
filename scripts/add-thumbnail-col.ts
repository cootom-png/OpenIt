import { getDb } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  const db = await getDb();
  try {
    // Check if column exists
    const result = await db.execute(sql`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'user_files' AND COLUMN_NAME = 'thumbnailUrl'
    `);
    const rows = Array.isArray(result) ? result[0] : result;
    if (Array.isArray(rows) && rows.length > 0) {
      console.log("Column thumbnailUrl already exists, skipping.");
    } else {
      await db.execute(sql`ALTER TABLE user_files ADD thumbnailUrl text`);
      console.log("Column thumbnailUrl added successfully.");
    }
  } catch (e: any) {
    if (e.message?.includes("Duplicate column")) {
      console.log("Column already exists (duplicate).");
    } else {
      throw e;
    }
  }
  process.exit(0);
}

main();
