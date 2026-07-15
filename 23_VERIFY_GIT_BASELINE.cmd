@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

set "FAILED=0"
set "ARCHIVE_ROOT="
set "ZIP_FOUND=0"
set "SHA_FOUND=0"

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo ERROR: Current directory is not a Git work tree.
  set "FAILED=1"
)

git show-ref --verify --quiet refs/heads/main
if errorlevel 1 (
  echo ERROR: main branch does not exist.
  set "FAILED=1"
)

git show-ref --verify --quiet refs/tags/v1.1.1-stable
if errorlevel 1 (
  echo ERROR: v1.1.1-stable tag does not exist.
  set "FAILED=1"
)

for /f "delims=" %%F in ('git status --porcelain') do (
  echo ERROR: Git work tree is not clean.
  set "FAILED=1"
)

for /f "delims=" %%F in ('git ls-files "*.db" "*.sqlite" "*.sqlite3"') do (
  echo ERROR: A database file is tracked by Git.
  set "FAILED=1"
)
for /f "delims=" %%F in ('git ls-files ".env" "*/.env" ".env.local" "*/.env.local"') do (
  echo ERROR: A local environment file is tracked by Git.
  set "FAILED=1"
)

git ls-files | findstr /I /C:"/node_modules/" /C:"/.next/" /C:"/storybook-static/" >nul
if not errorlevel 1 (
  echo ERROR: Generated frontend output is tracked by Git.
  set "FAILED=1"
)

for /d %%D in ("%~dp0..\*") do (
  if exist "%%~fD\V1.1.1_20260715" set "ARCHIVE_ROOT=%%~fD\V1.1.1_20260715"
)

if not defined ARCHIVE_ROOT (
  echo ERROR: V1.1.1 backup root was not found.
  set "FAILED=1"
)

if defined ARCHIVE_ROOT (
  for /r %ARCHIVE_ROOT% %%F in (*.zip) do set "ZIP_FOUND=1"
  for /r %ARCHIVE_ROOT% %%F in (*.sha256) do set "SHA_FOUND=1"
)

if "!ZIP_FOUND!"=="0" (
  echo ERROR: Source ZIP was not found.
  set "FAILED=1"
)
if "!SHA_FOUND!"=="0" (
  echo ERROR: Source SHA-256 file was not found.
  set "FAILED=1"
)

for /f "delims=" %%H in ('git rev-parse HEAD 2^>nul') do set "COMMIT_HASH=%%H"
if not defined COMMIT_HASH (
  echo ERROR: Current commit hash was not available.
  set "FAILED=1"
)

echo CURRENT_COMMIT=!COMMIT_HASH!
if "!FAILED!"=="0" (
  echo VERIFY_GIT_BASELINE_V111_OK
  exit /b 0
)

echo VERIFY_GIT_BASELINE_V111_FAILED
exit /b 1
