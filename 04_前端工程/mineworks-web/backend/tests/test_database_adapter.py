from pathlib import Path

from app.database import configure_database, connect, database_backend, database_healthcheck, initialize_database


def test_sqlalchemy_sqlite_compatibility_adapter(tmp_path: Path) -> None:
    configure_database(tmp_path / "adapter.db")
    initialize_database()
    with connect() as connection:
        connection.execute(
            "INSERT INTO users(id,email,display_name,password_hash,status,plan,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)",
            ("usr_adapter", "adapter@example.com", "Adapter", "hash", "active", "free", "now", "now"),
        )
        row = connection.execute("SELECT id,email FROM users WHERE id=?", ("usr_adapter",)).fetchone()
    assert row is not None
    assert row["email"] == "adapter@example.com"
    assert database_backend() == "sqlite"
    assert database_healthcheck()["status"] == "ok"
