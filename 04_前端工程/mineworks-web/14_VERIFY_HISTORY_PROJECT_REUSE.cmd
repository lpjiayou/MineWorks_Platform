@echo off
setlocal EnableExtensions
cd /d "%~dp0"

title MineWorks - Verify History Project Reuse V0.8

echo ============================================================
echo MINEWORKS - VERIFY HISTORY PROJECT REUSE V0.8
echo ROOT: %CD%
echo ============================================================
echo.

if not exist "node_modules" (
  echo ERROR: node_modules does not exist.
  echo Run 01_INSTALL_DEPENDENCIES.cmd first.
  goto :FAIL
)

if not exist "backend\.venv\Scripts\python.exe" (
  echo ERROR: backend virtual environment does not exist.
  echo Run 10_INSTALL_BACKEND.cmd first.
  goto :FAIL
)

echo [1/7] TYPECHECK
call npm run typecheck
if errorlevel 1 goto :FAIL

echo.
echo [2/7] LINT
call npm run lint
if errorlevel 1 goto :FAIL

echo.
echo [3/7] FRONTEND TESTS
call npm run test
if errorlevel 1 goto :FAIL

echo.
echo [4/7] BACKEND TESTS
pushd backend
call ".venv\Scripts\python.exe" -m pytest -q
if errorlevel 1 (
  popd
  goto :FAIL
)
popd

echo.
echo [5/7] NEXT BUILD
call npm run build
if errorlevel 1 goto :FAIL

echo.
echo [6/7] STORYBOOK BUILD
call npm run build-storybook
if errorlevel 1 goto :FAIL

echo.
echo [7/7] SQLITE SCHEMA CHECK
pushd backend
call ".venv\Scripts\python.exe" -c "from app.database import initialize_database; initialize_database(); print('SQLITE_SCHEMA_OK')"
if errorlevel 1 (
  popd
  goto :FAIL
)
popd

echo.
echo ============================================================
echo VERIFY_HISTORY_PROJECT_REUSE_OK
echo ============================================================
echo Start services:
echo   11_START_FASTAPI.cmd
echo   02_START_NEXTJS.cmd
echo   03_START_STORYBOOK_6007.cmd
pause
exit /b 0

:FAIL
echo.
echo ============================================================
echo VERIFY_HISTORY_PROJECT_REUSE_FAILED
echo Capture the first error shown above.
echo ============================================================
pause
exit /b 1
