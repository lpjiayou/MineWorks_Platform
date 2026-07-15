@echo off
setlocal

set "FAILED=0"

if not exist "AGENTS.md" set "FAILED=1"
if not exist "CODEX_HANDOFF.md" set "FAILED=1"
if not exist "CODEX_PROJECT_MAP.md" set "FAILED=1"
if not exist "CODEX_DEVELOPMENT_RULES.md" set "FAILED=1"
if not exist "CODEX_TASK_BACKLOG.md" set "FAILED=1"
if not exist "CODEX_ACCEPTANCE_CHECKLIST.md" set "FAILED=1"
if not exist "CODEX_FIRST_TASK.md" set "FAILED=1"

set "WEB_AGENTS=0"
set "CORE_AGENTS=0"
set "TEST_AGENTS=0"

for /d %%D in ("04_*") do if exist "%%~D\mineworks-web\AGENTS.md" set "WEB_AGENTS=1"
for /d %%D in ("06_*") do if exist "%%~D\AGENTS.md" set "CORE_AGENTS=1"
for /d %%D in ("07_*") do if exist "%%~D\AGENTS.md" set "TEST_AGENTS=1"

if "%WEB_AGENTS%"=="0" set "FAILED=1"
if "%CORE_AGENTS%"=="0" set "FAILED=1"
if "%TEST_AGENTS%"=="0" set "FAILED=1"

if "%FAILED%"=="0" (
    echo VERIFY_CODEX_HANDOFF_OK
    exit /b 0
)

echo VERIFY_CODEX_HANDOFF_FAILED
exit /b 1
