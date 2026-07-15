from pathlib import Path
from fastapi.testclient import TestClient
from app.database import configure_database, initialize_database
from app.main import app


def register_user(client, email: str, display_name: str, password: str = "MineWorks1234"):
    response = client.post("/api/v1/auth/register", json={"email": email, "password": password, "display_name": display_name})
    assert response.status_code == 201, response.text
    payload = response.json()
    return payload, {"Authorization": f"Bearer {payload['access_token']}", "X-Team-Id": payload["active_team_id"]}


def with_team(headers: dict[str, str], team_id: str) -> dict[str, str]:
    return {**headers, "X-Team-Id": team_id}


def activate_team_plan(client, headers: dict[str, str]) -> None:
    order = client.post(
        "/api/v1/billing/checkout-intents",
        headers=headers,
        json={"subject_type":"team","target_plan":"team","billing_cycle":"monthly"},
    )
    assert order.status_code == 201, order.text
    paid = client.post(f"/api/v1/billing/orders/{order.json()['id']}/simulate-paid", headers=headers)
    assert paid.status_code == 200, paid.text


def test_team_invitation_role_and_server_authorization(tmp_path: Path) -> None:
    configure_database(tmp_path / "rbac.db"); initialize_database()
    with TestClient(app) as client:
        owner, owner_headers = register_user(client, "owner@example.com", "所有者")
        viewer, viewer_headers = register_user(client, "viewer@example.com", "查看者")
        team_id = owner["active_team_id"]
        activate_team_plan(client, owner_headers)

        invitation = client.post(f"/api/v1/teams/{team_id}/invitations", headers=owner_headers, json={"email":"viewer@example.com","role":"viewer"})
        assert invitation.status_code == 201, invitation.text
        token = invitation.json()["accept_token"]
        accepted = client.post("/api/v1/team-invitations/accept", headers=viewer_headers, json={"token":token})
        assert accepted.status_code == 200

        viewer_team_headers = with_team(viewer_headers, team_id)
        denied = client.post("/api/v1/projects", headers=viewer_team_headers, json={"name":"无权创建"})
        assert denied.status_code == 403

        project = client.post("/api/v1/projects", headers=owner_headers, json={"name":"团队可见项目"})
        assert project.status_code == 201
        listed = client.get("/api/v1/projects", headers=viewer_team_headers)
        assert listed.status_code == 200
        assert listed.json()["total"] == 1

        role_update = client.patch(f"/api/v1/teams/{team_id}/members/{viewer['user']['id']}", headers=owner_headers, json={"role":"engineer"})
        assert role_update.status_code == 200
        allowed = client.post("/api/v1/projects", headers=viewer_team_headers, json={"name":"工程师项目"})
        assert allowed.status_code == 201


def test_private_project_member_access(tmp_path: Path) -> None:
    configure_database(tmp_path / "private.db"); initialize_database()
    with TestClient(app) as client:
        owner, owner_headers = register_user(client, "owner@example.com", "所有者")
        engineer, engineer_headers = register_user(client, "engineer@example.com", "工程师")
        team_id=owner["active_team_id"]
        activate_team_plan(client, owner_headers)
        inv=client.post(f"/api/v1/teams/{team_id}/invitations",headers=owner_headers,json={"email":"engineer@example.com","role":"engineer"}).json()
        assert client.post("/api/v1/team-invitations/accept",headers=engineer_headers,json={"token":inv["accept_token"]}).status_code==200
        engineer_team_headers=with_team(engineer_headers,team_id)
        project=client.post("/api/v1/projects",headers=owner_headers,json={"name":"私有项目","visibility":"private"}).json()
        assert client.get(f"/api/v1/projects/{project['id']}",headers=engineer_team_headers).status_code==404
        added=client.post(f"/api/v1/projects/{project['id']}/members",headers=owner_headers,json={"email":"engineer@example.com","role":"editor"})
        assert added.status_code==201,added.text
        visible=client.get(f"/api/v1/projects/{project['id']}",headers=engineer_team_headers)
        assert visible.status_code==200
        assert visible.json()["my_role"]=="editor"
