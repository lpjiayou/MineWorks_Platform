@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title MineWorks - PostgreSQL Development Database

echo ============================================================
echo MINEWORKS - START POSTGRESQL DEVELOPMENT DATABASE
echo URL: postgresql://mineworks@127.0.0.1:5432/mineworks
echo ============================================================
echo.

where docker >nul 2>&1
if errorlevel 1 (
  echo ERROR: Docker Desktop was not found in PATH.
  echo Install and start Docker Desktop, then run this file again.
  goto :FAIL
)

docker compose version
if errorlevel 1 goto :FAIL

docker compose -f "deploy\compose.postgres-dev.yml" up -d
if errorlevel 1 goto :FAIL

echo.
echo Waiting for PostgreSQL health check ...
for /L %%I in (1,1,30) do (
  docker compose -f "deploy\compose.postgres-dev.yml" exec -T postgres pg_isready -U mineworks -d mineworks >nul 2>&1
  if not errorlevel 1 goto :READY
  timeout /t 2 /nobreak >nul
)

echo ERROR: PostgreSQL did not become ready in time.
docker compose -f "deploy\compose.postgres-dev.yml" ps
goto :FAIL

:READY
echo.
docker compose -f "deploy\compose.postgres-dev.yml" ps
echo ============================================================
echo POSTGRES_DEV_READY
echo Next: run 19_MIGRATE_SQLITE_TO_POSTGRES_DEV.cmd
echo ============================================================
pause
exit /b 0

:FAIL
echo.
echo POSTGRES_DEV_START_FAILED
pause
exit /b 1
