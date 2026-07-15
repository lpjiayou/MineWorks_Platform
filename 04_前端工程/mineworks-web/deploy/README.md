# MineWorks production deployment baseline

## Required files

Copy and edit:

```text
.env.production.example -> .env.production
secrets/postgres_password.txt.example -> secrets/postgres_password.txt
secrets/database_url.txt.example -> secrets/database_url.txt
```

Place TLS files here:

```text
certs/fullchain.pem
certs/privkey.pem
```

## Validate configuration

```sh
docker compose --env-file .env.production -f compose.production.yml config
```

## Build and start

```sh
docker compose --env-file .env.production -f compose.production.yml up -d --build
```

The `migrate` service runs Alembic before the API starts.

## Health

```text
https://YOUR_DOMAIN/api/v1/health
https://YOUR_DOMAIN/api/v1/ready
```

## Backup and restore

```sh
./scripts/backup-postgres.sh
./scripts/restore-postgres.sh ./backups/FILE.dump
```

Perform restore drills before accepting production data.
