@echo off
setlocal EnableExtensions
cd /d "%~dp0"

title MineWorks UI - Verify P0 Batch 1

echo ============================================================
echo MINEWORKS UI V0.2 - VERIFY P0 BATCH 1
echo ROOT: %CD%
echo ============================================================
echo.

if not exist "node_modules" (
  echo ERROR: node_modules does not exist.
  echo Run 01_INSTALL_DEPENDENCIES.cmd first.
  goto :FAIL
)

echo [1/5] LINT
call npm run lint
if errorlevel 1 goto :FAIL

echo.
echo [2/5] TYPECHECK
call npm run typecheck
if errorlevel 1 goto :FAIL

echo.
echo [3/5] TEST
call npm run test
if errorlevel 1 goto :FAIL

echo.
echo [4/5] NEXT BUILD
call npm run build
if errorlevel 1 goto :FAIL

echo.
echo [5/5] STORYBOOK BUILD
call npm run build-storybook
if errorlevel 1 goto :FAIL

echo.
echo ============================================================
echo VERIFY_P0_BATCH1_OK
echo ============================================================
pause
exit /b 0

:FAIL
echo.
echo ============================================================
echo VERIFY_P0_BATCH1_FAILED
echo Capture the first error above.
echo ============================================================
pause
exit /b 1
