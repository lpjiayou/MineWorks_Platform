@echo off
setlocal EnableExtensions
cd /d "%~dp0"

title MineWorks - Verify Identity Authorization V0.9

echo ============================================================
echo MINEWORKS - IDENTITY AND AUTHORIZATION VERIFY V0.9
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

echo [1/7] BACKEND PYTEST
call backend\.venv\Scripts\python.exe -m pytest backend\tests
if errorlevel 1 goto :FAIL

echo.
echo [2/7] LINT
call npm run lint
if errorlevel 1 goto :FAIL

echo.
echo [3/7] TYPECHECK
call npm run typecheck
if errorlevel 1 goto :FAIL

echo.
echo [4/7] FRONTEND TESTS
call npm run test
if errorlevel 1 goto :FAIL

echo.
echo [5/7] NEXT BUILD
call npm run build
if errorlevel 1 goto :FAIL

echo.
echo [6/7] STORYBOOK BUILD
call npm run build-storybook
if errorlevel 1 goto :FAIL

echo.
echo [7/7] SECURITY FILE CHECK
if not exist "backend\app\security\passwords.py" goto :FAIL
if not exist "backend\app\security\dependencies.py" goto :FAIL
if not exist "src\features\auth\auth-provider.tsx" goto :FAIL

echo.
echo ============================================================
echo VERIFY_IDENTITY_AUTHORIZATION_OK
echo ============================================================
pause
exit /b 0

:FAIL
echo.
echo ============================================================
echo VERIFY_IDENTITY_AUTHORIZATION_FAILED
echo Capture the first error shown above.
echo ============================================================
pause
exit /b 1
