@echo off
setlocal EnableExtensions
cd /d "%~dp0"

title MineWorks - Verify Project

echo ============================================================
echo MINEWORKS - PROJECT VERIFICATION
echo ROOT: %CD%
echo ============================================================
echo.

if not exist "node_modules" (
  echo ERROR: node_modules does not exist.
  echo Run 01_INSTALL_DEPENDENCIES.cmd first.
  goto :FAIL
)

echo [1/4] LINT
call npm run lint
if errorlevel 1 goto :FAIL

echo.
echo [2/4] TYPECHECK
call npm run typecheck
if errorlevel 1 goto :FAIL

echo.
echo [3/4] TEST
call npm run test
if errorlevel 1 goto :FAIL

echo.
echo [4/4] BUILD
call npm run build
if errorlevel 1 goto :FAIL

echo.
echo ============================================================
echo VERIFY_OK
echo ============================================================
pause
exit /b 0

:FAIL
echo.
echo ============================================================
echo VERIFY_FAILED
echo Capture the first error shown above.
echo ============================================================
pause
exit /b 1
