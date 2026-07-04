#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/www/wwwroot/openit.coriton.cn}"
NODE_BIN="${NODE_BIN:-/www/server/nodejs/v22.23.1/bin/node}"
BACKUP_DIR="${BACKUP_DIR:-/www/backup/cloudparts/openit_coriton_c}"
KEEP_DAYS="${KEEP_DAYS:-14}"

if [ ! -d "$APP_DIR" ]; then
  echo "APP_DIR does not exist: $APP_DIR" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"
cd "$APP_DIR"

eval "$("$NODE_BIN" --input-type=module <<'NODE'
import "dotenv/config";

function sh(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing");
}

const url = new URL(databaseUrl);
const dbName = url.pathname.replace(/^\//, "");
if (dbName !== "openit_coriton_c") {
  throw new Error(`Refusing to back up unexpected database: ${dbName}`);
}

console.log(`DB_HOST=${sh(url.hostname || "127.0.0.1")}`);
console.log(`DB_PORT=${sh(url.port || "3306")}`);
console.log(`DB_USER=${sh(decodeURIComponent(url.username))}`);
console.log(`DB_PASS=${sh(decodeURIComponent(url.password))}`);
console.log(`DB_NAME=${sh(dbName)}`);
NODE
)"

OUT_FILE="$BACKUP_DIR/openit_coriton_c_$(date +%Y%m%d_%H%M%S).sql.gz"

MYSQL_PWD="$DB_PASS" mysqldump \
  --single-transaction \
  --quick \
  --no-tablespaces \
  --routines \
  --triggers \
  -h "$DB_HOST" \
  -P "$DB_PORT" \
  -u "$DB_USER" \
  "$DB_NAME" | gzip -9 > "$OUT_FILE"

find "$BACKUP_DIR" -type f -name "openit_coriton_c_*.sql.gz" -mtime +"$KEEP_DAYS" -delete

echo "Created database backup: $OUT_FILE"
