@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title MineWorks - Install FastAPI Backend

echo ============================================================
echo MINEWORKS - INSTALL FASTAPI BACKEND
echo ROOT: %CD%
echo ============================================================

where python >nul 2>&1
if errorlevel 1 (
  echo ERROR: Python was not found in PATH.
  goto :FAIL
)

if not exist "backend\requirements.txt" (
  echo ERROR: backend\requirements.txt was not found.
  goto :FAIL
)

if not exist "backend\.venv\Scripts\python.exe" (
  python -m venv "backend\.venv"
  if errorlevel 1 goto :FAIL
)

call "backend\.venv\Scripts\python.exe" -m pip install --upgrade pip
if errorlevel 1 goto :FAIL
call "backend\.venv\Scripts\python.exe" -m pip install -r "backend\requirements.txt"
if errorlevel 1 goto :FAIL

if not exist "backend\.env" if exist "backend\.env.example" copy /Y "backend\.env.example" "backend\.env" >nul
if exist ".env.example" copy /Y ".env.example" ".env.local" >nul

echo ============================================================
echo BACKEND_INSTALL_OK
echo Next: run 11_START_FASTAPI.cmd
echo ============================================================
pause
exit /b 0

:FAIL
echo ============================================================
echo BACKEND_INSTALL_FAILED
echo Capture the first error above.
echo ============================================================
pause
exit /b 1
