from __future__ import annotations

import sys
from pathlib import Path

# Support both module execution and direct script execution.
BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

import argparse
import json
from pathlib import Path
from typing import Any

from sqlalchemy import MetaData, create_engine, inspect, select

from app.schema import TABLE_COPY_ORDER, metadata as target_metadata


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Copy MineWorks V1.0 SQLite data into an Alembic-migrated PostgreSQL database.")
    parser.add_argument("--sqlite", default="data/mineworks.db", help="Path to the source SQLite database.")
    parser.add_argument("--postgres-url", required=True, help="Target postgresql+psycopg:// URL.")
    parser.add_argument("--include-sessions", action="store_true", help="Copy legacy sessions. Not recommended.")
    parser.add_argument("--truncate-target", action="store_true", help="Delete target application data before copying.")
    return parser.parse_args()


def _require_migrated_target(target_engine) -> None:
    if target_engine.url.get_backend_name() != "postgresql":
        raise SystemExit("Target URL must use PostgreSQL.")
    existing = set(inspect(target_engine).get_table_names())
    required = set(target_metadata.tables)
    missing = sorted(required - existing)
    if missing:
        raise SystemExit(
            "Target schema is not migrated. Run 'alembic -c alembic.ini upgrade head' first. "
            f"Missing tables: {', '.join(missing)}"
        )


def main() -> int:
    args = parse_args()
    sqlite_path = Path(args.sqlite).resolve()
    if not sqlite_path.exists():
        raise SystemExit(f"SQLite database not found: {sqlite_path}")

    source_engine = create_engine(f"sqlite:///{sqlite_path.as_posix()}")
    target_engine = create_engine(args.postgres_url, pool_pre_ping=True, hide_parameters=True)
    _require_migrated_target(target_engine)

    source_meta = MetaData()
    source_meta.reflect(source_engine)
    table_order = list(TABLE_COPY_ORDER)
    if args.include_sessions:
        table_order.insert(1, "auth_sessions")

    report: dict[str, Any] = {
        "source": str(sqlite_path),
        "target_backend": target_engine.url.get_backend_name(),
        "sessions_copied": bool(args.include_sessions),
        "tables": {},
    }
    with source_engine.connect() as source, target_engine.begin() as target:
        if args.truncate_target:
            quoted = ", ".join(f'"{table.name}"' for table in target_metadata.sorted_tables)
            target.exec_driver_sql(f"TRUNCATE TABLE {quoted} RESTART IDENTITY CASCADE")

        for table_name in table_order:
            if table_name not in source_meta.tables or table_name not in target_metadata.tables:
                report["tables"][table_name] = {"status": "skipped", "reason": "missing"}
                continue
            source_table = source_meta.tables[table_name]
            target_table = target_metadata.tables[table_name]
            shared_columns = [column.name for column in target_table.columns if column.name in source_table.c]
            rows = [
                dict(row)
                for row in source.execute(select(*[source_table.c[name] for name in shared_columns])).mappings()
            ]
            if rows:
                target.execute(target_table.insert(), rows)
            report["tables"][table_name] = {
                "status": "copied",
                "rows": len(rows),
                "columns": shared_columns,
            }

    print(json.dumps(report, ensure_ascii=False, indent=2))
    print("Migration complete. Browser sessions were not copied by default; users must sign in again.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
