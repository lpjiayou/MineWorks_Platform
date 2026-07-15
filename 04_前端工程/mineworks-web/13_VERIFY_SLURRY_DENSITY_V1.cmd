@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title MineWorks - Verify Slurry Density V1

echo ============================================================
echo MINEWORKS - VERIFY SLURRY DENSITY FULL STACK V1
echo ROOT: %CD%
echo ============================================================

if not exist "node_modules" goto :FAIL
if not exist "backend\.venv\Scripts\python.exe" goto :FAIL

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
echo VERIFY_SLURRY_DENSITY_V1_OK
echo ============================================================
pause
exit /b 0
:FAIL
echo ============================================================
echo VERIFY_SLURRY_DENSITY_V1_FAILED
echo Capture the first error above.
echo ============================================================
pause
exit /b 1
