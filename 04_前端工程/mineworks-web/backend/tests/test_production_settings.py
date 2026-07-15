from pathlib import Path

import pytest
from pydantic import ValidationError

from app.settings import Settings


def test_production_database_url_can_come_from_secret_file(tmp_path: Path) -> None:
    secret = tmp_path / "database_url.txt"
    secret.write_text("postgresql+psycopg://user:password@postgres:5432/mineworks\n", encoding="utf-8")
    settings = Settings(
        _env_file=None,
        environment="production",
        database_url_file=str(secret),
        cookie_secure=True,
        allow_bearer_tokens=False,
        allow_local_billing_simulation=False,
        auto_create_schema=False,
    )
    assert settings.effective_database_url.startswith("postgresql+psycopg://")


def test_production_rejects_sqlite_and_insecure_session_defaults() -> None:
    with pytest.raises(ValidationError):
        Settings(
            _env_file=None,
            environment="production",
            database_path="data/mineworks.db",
            cookie_secure=False,
            allow_bearer_tokens=True,
            allow_local_billing_simulation=True,
            auto_create_schema=True,
        )
