@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title MineWorks UI P0 Batch 2 Verification

echo ============================================================
echo MINEWORKS UI P0 BATCH 2 VERIFICATION

echo [1/5] LINT
call npm run lint
if errorlevel 1 goto :FAIL

echo [2/5] TYPECHECK
call npm run typecheck
if errorlevel 1 goto :FAIL

echo [3/5] TEST
call npm run test
if errorlevel 1 goto :FAIL

echo [4/5] NEXT BUILD
call npm run build
if errorlevel 1 goto :FAIL

echo [5/5] STORYBOOK BUILD
call npm run build-storybook
if errorlevel 1 goto :FAIL

echo ============================================================
echo VERIFY_P0_BATCH2_OK
pause
exit /b 0

:FAIL
echo ============================================================
echo VERIFY_P0_BATCH2_FAILED
pause
exit /b 1
