@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo ============================================================
echo MINEWORKS - INSTALL DEPENDENCIES
echo ROOT: %CD%
echo ============================================================
echo.

if not exist "package.json" (
  echo ERROR: package.json was not found.
  echo Put this CMD file in the mineworks-web root folder.
  goto :FAIL
)

where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js was not found in PATH.
  goto :FAIL
)

where npm >nul 2>&1
if errorlevel 1 (
  echo ERROR: npm was not found in PATH.
  goto :FAIL
)

echo Node:
node -v
echo npm:
call npm -v
echo.

echo Running npm install...
echo This may take several minutes.
echo.
call npm install
if errorlevel 1 goto :FAIL

if not exist "node_modules" (
  echo ERROR: npm install finished but node_modules was not created.
  goto :FAIL
)

if exist ".env.example" (
  if not exist ".env.local" copy /Y ".env.example" ".env.local" >nul
)

echo.
echo ============================================================
echo INSTALL_OK
echo Next: run 02_START_NEXTJS.cmd
echo ============================================================
pause
exit /b 0

:FAIL
echo.
echo ============================================================
echo INSTALL_FAILED
echo Keep this window open and capture the first ERROR above.
echo ============================================================
pause
exit /b 1
