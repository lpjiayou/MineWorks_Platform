@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title MineWorks - Migrate SQLite to PostgreSQL Dev

set "PG_URL=postgresql+psycopg://mineworks:mineworks-dev-password@127.0.0.1:5432/mineworks"

echo ============================================================
echo MINEWORKS - SQLITE TO POSTGRESQL DEVELOPMENT MIGRATION
echo WARNING: Target development database data will be replaced.
echo Browser sessions are intentionally not copied.
echo ============================================================
echo.

if not exist "backend\.venv\Scripts\python.exe" (
  echo ERROR: backend virtual environment does not exist.
  echo Run 17_UPGRADE_BACKEND_DEPENDENCIES.cmd first.
  goto :FAIL
)
if not exist "backend\data\mineworks.db" (
  echo ERROR: backend\data\mineworks.db was not found.
  goto :FAIL
)

where docker >nul 2>&1
if errorlevel 1 goto :FAIL
docker compose -f "deploy\compose.postgres-dev.yml" exec -T postgres pg_isready -U mineworks -d mineworks >nul 2>&1
if errorlevel 1 (
  echo ERROR: PostgreSQL development container is not ready.
  echo Run 18_START_POSTGRES_DEV.cmd first.
  goto :FAIL
)

if not exist "backend\data\migration_backups" mkdir "backend\data\migration_backups"
for /f "tokens=1-4 delims=/ " %%a in ("%date%") do set "DATE_STAMP=%%a%%b%%c%%d"
for /f "tokens=1-3 delims=:., " %%a in ("%time%") do set "TIME_STAMP=%%a%%b%%c"
set "TIME_STAMP=%TIME_STAMP: =0%"
copy /Y "backend\data\mineworks.db" "backend\data\migration_backups\mineworks_before_pg_%DATE_STAMP%_%TIME_STAMP%.db" >nul
if errorlevel 1 goto :FAIL

pushd backend
set "MINEWORKS_ENVIRONMENT=development"
set "MINEWORKS_DATABASE_URL=%PG_URL%"
set "MINEWORKS_AUTO_CREATE_SCHEMA=false"
call ".venv\Scripts\python.exe" -m alembic -c alembic.ini upgrade head
if errorlevel 1 (
  popd
  goto :FAIL
)
call ".venv\Scripts\python.exe" -m scripts.migrate_sqlite_to_postgres --sqlite data\mineworks.db --postgres-url "%PG_URL%" --truncate-target
if errorlevel 1 (
  popd
  goto :FAIL
)
popd

echo.
echo ============================================================
echo SQLITE_TO_POSTGRES_DEV_MIGRATION_OK
echo Next: run 20_START_FASTAPI_POSTGRES_DEV.cmd
echo ============================================================
pause
exit /b 0

:FAIL
echo.
echo ============================================================
echo SQLITE_TO_POSTGRES_DEV_MIGRATION_FAILED
echo The original SQLite database was not deleted.
echo ============================================================
pause
exit /b 1
