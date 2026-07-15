from __future__ import annotations

import json
from datetime import datetime, timezone
from uuid import uuid4
from app.database import connect


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def write_audit(
    *, actor_user_id: str | None, action: str, resource_type: str,
    resource_id: str | None = None, team_id: str | None = None,
    project_id: str | None = None, metadata: dict[str, object] | None = None,
) -> None:
    with connect() as connection:
        connection.execute(
            """INSERT INTO audit_logs(id,actor_user_id,team_id,project_id,action,resource_type,resource_id,metadata_json,created_at)
            VALUES(?,?,?,?,?,?,?,?,?)""",
            (f"aud_{uuid4().hex[:18]}", actor_user_id, team_id, project_id, action, resource_type, resource_id,
             json.dumps(metadata or {}, ensure_ascii=False), utc_now()),
        )


def list_audit_logs(team_id: str, limit: int = 100) -> list[dict[str, object]]:
    with connect() as connection:
        rows = connection.execute(
            """SELECT a.*,u.display_name AS actor_display_name FROM audit_logs a
            LEFT JOIN users u ON u.id=a.actor_user_id
            WHERE a.team_id=? ORDER BY a.created_at DESC LIMIT ?""", (team_id, max(1,min(limit,200)))
        ).fetchall()
    return [
        {"id":row["id"],"actor_user_id":row["actor_user_id"],"actor_display_name":row["actor_display_name"],
         "team_id":row["team_id"],"project_id":row["project_id"],"action":row["action"],
         "resource_type":row["resource_type"],"resource_id":row["resource_id"],
         "metadata":json.loads(row["metadata_json"]),"created_at":row["created_at"]}
        for row in rows
    ]
