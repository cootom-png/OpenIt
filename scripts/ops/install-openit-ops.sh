#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/www/wwwroot/openit.cc}"
NODE_DIR="${NODE_DIR:-/www/server/nodejs/v24.18.0/bin}"
APP_NAME="${APP_NAME:-openit}"
RUN_USER="${RUN_USER:-www}"
RUN_GROUP="${RUN_GROUP:-www}"
LOG_DIR="${LOG_DIR:-/www/wwwlogs/nodejs}"
BACKUP_DIR="${BACKUP_DIR:-/www/backup/openit/openit_coriton_c}"

if [ "$(id -u)" -ne 0 ]; then
  echo "Run as root." >&2
  exit 1
fi

if [ ! -f "$APP_DIR/ecosystem.config.cjs" ]; then
  echo "Not an OpenIt app directory: $APP_DIR" >&2
  exit 1
fi

if ! grep -q "openit_coriton_c" "$APP_DIR/.env"; then
  echo "Refusing to continue: .env does not reference openit_coriton_c" >&2
  exit 1
fi

export PATH="$NODE_DIR:$PATH"
export NODE_INTERPRETER="$NODE_DIR/node"
export PM2_RUN_USER="$RUN_USER"
export PM2_RUN_GROUP="$RUN_GROUP"
export PM2_LOG_DIR="$LOG_DIR"

mkdir -p "$LOG_DIR" "$BACKUP_DIR" /usr/local/openit/bin
chown -R "$RUN_USER:$RUN_GROUP" "$APP_DIR" "$LOG_DIR"

install -m 0755 "$APP_DIR/scripts/ops/openit-healthcheck.sh" /usr/local/openit/bin/openit-healthcheck.sh
install -m 0755 "$APP_DIR/scripts/ops/openit-backup-db.sh" /usr/local/openit/bin/openit-backup-db.sh
install -m 0755 "$APP_DIR/scripts/ops/openit-disk-monitor.sh" /usr/local/openit/bin/openit-disk-monitor.sh
install -m 0644 "$APP_DIR/scripts/ops/openit-logrotate.conf" /etc/logrotate.d/openit

if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 reload "$APP_NAME" --update-env
else
  pm2 start "$APP_DIR/ecosystem.config.cjs" --update-env
fi
pm2 save
pm2 startup systemd -u root --hp /root >/tmp/openit-pm2-startup.log 2>&1 || true

cat >/etc/cron.d/openit <<CRON
SHELL=/bin/bash
PATH=$NODE_DIR:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
*/5 * * * * root APP_NAME=$APP_NAME HEALTH_URL=http://127.0.0.1:3000/healthz LOG_FILE=$LOG_DIR/openit-healthcheck.log /usr/local/openit/bin/openit-healthcheck.sh
15 3 * * * root APP_DIR=$APP_DIR NODE_BIN=$NODE_DIR/node BACKUP_DIR=$BACKUP_DIR /usr/local/openit/bin/openit-backup-db.sh >> $LOG_DIR/openit-backup.log 2>&1
*/15 * * * * root THRESHOLD=85 LOG_FILE=$LOG_DIR/openit-disk-monitor.log /usr/local/openit/bin/openit-disk-monitor.sh
CRON

chmod 0644 /etc/cron.d/openit

echo "OpenIt ops installed."
