# OpenIt Deployment

This repository uses `openit` as the canonical production name.

## Production Runtime

- Domain: `openit.cc`, `www.openit.cc`
- Server: `129.121.117.208`
- SSH port: `88`
- Project directory: `/www/wwwroot/openit.cc`
- Runtime manager: PM2
- PM2 process name: `openit`
- Start file: `dist/index.js`
- Node.js: `/www/server/nodejs/v24.18.0/bin/node`
- App port: `3000`
- Health check: `https://www.openit.cc/healthz`
- Nginx proxy: `openit.cc` -> `127.0.0.1:3000`

## Historical Names

- `cloudparts`: previous project and ops script name.
- `openit_cc`: BaoTa/BT Panel project record name.

These names refer to the same application lineage. The active production process is `openit`.

Do not start the old `openit_cc` BT Panel Node project while PM2 `openit` is running. The BT record was configured with a different port and previously failed with an invalid `PORT=3001` startup invocation.

## GitHub Deployment

Production releases should use the `Deploy OpenIt` GitHub Actions workflow.

Required Environment: `production-openit-cc`

Required secrets:

- `OPENIT_DEPLOY_HOST`
- `OPENIT_DEPLOY_PORT`
- `OPENIT_DEPLOY_USER`
- `OPENIT_DEPLOY_SSH_KEY`
- `OPENIT_DEPLOY_KNOWN_HOSTS`
- `OPENIT_WEB_ROOT`

The workflow requires a 40-character `release_sha`, verifies that it is the current `origin/main`, builds on GitHub, uploads the release package to the server, restarts PM2 `openit`, writes `.deploy-sha`, and checks `/healthz`.

## Manual Restart

Manual commands are for emergency recovery or bootstrap only. Run them from the project directory:

```bash
cd /www/wwwroot/openit.cc
pnpm install
pnpm build
/www/server/nodejs/v24.18.0/bin/pm2 restart openit --update-env
/www/server/nodejs/v24.18.0/bin/pm2 save
curl -fsS https://www.openit.cc/healthz
```

The health check should return:

```json
{"ok":true,"service":"openit"}
```

## Ops Scripts

The scripts in `scripts/ops/` use the `openit` name and the `/www/wwwroot/openit.cc` path by default:

- `install-openit-ops.sh`
- `openit-healthcheck.sh`
- `openit-backup-db.sh`
- `openit-disk-monitor.sh`
- `openit-logrotate.conf`
