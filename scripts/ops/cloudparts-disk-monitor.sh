#!/usr/bin/env bash
set -euo pipefail

THRESHOLD="${THRESHOLD:-85}"
LOG_FILE="${LOG_FILE:-/www/wwwlogs/nodejs/cloudparts-disk-monitor.log}"
TARGET="${TARGET:-/}"

mkdir -p "$(dirname "$LOG_FILE")"

USAGE="$(df -P "$TARGET" | awk 'NR==2 { gsub("%", "", $5); print $5 }')"
NOW="$(date "+%Y-%m-%d %H:%M:%S")"

if [ -z "$USAGE" ]; then
  echo "[$NOW] unable to read disk usage for $TARGET" >> "$LOG_FILE"
  exit 1
fi

if [ "$USAGE" -ge "$THRESHOLD" ]; then
  echo "[$NOW] warning: disk usage ${USAGE}% on $TARGET exceeds ${THRESHOLD}%" >> "$LOG_FILE"
  exit 2
fi

echo "[$NOW] ok: disk usage ${USAGE}% on $TARGET" >> "$LOG_FILE"

