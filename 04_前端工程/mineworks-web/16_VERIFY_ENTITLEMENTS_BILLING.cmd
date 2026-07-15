@echo off
setlocal EnableExtensions
cd /d "%~dp0"

title MineWorks - Verify Entitlements Billing V1.0

echo ============================================================
echo MINEWORKS - ENTITLEMENTS AND BILLING VERIFY V1.0
echo ROOT: %CD%
echo ============================================================
echo.

if not exist "node_modules" (
  echo ERROR: node_modules does not exist.
  goto :FAIL
)
if not exist "backend\.venv\Scripts\python.exe" (
  echo ERROR: backend virtual environment does not exist.
  goto :FAIL
)

echo [1/8] BACKEND COMPILE
call backend\.venv\Scripts\python.exe -m compileall -q backend\app backend\mining_core
if errorlevel 1 goto :FAIL

echo.
echo [2/8] BACKEND PYTEST
call backend\.venv\Scripts\python.exe -m pytest backend\tests
if errorlevel 1 goto :FAIL

echo.
echo [3/8] LINT
call npm run lint
if errorlevel 1 goto :FAIL

echo.
echo [4/8] TYPECHECK
call npm run typecheck
if errorlevel 1 goto :FAIL

echo.
echo [5/8] FRONTEND TESTS
call npm run test
if errorlevel 1 goto :FAIL

echo.
echo [6/8] NEXT BUILD
call npm run build
if errorlevel 1 goto :FAIL

echo.
echo [7/8] STORYBOOK BUILD
call npm run build-storybook
if errorlevel 1 goto :FAIL

echo.
echo [8/8] BILLING FILE CHECK
if not exist "backend\app\services\entitlement_service.py" goto :FAIL
if not exist "backend\app\api\v1\routes\billing.py" goto :FAIL
if not exist "src\features\billing\billing-page.tsx" goto :FAIL
if not exist "src\app\pricing\page.tsx" goto :FAIL
if not exist "src\app\billing\page.tsx" goto :FAIL

echo.
echo ============================================================
echo VERIFY_ENTITLEMENTS_BILLING_OK
echo ============================================================
pause
exit /b 0

:FAIL
echo.
echo ============================================================
echo VERIFY_ENTITLEMENTS_BILLING_FAILED
echo Capture the first error shown above.
echo ============================================================
pause
exit /b 1
