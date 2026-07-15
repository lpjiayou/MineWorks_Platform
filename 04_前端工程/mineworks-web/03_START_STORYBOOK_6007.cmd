@echo off
setlocal EnableExtensions
cd /d "%~dp0"

title MineWorks - Storybook 6007

echo ============================================================
echo MINEWORKS - STORYBOOK
echo ROOT: %CD%
echo URL : http://127.0.0.1:6007
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

echo Port 6007 is used because port 6006 is occupied on this PC.
echo.
echo IMPORTANT:
echo 1. Keep this window open.
echo 2. Wait until Storybook prints Local.
echo 3. Then open http://127.0.0.1:6007
echo.

call npx storybook dev -p 6007 --host 127.0.0.1 --no-open
set "EXIT_CODE=%ERRORLEVEL%"

echo.
echo ============================================================
echo STORYBOOK_STOPPED
echo EXIT_CODE=%EXIT_CODE%
echo ============================================================
pause
exit /b %EXIT_CODE%

:FAIL
echo.
echo START_FAILED
pause
exit /b 1
