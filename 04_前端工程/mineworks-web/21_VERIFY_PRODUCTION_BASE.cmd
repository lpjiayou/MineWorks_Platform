@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title MineWorks - Verify PostgreSQL Session Security Production Base V1.1

echo ============================================================
echo MINEWORKS - VERIFY PRODUCTION BASE V1.1
echo ROOT: %CD%
echo ============================================================
echo.

if not exist "node_modules" (
  echo ERROR: node_modules does not exist.
  goto :FAIL
)
if not exist "backend\.venv\Scripts\python.exe" (
  echo ERROR: backend virtual environment does not exist.
  goto :FAIL
)

call "backend\.venv\Scripts\python.exe" -c "import sqlalchemy,alembic,psycopg,argon2"
if errorlevel 1 (
  echo ERROR: V1.1 backend dependencies are missing.
  echo Run 17_UPGRADE_BACKEND_DEPENDENCIES.cmd first.
  goto :FAIL
)

echo [1/10] BACKEND COMPILE
call "backend\.venv\Scripts\python.exe" -m compileall -q backend\app backend\mining_core backend\scripts backend\migrations
if errorlevel 1 goto :FAIL

echo.
echo [2/10] BACKEND PYTEST
call "backend\.venv\Scripts\python.exe" -m pytest backend\tests
if errorlevel 1 goto :FAIL

echo.
echo [3/10] ALEMBIC SQLITE SMOKE TEST
set "ALEMBIC_TEST_DB=%TEMP%\mineworks_alembic_v11.db"
if exist "%ALEMBIC_TEST_DB%" del /Q "%ALEMBIC_TEST_DB%"
pushd backend
set "MINEWORKS_DATABASE_URL=sqlite:///%ALEMBIC_TEST_DB:\=/%"
set "MINEWORKS_ENVIRONMENT=test"
set "MINEWORKS_AUTO_CREATE_SCHEMA=false"
call ".venv\Scripts\python.exe" -m alembic -c alembic.ini upgrade head
if errorlevel 1 (
  popd
  goto :FAIL
)
popd
if exist "%ALEMBIC_TEST_DB%" del /Q "%ALEMBIC_TEST_DB%"

echo.
echo [4/10] PRODUCTION SETTINGS STATIC CHECK
set "MINEWORKS_ENVIRONMENT=production"
set "MINEWORKS_DATABASE_URL=postgresql+psycopg://user:password@database:5432/mineworks"
set "MINEWORKS_COOKIE_SECURE=true"
set "MINEWORKS_ALLOW_BEARER_TOKENS=false"
set "MINEWORKS_ALLOW_LOCAL_BILLING_SIMULATION=false"
set "MINEWORKS_AUTO_CREATE_SCHEMA=false"
pushd backend
call ".venv\Scripts\python.exe" -m scripts.check_production_config --skip-database
if errorlevel 1 (
  popd
  goto :FAIL
)
popd
set "MINEWORKS_ENVIRONMENT="
set "MINEWORKS_DATABASE_URL="
set "MINEWORKS_COOKIE_SECURE="
set "MINEWORKS_ALLOW_BEARER_TOKENS="
set "MINEWORKS_ALLOW_LOCAL_BILLING_SIMULATION="
set "MINEWORKS_AUTO_CREATE_SCHEMA="

echo.
echo [5/10] LINT
call npm run lint
if errorlevel 1 goto :FAIL

echo.
echo [6/10] TYPECHECK
call npm run typecheck
if errorlevel 1 goto :FAIL

echo.
echo [7/10] FRONTEND TESTS
call npm run test
if errorlevel 1 goto :FAIL

echo.
echo [8/10] NEXT BUILD
call npm run build
if errorlevel 1 goto :FAIL

echo.
echo [9/10] STORYBOOK BUILD
call npm run build-storybook
if errorlevel 1 goto :FAIL

echo.
echo [10/10] PRODUCTION FILE CHECK
if not exist "backend\alembic.ini" goto :FAIL
if not exist "backend\migrations\versions\20260714_0001_production_baseline.py" goto :FAIL
if not exist "deploy\compose.production.yml" goto :FAIL
if not exist "deploy\nginx\default.conf.template" goto :FAIL
if not exist "Dockerfile.web" goto :FAIL
if not exist "backend\Dockerfile" goto :FAIL

where docker >nul 2>&1
if errorlevel 1 (
  echo Docker was not found. Container smoke test skipped.
) else (
  docker compose -f "deploy\compose.postgres-dev.yml" config >nul
  if errorlevel 1 goto :FAIL
)

echo.
echo ============================================================
echo VERIFY_PRODUCTION_BASE_V11_OK
echo ============================================================
pause
exit /b 0

:FAIL
echo.
echo ============================================================
echo VERIFY_PRODUCTION_BASE_V11_FAILED
echo Capture the first error shown above.
echo ============================================================
pause
exit /b 1
