#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-openit}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3000/healthz}"
LOG_FILE="${LOG_FILE:-/www/wwwlogs/nodejs/openit-healthcheck.log}"

mkdir -p "$(dirname "$LOG_FILE")"

timestamp() {
  date "+%Y-%m-%d %H:%M:%S"
}

if curl -fsS --max-time 8 "$HEALTH_URL" >/dev/null; then
  echo "[$(timestamp)] ok $HEALTH_URL" >> "$LOG_FILE"
  exit 0
fi

echo "[$(timestamp)] health check failed, restarting $APP_NAME" >> "$LOG_FILE"

if command -v pm2 >/dev/null 2>&1; then
  pm2 restart "$APP_NAME" --update-env >> "$LOG_FILE" 2>&1 || true
else
  echo "[$(timestamp)] pm2 not found" >> "$LOG_FILE"
fi

