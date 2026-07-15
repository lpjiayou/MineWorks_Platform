@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title MineWorks - FastAPI PostgreSQL Development

if not exist "backend\.venv\Scripts\python.exe" (
  echo ERROR: backend virtual environment does not exist.
  echo Run 17_UPGRADE_BACKEND_DEPENDENCIES.cmd first.
  pause
  exit /b 1
)

set "MINEWORKS_ENVIRONMENT=development"
set "MINEWORKS_DATABASE_URL=postgresql+psycopg://mineworks:mineworks-dev-password@127.0.0.1:5432/mineworks"
set "MINEWORKS_AUTO_CREATE_SCHEMA=false"
set "MINEWORKS_ALLOW_BEARER_TOKENS=true"
set "MINEWORKS_COOKIE_SECURE=false"
set "MINEWORKS_ALLOW_LOCAL_BILLING_SIMULATION=true"

echo ============================================================
echo MINEWORKS - FASTAPI WITH POSTGRESQL DEVELOPMENT DATABASE
echo API : http://127.0.0.1:8000/api/v1/health
echo READY: http://127.0.0.1:8000/api/v1/ready
echo DOCS: http://127.0.0.1:8000/docs
echo Keep this window open.
echo ============================================================

pushd backend
call ".venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
set "EXIT_CODE=%ERRORLEVEL%"
popd
echo FASTAPI_POSTGRES_STOPPED EXIT_CODE=%EXIT_CODE%
pause
exit /b %EXIT_CODE%
