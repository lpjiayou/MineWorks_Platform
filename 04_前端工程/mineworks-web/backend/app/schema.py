from __future__ import annotations

from sqlalchemy import (
    CheckConstraint,
    Column,
    ForeignKey,
    Index,
    Integer,
    MetaData,
    String,
    Table,
    Text,
    text,
)

metadata = MetaData()

users = Table(
    "users", metadata,
    Column("id", String(64), primary_key=True),
    Column("email", String(254), nullable=False, unique=True),
    Column("display_name", String(120), nullable=False),
    Column("password_hash", Text, nullable=False),
    Column("status", String(32), nullable=False, server_default="active"),
    Column("plan", String(32), nullable=False, server_default="free"),
    Column("created_at", String(64), nullable=False),
    Column("updated_at", String(64), nullable=False),
    Column("last_login_at", String(64)),
)

auth_sessions = Table(
    "auth_sessions", metadata,
    Column("id", String(64), primary_key=True),
    Column("user_id", String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
    Column("token_hash", String(128), nullable=False, unique=True),
    Column("csrf_token_hash", String(128)),
    Column("created_at", String(64), nullable=False),
    Column("expires_at", String(64), nullable=False),
    Column("idle_expires_at", String(64)),
    Column("last_seen_at", String(64), nullable=False),
    Column("revoked_at", String(64)),
    Column("rotated_from", String(64)),
    Column("user_agent", Text, nullable=False, server_default=""),
    Column("ip_address", String(128), nullable=False, server_default=""),
)
Index("idx_auth_sessions_user", auth_sessions.c.user_id, auth_sessions.c.expires_at)
Index("idx_auth_sessions_expiry", auth_sessions.c.expires_at, auth_sessions.c.revoked_at)

login_attempts = Table(
    "auth_login_attempts", metadata,
    Column("id", String(64), primary_key=True),
    Column("email", String(254), nullable=False),
    Column("ip_address", String(128), nullable=False),
    Column("succeeded", Integer, nullable=False, server_default="0"),
    Column("created_at", String(64), nullable=False),
)
Index("idx_auth_login_attempts_lookup", login_attempts.c.email, login_attempts.c.ip_address, login_attempts.c.created_at)

teams = Table(
    "teams", metadata,
    Column("id", String(64), primary_key=True),
    Column("name", String(160), nullable=False),
    Column("slug", String(180), nullable=False, unique=True),
    Column("plan", String(32), nullable=False, server_default="free"),
    Column("status", String(32), nullable=False, server_default="active"),
    Column("created_by", String(64), ForeignKey("users.id"), nullable=False),
    Column("created_at", String(64), nullable=False),
    Column("updated_at", String(64), nullable=False),
)

team_members = Table(
    "team_members", metadata,
    Column("team_id", String(64), ForeignKey("teams.id", ondelete="CASCADE"), primary_key=True),
    Column("user_id", String(64), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("role", String(32), nullable=False),
    Column("status", String(32), nullable=False, server_default="active"),
    Column("joined_at", String(64), nullable=False),
    Column("invited_by", String(64), ForeignKey("users.id")),
)
Index("idx_team_members_user", team_members.c.user_id, team_members.c.status)

team_invitations = Table(
    "team_invitations", metadata,
    Column("id", String(64), primary_key=True),
    Column("team_id", String(64), ForeignKey("teams.id", ondelete="CASCADE"), nullable=False),
    Column("email", String(254), nullable=False),
    Column("role", String(32), nullable=False),
    Column("token_hash", String(128), nullable=False, unique=True),
    Column("status", String(32), nullable=False, server_default="pending"),
    Column("expires_at", String(64), nullable=False),
    Column("created_by", String(64), ForeignKey("users.id"), nullable=False),
    Column("created_at", String(64), nullable=False),
    Column("accepted_at", String(64)),
    Column("accepted_by", String(64), ForeignKey("users.id")),
)
Index("idx_team_invitations_team", team_invitations.c.team_id, team_invitations.c.status, team_invitations.c.created_at)

projects = Table(
    "projects", metadata,
    Column("id", String(64), primary_key=True),
    Column("name", String(200), nullable=False),
    Column("code", String(120)),
    Column("description", Text, nullable=False, server_default=""),
    Column("status", String(32), nullable=False, server_default="active"),
    Column("created_at", String(64), nullable=False),
    Column("updated_at", String(64), nullable=False),
    Column("team_id", String(64), ForeignKey("teams.id", ondelete="SET NULL")),
    Column("owner_user_id", String(64), ForeignKey("users.id", ondelete="SET NULL")),
    Column("created_by", String(64), ForeignKey("users.id", ondelete="SET NULL")),
    Column("visibility", String(32), nullable=False, server_default="team"),
)
Index(
    "idx_projects_code", projects.c.code, unique=True,
    sqlite_where=text("code IS NOT NULL AND code <> ''"),
    postgresql_where=text("code IS NOT NULL AND code <> ''"),
)
Index("idx_projects_team", projects.c.team_id, projects.c.updated_at)

project_members = Table(
    "project_members", metadata,
    Column("project_id", String(64), ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
    Column("user_id", String(64), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("role", String(32), nullable=False),
    Column("status", String(32), nullable=False, server_default="active"),
    Column("added_by", String(64), ForeignKey("users.id"), nullable=False),
    Column("created_at", String(64), nullable=False),
    Column("updated_at", String(64), nullable=False),
)
Index("idx_project_members_user", project_members.c.user_id, project_members.c.status)

calculation_records = Table(
    "calculation_records", metadata,
    Column("id", String(64), primary_key=True),
    Column("source_request_id", String(80), nullable=False),
    Column("tool_id", String(120), nullable=False),
    Column("tool_name", String(240), nullable=False),
    Column("tool_version", String(40), nullable=False),
    Column("formula_version", String(40), nullable=False),
    Column("title", String(300), nullable=False),
    Column("project_id", String(64), ForeignKey("projects.id", ondelete="SET NULL")),
    Column("data_source", String(64), nullable=False),
    Column("validity", String(40), nullable=False),
    Column("computed_at", String(64), nullable=False),
    Column("saved_at", String(64), nullable=False),
    Column("updated_at", String(64), nullable=False),
    Column("inputs_json", Text, nullable=False),
    Column("normalized_inputs_json", Text, nullable=False),
    Column("results_json", Text, nullable=False),
    Column("steps_json", Text, nullable=False),
    Column("warnings_json", Text, nullable=False),
    Column("assumptions_json", Text, nullable=False),
    Column("reusable_outputs_json", Text, nullable=False),
    Column("tags_json", Text, nullable=False),
    Column("note", Text, nullable=False, server_default=""),
    Column("team_id", String(64), ForeignKey("teams.id", ondelete="SET NULL")),
    Column("owner_user_id", String(64), ForeignKey("users.id", ondelete="SET NULL")),
    Column("created_by", String(64), ForeignKey("users.id", ondelete="SET NULL")),
)
Index("idx_calculation_records_saved_at", calculation_records.c.saved_at)
Index("idx_calculation_records_tool", calculation_records.c.tool_id, calculation_records.c.saved_at)
Index("idx_calculation_records_project", calculation_records.c.project_id, calculation_records.c.saved_at)
Index("idx_calculation_records_owner", calculation_records.c.owner_user_id, calculation_records.c.saved_at)
Index("idx_calculation_records_team", calculation_records.c.team_id, calculation_records.c.saved_at)

audit_logs = Table(
    "audit_logs", metadata,
    Column("id", String(64), primary_key=True),
    Column("actor_user_id", String(64), ForeignKey("users.id", ondelete="SET NULL")),
    Column("team_id", String(64), ForeignKey("teams.id", ondelete="SET NULL")),
    Column("project_id", String(64), ForeignKey("projects.id", ondelete="SET NULL")),
    Column("action", String(120), nullable=False),
    Column("resource_type", String(120), nullable=False),
    Column("resource_id", String(80)),
    Column("metadata_json", Text, nullable=False, server_default="{}"),
    Column("created_at", String(64), nullable=False),
)
Index("idx_audit_logs_context", audit_logs.c.team_id, audit_logs.c.project_id, audit_logs.c.created_at)

subscriptions = Table(
    "subscriptions", metadata,
    Column("id", String(64), primary_key=True),
    Column("subject_type", String(20), nullable=False),
    Column("subject_id", String(64), nullable=False),
    Column("plan", String(32), nullable=False),
    Column("status", String(32), nullable=False, server_default="active"),
    Column("billing_cycle", String(32), nullable=False, server_default="monthly"),
    Column("starts_at", String(64), nullable=False),
    Column("ends_at", String(64)),
    Column("auto_renew", Integer, nullable=False, server_default="0"),
    Column("provider", String(64), nullable=False, server_default="local-dev"),
    Column("external_reference", String(240)),
    Column("created_by", String(64), nullable=False),
    Column("created_at", String(64), nullable=False),
    Column("updated_at", String(64), nullable=False),
    CheckConstraint("subject_type IN ('user','team')", name="ck_subscriptions_subject_type"),
    CheckConstraint("status IN ('pending','active','cancelled','expired')", name="ck_subscriptions_status"),
)
Index("idx_subscriptions_subject", subscriptions.c.subject_type, subscriptions.c.subject_id, subscriptions.c.status, subscriptions.c.updated_at)

billing_orders = Table(
    "billing_orders", metadata,
    Column("id", String(64), primary_key=True),
    Column("user_id", String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
    Column("team_id", String(64), ForeignKey("teams.id", ondelete="SET NULL")),
    Column("subject_type", String(20), nullable=False),
    Column("subject_id", String(64), nullable=False),
    Column("target_plan", String(32), nullable=False),
    Column("billing_cycle", String(32), nullable=False),
    Column("amount_fen", Integer),
    Column("currency", String(8), nullable=False, server_default="CNY"),
    Column("status", String(32), nullable=False, server_default="pending"),
    Column("provider", String(64), nullable=False, server_default="local-dev"),
    Column("provider_reference", String(240)),
    Column("created_at", String(64), nullable=False),
    Column("updated_at", String(64), nullable=False),
    Column("paid_at", String(64)),
    CheckConstraint("subject_type IN ('user','team')", name="ck_billing_orders_subject_type"),
    CheckConstraint("status IN ('pending','paid','cancelled','failed')", name="ck_billing_orders_status"),
)
Index("idx_billing_orders_user", billing_orders.c.user_id, billing_orders.c.created_at)
Index("idx_billing_orders_team", billing_orders.c.team_id, billing_orders.c.created_at)

usage_counters = Table(
    "usage_counters", metadata,
    Column("subject_type", String(20), primary_key=True),
    Column("subject_id", String(64), primary_key=True),
    Column("metric", String(120), primary_key=True),
    Column("period_start", String(64), primary_key=True),
    Column("period_end", String(64), nullable=False),
    Column("used", Integer, nullable=False, server_default="0"),
    Column("updated_at", String(64), nullable=False),
)

usage_events = Table(
    "usage_events", metadata,
    Column("id", String(64), primary_key=True),
    Column("user_id", String(64), ForeignKey("users.id", ondelete="SET NULL")),
    Column("team_id", String(64), ForeignKey("teams.id", ondelete="SET NULL")),
    Column("subject_type", String(20), nullable=False),
    Column("subject_id", String(64), nullable=False),
    Column("metric", String(120), nullable=False),
    Column("quantity", Integer, nullable=False),
    Column("resource_type", String(120)),
    Column("resource_id", String(80)),
    Column("request_id", String(80)),
    Column("created_at", String(64), nullable=False),
)
Index("idx_usage_events_subject", usage_events.c.subject_type, usage_events.c.subject_id, usage_events.c.metric, usage_events.c.created_at)

TABLE_COPY_ORDER = [
    "users", "teams", "team_members", "team_invitations", "projects", "project_members",
    "calculation_records", "audit_logs", "subscriptions", "billing_orders", "usage_counters", "usage_events",
]
