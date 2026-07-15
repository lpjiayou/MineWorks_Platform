from __future__ import annotations

import re
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Iterator, Mapping, Sequence

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.engine import Connection, Engine, Result
from sqlalchemy.exc import IntegrityError as SAIntegrityError
from sqlalchemy.pool import StaticPool

from app.schema import metadata

_engine: Engine | None = None
_database_url = "sqlite:///data/mineworks.db"


def _normalize_database_url(value: str | Path) -> str:
    raw = str(value).strip()
    if "://" in raw:
        return raw
    path = Path(raw)
    path.parent.mkdir(parents=True, exist_ok=True)
    return f"sqlite:///{path.as_posix()}"


def configure_database(database_url_or_path: str | Path, *, pool_size: int = 5, max_overflow: int = 10) -> None:
    global _engine, _database_url
    _database_url = _normalize_database_url(database_url_or_path)
    if _engine is not None:
        _engine.dispose()
    kwargs: dict[str, Any] = {
        "pool_pre_ping": True,
        "hide_parameters": True,
    }
    if _database_url.startswith("sqlite://"):
        kwargs["connect_args"] = {"check_same_thread": False, "timeout": 10}
        if _database_url in {"sqlite://", "sqlite:///:memory:"}:
            kwargs["poolclass"] = StaticPool
    else:
        kwargs.update(pool_size=max(1, pool_size), max_overflow=max(0, max_overflow), pool_recycle=1800)
    _engine = create_engine(_database_url, **kwargs)


def database_url() -> str:
    return _database_url


def database_backend() -> str:
    return get_engine().url.get_backend_name()


def get_engine() -> Engine:
    global _engine
    if _engine is None:
        configure_database(_database_url)
    assert _engine is not None
    return _engine


def dispose_database() -> None:
    global _engine
    if _engine is not None:
        _engine.dispose()
        _engine = None


def _qmark_to_named(sql: str, parameters: Sequence[object] | None) -> tuple[str, dict[str, object]]:
    if parameters is None:
        return sql, {}
    values = list(parameters)
    if not values:
        return sql, {}
    parts = sql.split("?")
    if len(parts) - 1 != len(values):
        raise ValueError(f"SQL placeholder count mismatch: expected {len(parts)-1}, got {len(values)}")
    chunks: list[str] = [parts[0]]
    bound: dict[str, object] = {}
    for index, value in enumerate(values):
        key = f"p{index}"
        chunks.extend((f":{key}", parts[index + 1]))
        bound[key] = value
    return "".join(chunks), bound


class CompatResult:
    def __init__(self, result: Result[Any]):
        self._result = result

    @property
    def rowcount(self) -> int:
        return int(self._result.rowcount or 0)

    def fetchone(self) -> Mapping[str, Any] | None:
        return self._result.mappings().fetchone()

    def fetchall(self) -> list[Mapping[str, Any]]:
        return list(self._result.mappings().fetchall())


class CompatConnection:
    def __init__(self, connection: Connection):
        self._connection = connection

    @property
    def dialect_name(self) -> str:
        return self._connection.dialect.name

    def execute(self, sql: str, parameters: Sequence[object] | None = None) -> CompatResult:
        statement, bound = _qmark_to_named(sql, parameters)
        return CompatResult(self._connection.execute(text(statement), bound))


@contextmanager
def connect() -> Iterator[CompatConnection]:
    try:
        with get_engine().begin() as connection:
            if connection.dialect.name == "sqlite":
                connection.exec_driver_sql("PRAGMA foreign_keys = ON")
                connection.exec_driver_sql("PRAGMA busy_timeout = 10000")
            yield CompatConnection(connection)
    except SAIntegrityError as error:
        # Preserve the V1.0 service-layer contract while the application moves to SQLAlchemy.
        raise sqlite3.IntegrityError(str(error.orig)) from error


def _ensure_legacy_columns() -> None:
    engine = get_engine()
    inspector = inspect(engine)
    if "auth_sessions" not in inspector.get_table_names():
        return
    existing = {column["name"] for column in inspector.get_columns("auth_sessions")}
    additions = {
        "csrf_token_hash": "TEXT",
        "idle_expires_at": "TEXT",
        "rotated_from": "TEXT",
    }
    with engine.begin() as connection:
        for name, definition in additions.items():
            if name not in existing:
                connection.execute(text(f"ALTER TABLE auth_sessions ADD COLUMN {name} {definition}"))


def initialize_database() -> None:
    """Create the development/test schema.

    Production deployments must run ``alembic upgrade head`` before starting the API.
    This fallback intentionally remains for local SQLite development and automated tests.
    """
    metadata.create_all(get_engine())
    _ensure_legacy_columns()


def database_healthcheck() -> dict[str, str]:
    with get_engine().connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"backend": database_backend(), "status": "ok"}
