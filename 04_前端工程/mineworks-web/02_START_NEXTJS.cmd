@echo off
setlocal EnableExtensions
cd /d "%~dp0"

title MineWorks - Next.js Dev Server

echo ============================================================
echo MINEWORKS - NEXT.JS DEV SERVER
echo ROOT: %CD%
echo URL : http://127.0.0.1:3000
echo ============================================================
echo.

if not exist "package.json" (
  echo ERROR: package.json was not found.
  goto :FAIL
)

if not exist "node_modules" (
  echo ERROR: node_modules does not exist.
  echo Run 01_INSTALL_DEPENDENCIES.cmd first.
  goto :FAIL
)

echo IMPORTANT:
echo 1. Keep this window open.
echo 2. Wait until Next.js prints Ready.
echo 3. Then open http://127.0.0.1:3000
echo.

call npm run dev -- --hostname 127.0.0.1 --port 3000
set "EXIT_CODE=%ERRORLEVEL%"

echo.
echo ============================================================
echo NEXTJS_STOPPED
echo EXIT_CODE=%EXIT_CODE%
echo The website is unavailable after this process stops.
echo ============================================================
pause
exit /b %EXIT_CODE%

:FAIL
echo.
echo START_FAILED
pause
exit /b 1
