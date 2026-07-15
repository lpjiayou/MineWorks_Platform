from __future__ import annotations

import sqlite3
from dataclasses import dataclass
from datetime import datetime, timezone
from uuid import uuid4

from app.contracts.billing import (
    BillingOrderResponse,
    CheckoutIntentCreate,
    EntitlementResponse,
    PlanQuotaResponse,
    PlanResponse,
    SubscriptionResponse,
    UsageQuotaResponse,
)
from app.database import connect
from app.services.audit_service import write_audit
from app.settings import get_settings

PLAN_RANK = {"free": 10, "professional": 20, "team": 30, "enterprise": 40}

FEATURE_LABELS: dict[str, str] = {
    "tool.basic.calculate": "基础工程计算",
    "history.save": "统一计算历史",
    "project.workspace": "项目工作台",
    "export.markdown": "Markdown导出",
    "export.json": "JSON导出",
    "analysis.advanced": "高级分析工具",
    "calculation.batch": "批量计算",
    "export.excel": "Excel导出",
    "export.word": "Word导出",
    "team.collaboration": "团队协作",
    "team.audit": "团队审计",
    "template.shared": "共享参数模板",
    "api.access": "开放API访问",
    "sso.enterprise": "企业单点登录",
    "support.priority": "优先技术支持",
}

# 价格仅供本地功能演示，正式商业化前必须由运营、财务和法务共同确认。
PLAN_CATALOG: dict[str, dict[str, object]] = {
    "free": {
        "name": "免费版",
        "tagline": "个人学习与基础计算",
        "description": "适合工程师体验平台、完成基础计算并保存少量项目记录。",
        "monthly_price_fen": 0,
        "annual_price_fen": 0,
        "recommended": False,
        "price_note": "永久免费基础能力",
        "features": [
            "tool.basic.calculate", "history.save", "project.workspace", "export.markdown", "export.json",
        ],
        "quotas": {
            "calculations.monthly": ("每月计算次数", 100, "monthly"),
            "exports.monthly": ("每月导出次数", 20, "monthly"),
            "projects.total": ("项目数量", 3, "total"),
            "records.total": ("计算记录数量", 50, "total"),
            "teams.total": ("团队工作区数量", 1, "total"),
            "team_members.total": ("团队成员数量", 1, "total"),
        },
    },
    "professional": {
        "name": "专业版",
        "tagline": "专业工程师的高阶工具箱",
        "description": "解锁高级分析、批量计算和正式办公文档导出。",
        "monthly_price_fen": 9900,
        "annual_price_fen": 99000,
        "recommended": True,
        "price_note": "本地演示价格，正式运营前需审批",
        "features": [
            "tool.basic.calculate", "history.save", "project.workspace", "export.markdown", "export.json",
            "analysis.advanced", "calculation.batch", "export.excel", "export.word",
        ],
        "quotas": {
            "calculations.monthly": ("每月计算次数", 2000, "monthly"),
            "exports.monthly": ("每月导出次数", 300, "monthly"),
            "projects.total": ("项目数量", 30, "total"),
            "records.total": ("计算记录数量", 5000, "total"),
            "teams.total": ("团队工作区数量", 1, "total"),
            "team_members.total": ("团队成员数量", 1, "total"),
        },
    },
    "team": {
        "name": "团队版",
        "tagline": "设计院与项目团队协同",
        "description": "提供团队成员、项目协作、共享模板和操作审计能力。",
        "monthly_price_fen": 39900,
        "annual_price_fen": 399000,
        "recommended": False,
        "price_note": "本地演示价格，正式运营前需审批",
        "features": [
            "tool.basic.calculate", "history.save", "project.workspace", "export.markdown", "export.json",
            "analysis.advanced", "calculation.batch", "export.excel", "export.word",
            "team.collaboration", "team.audit", "template.shared",
        ],
        "quotas": {
            "calculations.monthly": ("每月计算次数", 10000, "monthly"),
            "exports.monthly": ("每月导出次数", 2000, "monthly"),
            "projects.total": ("项目数量", 200, "total"),
            "records.total": ("计算记录数量", 30000, "total"),
            "teams.total": ("团队工作区数量", 3, "total"),
            "team_members.total": ("团队成员数量", 20, "total"),
        },
    },
    "enterprise": {
        "name": "企业版",
        "tagline": "面向企业级部署与系统集成",
        "description": "提供开放API、企业单点登录、专属容量和优先支持。",
        "monthly_price_fen": None,
        "annual_price_fen": None,
        "recommended": False,
        "price_note": "按部署范围和服务内容定制",
        "features": list(FEATURE_LABELS.keys()),
        "quotas": {
            "calculations.monthly": ("每月计算次数", None, "monthly"),
            "exports.monthly": ("每月导出次数", None, "monthly"),
            "projects.total": ("项目数量", None, "total"),
            "records.total": ("计算记录数量", None, "total"),
            "teams.total": ("团队工作区数量", None, "total"),
            "team_members.total": ("团队成员数量", None, "total"),
        },
    },
}

MONTHLY_METRICS = {"calculations.monthly", "exports.monthly"}
TOTAL_METRICS = {"projects.total", "records.total", "teams.total", "team_members.total"}


@dataclass(frozen=True)
class PlanContext:
    user_plan: str
    team_plan: str | None
    effective_plan: str
    source: str
    active_team_id: str | None


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def utc_text(value: datetime | None = None) -> str:
    return (value or utc_now()).isoformat()


def current_month_window(now: datetime | None = None) -> tuple[str, str]:
    current = now or utc_now()
    start = current.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    if start.month == 12:
        end = start.replace(year=start.year + 1, month=1)
    else:
        end = start.replace(month=start.month + 1)
    return utc_text(start), utc_text(end)


def plan_response(plan_id: str) -> PlanResponse:
    data = PLAN_CATALOG[plan_id]
    quotas = [
        PlanQuotaResponse(metric=metric, label=spec[0], limit=spec[1], period=spec[2])
        for metric, spec in data["quotas"].items()  # type: ignore[union-attr]
    ]
    return PlanResponse(
        id=plan_id,  # type: ignore[arg-type]
        name=str(data["name"]),
        tagline=str(data["tagline"]),
        description=str(data["description"]),
        monthly_price_fen=data["monthly_price_fen"],  # type: ignore[arg-type]
        annual_price_fen=data["annual_price_fen"],  # type: ignore[arg-type]
        recommended=bool(data["recommended"]),
        price_note=str(data["price_note"]),
        features=[FEATURE_LABELS[item] for item in data["features"]],  # type: ignore[index]
        quotas=quotas,
    )


def list_plans() -> list[PlanResponse]:
    return [plan_response(plan_id) for plan_id in ("free", "professional", "team", "enterprise")]


def _active_subscription_plan(connection: sqlite3.Connection, subject_type: str, subject_id: str) -> str | None:
    now = utc_text()
    row = connection.execute(
        """SELECT plan FROM subscriptions
        WHERE subject_type=? AND subject_id=? AND status='active'
          AND starts_at<=? AND (ends_at IS NULL OR ends_at>?)
        ORDER BY updated_at DESC LIMIT 1""",
        (subject_type, subject_id, now, now),
    ).fetchone()
    return str(row["plan"]) if row else None


def resolve_plan_context(user_id: str, team_id: str | None) -> PlanContext:
    with connect() as connection:
        user_row = connection.execute("SELECT plan FROM users WHERE id=?", (user_id,)).fetchone()
        if user_row is None:
            raise LookupError("用户不存在。")
        user_plan = str(user_row["plan"] or "free")
        subscription_user_plan = _active_subscription_plan(connection, "user", user_id)
        if subscription_user_plan and PLAN_RANK[subscription_user_plan] > PLAN_RANK[user_plan]:
            user_plan = subscription_user_plan

        team_plan: str | None = None
        if team_id:
            team_row = connection.execute("SELECT plan FROM teams WHERE id=?", (team_id,)).fetchone()
            if team_row:
                team_plan = str(team_row["plan"] or "free")
                subscription_team_plan = _active_subscription_plan(connection, "team", team_id)
                if subscription_team_plan and PLAN_RANK[subscription_team_plan] > PLAN_RANK[team_plan]:
                    team_plan = subscription_team_plan

    if team_plan is not None and PLAN_RANK[team_plan] >= PLAN_RANK[user_plan]:
        return PlanContext(user_plan=user_plan, team_plan=team_plan, effective_plan=team_plan, source="team", active_team_id=team_id)
    if PLAN_RANK[user_plan] > PLAN_RANK["free"]:
        return PlanContext(user_plan=user_plan, team_plan=team_plan, effective_plan=user_plan, source="user", active_team_id=team_id)
    return PlanContext(user_plan=user_plan, team_plan=team_plan, effective_plan="free", source="free", active_team_id=team_id)


def _usage_subject(context: PlanContext, user_id: str) -> tuple[str, str]:
    if context.source == "team" and context.active_team_id:
        return "team", context.active_team_id
    return "user", user_id


def _monthly_used(connection: sqlite3.Connection, subject_type: str, subject_id: str, metric: str) -> tuple[int, str, str]:
    period_start, period_end = current_month_window()
    row = connection.execute(
        "SELECT used FROM usage_counters WHERE subject_type=? AND subject_id=? AND metric=? AND period_start=?",
        (subject_type, subject_id, metric, period_start),
    ).fetchone()
    return int(row["used"]) if row else 0, period_start, period_end


def _total_used(connection: sqlite3.Connection, subject_type: str, subject_id: str, metric: str, user_id: str, team_id: str | None) -> int:
    if metric == "projects.total":
        if subject_type == "team":
            row = connection.execute("SELECT COUNT(*) AS total FROM projects WHERE team_id=? AND status='active'", (subject_id,)).fetchone()
        else:
            row = connection.execute("SELECT COUNT(*) AS total FROM projects WHERE owner_user_id=? AND status='active'", (user_id,)).fetchone()
    elif metric == "records.total":
        if subject_type == "team":
            row = connection.execute("SELECT COUNT(*) AS total FROM calculation_records WHERE team_id=?", (subject_id,)).fetchone()
        else:
            row = connection.execute("SELECT COUNT(*) AS total FROM calculation_records WHERE owner_user_id=?", (user_id,)).fetchone()
    elif metric == "teams.total":
        row = connection.execute("SELECT COUNT(*) AS total FROM team_members WHERE user_id=? AND status='active'", (user_id,)).fetchone()
    elif metric == "team_members.total":
        target_team = team_id or (subject_id if subject_type == "team" else None)
        if target_team is None:
            return 0
        row = connection.execute("SELECT COUNT(*) AS total FROM team_members WHERE team_id=? AND status='active'", (target_team,)).fetchone()
    else:
        return 0
    return int(row["total"] if row else 0)


def get_entitlement_snapshot(user_id: str, team_id: str | None) -> EntitlementResponse:
    context = resolve_plan_context(user_id, team_id)
    subject_type, subject_id = _usage_subject(context, user_id)
    plan_data = PLAN_CATALOG[context.effective_plan]
    quotas: list[UsageQuotaResponse] = []
    with connect() as connection:
        for metric, spec in plan_data["quotas"].items():  # type: ignore[union-attr]
            label, limit, period = spec
            if period == "monthly":
                used, start, end = _monthly_used(connection, subject_type, subject_id, metric)
            else:
                used = _total_used(connection, subject_type, subject_id, metric, user_id, team_id)
                start = end = None
            remaining = None if limit is None else max(int(limit) - used, 0)
            percentage = None if limit in (None, 0) else round(min(used / int(limit) * 100, 100.0), 2)
            quotas.append(UsageQuotaResponse(
                metric=metric,
                label=str(label),
                period=period,
                used=used,
                limit=limit,
                remaining=remaining,
                percentage=percentage,
                period_start=start,
                period_end=end,
            ))
    return EntitlementResponse(
        user_plan=context.user_plan,  # type: ignore[arg-type]
        team_plan=context.team_plan,  # type: ignore[arg-type]
        effective_plan=context.effective_plan,  # type: ignore[arg-type]
        plan_source=context.source,  # type: ignore[arg-type]
        active_team_id=team_id,
        features=[str(item) for item in plan_data["features"]],
        quotas=quotas,
    )


def has_feature(user_id: str, team_id: str | None, feature_code: str) -> bool:
    context = resolve_plan_context(user_id, team_id)
    return feature_code in PLAN_CATALOG[context.effective_plan]["features"]


def assert_feature(user_id: str, team_id: str | None, feature_code: str) -> None:
    if not has_feature(user_id, team_id, feature_code):
        raise PermissionError(f"当前套餐未开通功能：{feature_code}")


def assert_quota(user_id: str, team_id: str | None, metric: str, quantity: int = 1) -> None:
    context = resolve_plan_context(user_id, team_id)
    plan_data = PLAN_CATALOG[context.effective_plan]
    quota = plan_data["quotas"].get(metric)  # type: ignore[union-attr]
    if quota is None:
        raise PermissionError(f"当前套餐未配置配额：{metric}")
    _, limit, period = quota
    if limit is None:
        return
    subject_type, subject_id = _usage_subject(context, user_id)
    with connect() as connection:
        if period == "monthly":
            used, _, _ = _monthly_used(connection, subject_type, subject_id, metric)
        else:
            used = _total_used(connection, subject_type, subject_id, metric, user_id, team_id)
    if used + quantity > int(limit):
        raise OverflowError(f"配额已用尽：{metric}（{used}/{limit}）")


def consume_usage(
    user_id: str,
    team_id: str | None,
    metric: str,
    quantity: int = 1,
    *,
    resource_type: str | None = None,
    resource_id: str | None = None,
    request_id: str | None = None,
) -> UsageQuotaResponse:
    if quantity <= 0:
        raise ValueError("用量增量必须大于0。")
    assert_quota(user_id, team_id, metric, quantity)
    context = resolve_plan_context(user_id, team_id)
    subject_type, subject_id = _usage_subject(context, user_id)
    plan_data = PLAN_CATALOG[context.effective_plan]
    label, limit, period = plan_data["quotas"][metric]  # type: ignore[index]
    if period != "monthly":
        snapshot = get_entitlement_snapshot(user_id, team_id)
        return next(item for item in snapshot.quotas if item.metric == metric)
    period_start, period_end = current_month_window()
    now = utc_text()
    event_id = f"use_{uuid4().hex[:18]}"
    with connect() as connection:
        connection.execute(
            """INSERT INTO usage_counters(subject_type,subject_id,metric,period_start,period_end,used,updated_at)
            VALUES(?,?,?,?,?,?,?)
            ON CONFLICT(subject_type,subject_id,metric,period_start)
            DO UPDATE SET used=usage_counters.used+excluded.used,updated_at=excluded.updated_at""",
            (subject_type, subject_id, metric, period_start, period_end, quantity, now),
        )
        connection.execute(
            """INSERT INTO usage_events(id,user_id,team_id,subject_type,subject_id,metric,quantity,resource_type,resource_id,request_id,created_at)
            VALUES(?,?,?,?,?,?,?,?,?,?,?)""",
            (event_id, user_id, team_id, subject_type, subject_id, metric, quantity, resource_type, resource_id, request_id, now),
        )
        row = connection.execute(
            "SELECT used FROM usage_counters WHERE subject_type=? AND subject_id=? AND metric=? AND period_start=?",
            (subject_type, subject_id, metric, period_start),
        ).fetchone()
    used = int(row["used"])
    remaining = None if limit is None else max(int(limit) - used, 0)
    percentage = None if limit in (None, 0) else round(min(used / int(limit) * 100, 100.0), 2)
    return UsageQuotaResponse(
        metric=metric,
        label=str(label),
        period="monthly",
        used=used,
        limit=limit,
        remaining=remaining,
        percentage=percentage,
        period_start=period_start,
        period_end=period_end,
    )


def _order_from_row(row: sqlite3.Row) -> BillingOrderResponse:
    return BillingOrderResponse(
        id=row["id"], user_id=row["user_id"], team_id=row["team_id"], subject_type=row["subject_type"],
        subject_id=row["subject_id"], target_plan=row["target_plan"], billing_cycle=row["billing_cycle"],
        amount_fen=row["amount_fen"], currency=row["currency"], status=row["status"], provider=row["provider"],
        provider_reference=row["provider_reference"], created_at=row["created_at"], updated_at=row["updated_at"],
        paid_at=row["paid_at"], payment_action=(f"/api/v1/billing/orders/{row['id']}/simulate-paid" if row["status"] == "pending" else None),
    )


def create_checkout_intent(
    payload: CheckoutIntentCreate,
    *,
    user_id: str,
    team_id: str | None,
    team_role: str | None,
) -> BillingOrderResponse:
    if payload.target_plan == "free":
        raise ValueError("免费版无需创建订阅订单。")
    if payload.subject_type == "user" and payload.target_plan not in {"professional"}:
        raise ValueError("个人订阅当前仅支持专业版。")
    if payload.subject_type == "team":
        if team_id is None:
            raise ValueError("请先选择团队工作区。")
        if team_role not in {"owner", "admin"}:
            raise PermissionError("只有团队所有者或管理员可以创建团队订阅订单。")
        if payload.target_plan not in {"team", "enterprise"}:
            raise ValueError("团队订阅仅支持团队版或企业版。")
    plan = PLAN_CATALOG[payload.target_plan]
    amount = plan["monthly_price_fen"] if payload.billing_cycle == "monthly" else plan["annual_price_fen"]
    if payload.target_plan == "enterprise":
        amount = None
    now = utc_text()
    order_id = f"ord_{uuid4().hex[:18]}"
    subject_id = user_id if payload.subject_type == "user" else str(team_id)
    order_team_id = team_id if payload.subject_type == "team" else None
    with connect() as connection:
        connection.execute(
            """INSERT INTO billing_orders(id,user_id,team_id,subject_type,subject_id,target_plan,billing_cycle,amount_fen,currency,status,provider,created_at,updated_at)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (order_id, user_id, order_team_id, payload.subject_type, subject_id, payload.target_plan, payload.billing_cycle,
             amount, "CNY", "pending", "local-dev", now, now),
        )
        row = connection.execute("SELECT * FROM billing_orders WHERE id=?", (order_id,)).fetchone()
    write_audit(
        actor_user_id=user_id, team_id=team_id, action="billing.order.create", resource_type="billing_order", resource_id=order_id,
        metadata={"subject_type": payload.subject_type, "target_plan": payload.target_plan, "billing_cycle": payload.billing_cycle},
    )
    return _order_from_row(row)


def list_orders(user_id: str, team_id: str | None) -> list[BillingOrderResponse]:
    with connect() as connection:
        if team_id:
            rows = connection.execute(
                "SELECT * FROM billing_orders WHERE user_id=? OR team_id=? ORDER BY created_at DESC LIMIT 100",
                (user_id, team_id),
            ).fetchall()
        else:
            rows = connection.execute("SELECT * FROM billing_orders WHERE user_id=? ORDER BY created_at DESC LIMIT 100", (user_id,)).fetchall()
    return [_order_from_row(row) for row in rows]


def simulate_order_paid(order_id: str, *, user_id: str, team_id: str | None, team_role: str | None) -> BillingOrderResponse:
    settings = get_settings()
    if not settings.allow_local_billing_simulation:
        raise PermissionError("当前环境未启用本地支付模拟。")
    now = utc_text()
    with connect() as connection:
        row = connection.execute("SELECT * FROM billing_orders WHERE id=?", (order_id,)).fetchone()
        if row is None:
            raise LookupError("订单不存在。")
        if row["subject_type"] == "user" and row["user_id"] != user_id:
            raise PermissionError("无权操作该个人订单。")
        if row["subject_type"] == "team":
            if row["team_id"] != team_id:
                raise PermissionError("请先切换到订单所属团队。")
            if team_role not in {"owner", "admin"}:
                raise PermissionError("只有团队所有者或管理员可以确认团队订单。")
        if row["status"] != "pending":
            raise ValueError("订单不是待支付状态。")
        if row["target_plan"] == "enterprise":
            raise ValueError("企业版需要人工报价，不能在本地模拟直接开通。")
        connection.execute(
            "UPDATE billing_orders SET status='paid',paid_at=?,updated_at=?,provider_reference=? WHERE id=?",
            (now, now, f"local_{uuid4().hex[:12]}", order_id),
        )
        connection.execute(
            "UPDATE subscriptions SET status='cancelled',updated_at=? WHERE subject_type=? AND subject_id=? AND status='active'",
            (now, row["subject_type"], row["subject_id"]),
        )
        subscription_id = f"sub_{uuid4().hex[:18]}"
        connection.execute(
            """INSERT INTO subscriptions(id,subject_type,subject_id,plan,status,billing_cycle,starts_at,ends_at,auto_renew,provider,external_reference,created_by,created_at,updated_at)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (subscription_id, row["subject_type"], row["subject_id"], row["target_plan"], "active", row["billing_cycle"],
             now, None, 0, "local-dev", row["id"], user_id, now, now),
        )
        if row["subject_type"] == "user":
            connection.execute("UPDATE users SET plan=?,updated_at=? WHERE id=?", (row["target_plan"], now, row["subject_id"]))
        else:
            connection.execute("UPDATE teams SET plan=?,updated_at=? WHERE id=?", (row["target_plan"], now, row["subject_id"]))
        updated = connection.execute("SELECT * FROM billing_orders WHERE id=?", (order_id,)).fetchone()
    write_audit(
        actor_user_id=user_id, team_id=team_id, action="billing.order.simulate_paid", resource_type="billing_order", resource_id=order_id,
        metadata={"target_plan": row["target_plan"], "subject_type": row["subject_type"]},
    )
    return _order_from_row(updated)


def list_subscriptions(user_id: str, team_id: str | None) -> list[SubscriptionResponse]:
    with connect() as connection:
        clauses = ["(subject_type='user' AND subject_id=?)"]
        params: list[object] = [user_id]
        if team_id:
            clauses.append("(subject_type='team' AND subject_id=?)")
            params.append(team_id)
        rows = connection.execute(
            f"SELECT * FROM subscriptions WHERE {' OR '.join(clauses)} ORDER BY updated_at DESC",
            tuple(params),
        ).fetchall()
    return [SubscriptionResponse(
        id=row["id"], subject_type=row["subject_type"], subject_id=row["subject_id"], plan=row["plan"],
        status=row["status"], billing_cycle=row["billing_cycle"], starts_at=row["starts_at"], ends_at=row["ends_at"],
        auto_renew=bool(row["auto_renew"]), provider=row["provider"], external_reference=row["external_reference"],
        created_at=row["created_at"], updated_at=row["updated_at"],
    ) for row in rows]
