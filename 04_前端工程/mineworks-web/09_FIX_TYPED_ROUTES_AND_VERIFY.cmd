@echo off
setlocal EnableExtensions
cd /d "%~dp0"

title MineWorks - Fix Typed Routes and Verify V0.5.1

echo ============================================================
echo MINEWORKS - TYPED ROUTES FIX AND VERIFY V0.5.1
echo ROOT: %CD%
echo ============================================================
echo.

if not exist "package.json" (
  echo ERROR: package.json was not found.
  echo Put this CMD file in the mineworks-web root folder.
  goto :FAIL
)

if not exist "node_modules" (
  echo ERROR: node_modules does not exist.
  echo Run 01_INSTALL_DEPENDENCIES.cmd first.
  goto :FAIL
)

echo IMPORTANT:
echo Close the running Next.js and Storybook windows before continuing.
echo.

echo [1/6] CLEAN OLD NEXT.JS GENERATED TYPES
if exist ".next" (
  rmdir /s /q ".next"
  if exist ".next" (
    echo ERROR: .next could not be removed.
    echo Close all Next.js processes and run this file again.
    goto :FAIL
  )
)
echo OLD TYPES REMOVED

echo.
echo [2/6] GENERATE ROUTE TYPES AND TYPECHECK
call npm run typecheck
if errorlevel 1 goto :FAIL

echo.
echo [3/6] LINT
call npm run lint
if errorlevel 1 goto :FAIL

echo.
echo [4/6] TEST
call npm run test
if errorlevel 1 goto :FAIL

echo.
echo [5/6] NEXT BUILD
call npm run build
if errorlevel 1 goto :FAIL

echo.
echo [6/6] STORYBOOK BUILD
call npm run build-storybook
if errorlevel 1 goto :FAIL

echo.
echo ============================================================
echo TYPED_ROUTES_FIX_VERIFY_OK
echo ============================================================
echo Restart:
echo   02_START_NEXTJS.cmd
echo   03_START_STORYBOOK_6007.cmd
pause
exit /b 0

:FAIL
echo.
echo ============================================================
echo TYPED_ROUTES_FIX_VERIFY_FAILED
echo Capture the first error shown above.
echo ============================================================
pause
exit /b 1
