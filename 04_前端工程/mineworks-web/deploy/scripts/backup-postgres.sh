#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
set -a
. ./.env.production
set +a
mkdir -p ./backups
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
TARGET="./backups/mineworks_${STAMP}.dump"
docker compose --env-file .env.production -f compose.production.yml exec -T postgres \
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc --no-owner --no-privileges > "$TARGET"
echo "Backup written: $TARGET"
