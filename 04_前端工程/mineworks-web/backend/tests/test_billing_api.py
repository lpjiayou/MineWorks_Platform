from pathlib import Path

from fastapi.testclient import TestClient

from app.database import configure_database, connect, initialize_database
from app.main import app


def register_user(client: TestClient, email: str = "billing@example.com"):
    response = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "MineWorks1234",
        "display_name": "计费测试工程师",
    })
    assert response.status_code == 201, response.text
    payload = response.json()
    headers = {"Authorization": f"Bearer {payload['access_token']}", "X-Team-Id": payload["active_team_id"]}
    return payload, headers


def dry_solids_payload() -> dict:
    return {
        "tool_id": "dry-solids-rate",
        "formula_version": "1.0.0",
        "inputs": {
            "slurry_volume_flow": {"value": 118.37, "unit": "m3/h"},
            "slurry_density": {"value": 1.38, "unit": "t/m3"},
            "solids_mass_fraction": {"value": 42, "unit": "%"},
        },
    }


def test_plan_catalog_and_personal_subscription(tmp_path: Path) -> None:
    configure_database(tmp_path / "billing.db"); initialize_database()
    with TestClient(app) as client:
        plans = client.get("/api/v1/plans")
        assert plans.status_code == 200
        assert [item["id"] for item in plans.json()] == ["free", "professional", "team", "enterprise"]

        _, headers = register_user(client)
        entitlements = client.get("/api/v1/billing/entitlements", headers=headers)
        assert entitlements.status_code == 200
        assert entitlements.json()["effective_plan"] == "free"
        assert "tool.basic.calculate" in entitlements.json()["features"]

        order = client.post("/api/v1/billing/checkout-intents", headers=headers, json={
            "subject_type": "user", "target_plan": "professional", "billing_cycle": "monthly",
        })
        assert order.status_code == 201, order.text
        assert order.json()["amount_fen"] == 9900

        paid = client.post(f"/api/v1/billing/orders/{order.json()['id']}/simulate-paid", headers=headers)
        assert paid.status_code == 200, paid.text
        assert paid.json()["status"] == "paid"

        upgraded = client.get("/api/v1/billing/entitlements", headers=headers).json()
        assert upgraded["effective_plan"] == "professional"
        assert "analysis.advanced" in upgraded["features"]
        assert client.get("/api/v1/billing/subscriptions", headers=headers).json()[0]["status"] == "active"


def test_authenticated_calculation_usage_and_quota(tmp_path: Path) -> None:
    configure_database(tmp_path / "usage.db"); initialize_database()
    with TestClient(app) as client:
        identity, headers = register_user(client, "usage@example.com")
        first = client.post("/api/v1/tools/dry-solids-rate/calculate", headers=headers, json=dry_solids_payload())
        assert first.status_code == 200, first.text
        snapshot = client.get("/api/v1/billing/entitlements", headers=headers).json()
        calculation_quota = next(item for item in snapshot["quotas"] if item["metric"] == "calculations.monthly")
        assert calculation_quota["used"] == 1

        # Force the monthly counter to the free limit and verify server-side enforcement.
        with connect() as connection:
            connection.execute("UPDATE usage_counters SET used=100 WHERE metric='calculations.monthly'")
        blocked = client.post("/api/v1/tools/dry-solids-rate/calculate", headers=headers, json=dry_solids_payload())
        assert blocked.status_code == 429
        assert blocked.json()["detail"]["code"] == "QUOTA_EXCEEDED"


def test_free_team_cannot_invite_until_team_plan_is_active(tmp_path: Path) -> None:
    configure_database(tmp_path / "team-plan.db"); initialize_database()
    with TestClient(app) as client:
        owner, owner_headers = register_user(client, "owner-billing@example.com")
        register_user(client, "member-billing@example.com")
        team_id = owner["active_team_id"]
        denied = client.post(f"/api/v1/teams/{team_id}/invitations", headers=owner_headers, json={
            "email":"member-billing@example.com", "role":"engineer",
        })
        assert denied.status_code == 403
        order = client.post("/api/v1/billing/checkout-intents", headers=owner_headers, json={
            "subject_type":"team", "target_plan":"team", "billing_cycle":"monthly",
        })
        assert order.status_code == 201
        assert client.post(f"/api/v1/billing/orders/{order.json()['id']}/simulate-paid", headers=owner_headers).status_code == 200
        allowed = client.post(f"/api/v1/teams/{team_id}/invitations", headers=owner_headers, json={
            "email":"member-billing@example.com", "role":"engineer",
        })
        assert allowed.status_code == 201, allowed.text
