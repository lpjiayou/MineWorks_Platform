@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title MineWorks - Verify Dry Solids V1

echo ============================================================
echo MINEWORKS - VERIFY DRY SOLIDS FULL STACK V1
 echo ROOT: %CD%
echo ============================================================

if not exist "node_modules" (
  echo ERROR: node_modules does not exist.
  goto :FAIL
)
if not exist "backend\.venv\Scripts\python.exe" (
  echo ERROR: backend virtual environment does not exist.
  echo Run 10_INSTALL_BACKEND.cmd first.
  goto :FAIL
)

echo [1/6] FRONTEND TYPECHECK
call npm run typecheck
if errorlevel 1 goto :FAIL

echo [2/6] FRONTEND LINT
call npm run lint
if errorlevel 1 goto :FAIL

echo [3/6] FRONTEND TEST
call npm run test
if errorlevel 1 goto :FAIL

echo [4/6] BACKEND TEST
call "backend\.venv\Scripts\python.exe" -m pytest "backend\tests"
if errorlevel 1 goto :FAIL

echo [5/6] NEXT BUILD
call npm run build
if errorlevel 1 goto :FAIL

echo [6/6] STORYBOOK BUILD
call npm run build-storybook
if errorlevel 1 goto :FAIL

echo ============================================================
echo VERIFY_DRY_SOLIDS_V1_OK
echo ============================================================
pause
exit /b 0

:FAIL
echo ============================================================
echo VERIFY_DRY_SOLIDS_V1_FAILED
echo Capture the first error above.
echo ============================================================
pause
exit /b 1
