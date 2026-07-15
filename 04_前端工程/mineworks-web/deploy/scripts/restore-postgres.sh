#!/bin/sh
set -eu
if [ "$#" -ne 1 ]; then echo "Usage: $0 backup.dump"; exit 2; fi
BACKUP=$(cd "$(dirname "$1")" && pwd)/$(basename "$1")
cd "$(dirname "$0")/.."
set -a
. ./.env.production
set +a
docker compose --env-file .env.production -f compose.production.yml exec -T postgres \
  pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner --no-privileges < "$BACKUP"
echo "Restore completed: $BACKUP"
