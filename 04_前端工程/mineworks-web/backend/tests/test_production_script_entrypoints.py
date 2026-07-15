from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]

def test_production_config_module_entrypoint() -> None:
    environment = os.environ.copy()
    environment.update({
        "MINEWORKS_ENVIRONMENT": "production",
        "MINEWORKS_DATABASE_URL": "postgresql+psycopg://user:password@database:5432/mineworks",
        "MINEWORKS_COOKIE_SECURE": "true",
        "MINEWORKS_ALLOW_BEARER_TOKENS": "false",
        "MINEWORKS_ALLOW_LOCAL_BILLING_SIMULATION": "false",
        "MINEWORKS_AUTO_CREATE_SCHEMA": "false",
    })
    completed = subprocess.run(
        [sys.executable, "-m", "scripts.check_production_config", "--skip-database"],
        cwd=BACKEND_ROOT,
        env=environment,
        capture_output=True,
        text=True,
        check=False,
    )
    assert completed.returncode == 0, completed.stderr
    payload = json.loads(completed.stdout)
    assert payload["environment"] == "production"
    assert payload["database"] == {"backend": "postgresql", "status": "not-checked"}
