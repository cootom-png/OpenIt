import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

async function run() {
  const conn = await mysql.createConnection(DATABASE_URL);
  try {
    // Check if column already exists
    const [cols] = await conn.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'user_files' AND COLUMN_NAME = 'thumbnailUrl'"
    );
    if (Array.isArray(cols) && cols.length > 0) {
      console.log("Column thumbnailUrl already exists, skipping.");
    } else {
      await conn.execute("ALTER TABLE `user_files` ADD `thumbnailUrl` text;");
      console.log("Column thumbnailUrl added successfully.");
    }
  } finally {
    await conn.end();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
