@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title MineWorks - FastAPI 8000

if not exist "backend\.venv\Scripts\python.exe" (
  echo ERROR: Backend virtual environment does not exist.
  echo Run 10_INSTALL_BACKEND.cmd first.
  pause
  exit /b 1
)

echo ============================================================
echo MINEWORKS - FASTAPI DEVELOPMENT SERVER
echo API : http://127.0.0.1:8000/api/v1/health
echo DOCS: http://127.0.0.1:8000/docs
echo Keep this window open.
echo ============================================================
cd /d "%~dp0backend"
call ".venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
set "EXIT_CODE=%ERRORLEVEL%"
echo FASTAPI_STOPPED EXIT_CODE=%EXIT_CODE%
pause
exit /b %EXIT_CODE%
