from __future__ import annotations

import sys
from pathlib import Path

# Support both module execution and direct script execution.
BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

import argparse
import json

from app.database import configure_database, database_healthcheck
from app.settings import get_settings


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate MineWorks production security and database configuration.")
    parser.add_argument("--skip-database", action="store_true", help="Validate settings without opening a database connection.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    settings = get_settings()
    database: dict[str, str]
    if args.skip_database:
        backend = "postgresql" if settings.effective_database_url.startswith("postgresql") else "sqlite"
        database = {"backend": backend, "status": "not-checked"}
    else:
        configure_database(
            settings.effective_database_url,
            pool_size=settings.database_pool_size,
            max_overflow=settings.database_max_overflow,
        )
        database = database_healthcheck()
    checks = {
        "environment": settings.environment,
        "database": database,
        "database_url_source": "file" if settings.database_url_file else ("environment" if settings.database_url else "path"),
        "cookie_secure": settings.cookie_secure,
        "cookie_samesite": settings.cookie_samesite,
        "allow_bearer_tokens": settings.allow_bearer_tokens,
        "csrf_enabled": settings.csrf_enabled,
        "auto_create_schema": settings.auto_create_schema,
        "billing_simulation": settings.allow_local_billing_simulation,
        "docs_enabled": settings.docs_enabled,
    }
    print(json.dumps(checks, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
