@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title MineWorks - Upgrade Backend Dependencies V1.1

echo ============================================================
echo MINEWORKS - UPGRADE BACKEND DEPENDENCIES V1.1
echo ROOT: %CD%
echo ============================================================
echo.

if not exist "backend\requirements.txt" (
  echo ERROR: backend\requirements.txt was not found.
  goto :FAIL
)
if not exist "backend\.venv\Scripts\python.exe" (
  echo Backend virtual environment was not found.
  echo Creating backend\.venv ...
  where python >nul 2>&1
  if errorlevel 1 goto :FAIL
  python -m venv "backend\.venv"
  if errorlevel 1 goto :FAIL
)

call "backend\.venv\Scripts\python.exe" -m pip install --upgrade pip
if errorlevel 1 goto :FAIL
call "backend\.venv\Scripts\python.exe" -m pip install -r "backend\requirements.txt"
if errorlevel 1 goto :FAIL

call "backend\.venv\Scripts\python.exe" -c "import sqlalchemy,alembic,psycopg,argon2; print('SQLAlchemy',sqlalchemy.__version__); print('Alembic',alembic.__version__); print('psycopg',psycopg.__version__)"
if errorlevel 1 goto :FAIL

if not exist "backend\.env" if exist "backend\.env.example" copy /Y "backend\.env.example" "backend\.env" >nul

echo.
echo ============================================================
echo BACKEND_DEPENDENCIES_V11_OK
echo ============================================================
pause
exit /b 0

:FAIL
echo.
echo ============================================================
echo BACKEND_DEPENDENCIES_V11_FAILED
echo Capture the first error shown above.
echo ============================================================
pause
exit /b 1
