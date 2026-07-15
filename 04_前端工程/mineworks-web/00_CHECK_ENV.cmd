@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo ============================================================
echo MINEWORKS FRONTEND ENVIRONMENT CHECK
echo ROOT: %CD%
echo ============================================================
echo.

if not exist "package.json" (
  echo ERROR: package.json was not found.
  echo Put this CMD file in the mineworks-web root folder.
  goto :END
)

echo OK: package.json found.
echo.

echo [NODE]
where node
if errorlevel 1 (
  echo ERROR: Node.js was not found in PATH.
  goto :END
)
node -v
echo.

echo [NPM]
where npm
if errorlevel 1 (
  echo ERROR: npm was not found in PATH.
  goto :END
)
call npm -v
echo.

echo [NODE_MODULES]
if exist "node_modules" (
  echo OK: node_modules exists.
) else (
  echo WARNING: node_modules does not exist.
  echo Run 01_INSTALL_DEPENDENCIES.cmd first.
)
echo.

echo [PORT 3000]
netstat -ano | findstr ":3000"
if errorlevel 1 echo FREE: No listener found on port 3000.
echo.

echo [PORT 6006]
netstat -ano | findstr ":6006"
if errorlevel 1 echo FREE: No listener found on port 6006.
echo.

echo [PORT 6007]
netstat -ano | findstr ":6007"
if errorlevel 1 echo FREE: No listener found on port 6007.
echo.

:END
echo.
echo ============================================================
echo CHECK FINISHED
echo ============================================================
pause
endlocal
