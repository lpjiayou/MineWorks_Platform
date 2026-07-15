from pathlib import Path
from fastapi.testclient import TestClient
from app.database import configure_database, initialize_database
from app.main import app


def register_user(client, email: str, display_name: str, password: str = "MineWorks1234"):
    response = client.post("/api/v1/auth/register", json={"email": email, "password": password, "display_name": display_name})
    assert response.status_code == 201, response.text
    payload = response.json()
    headers = {"Authorization": f"Bearer {payload['access_token']}", "X-Team-Id": payload["active_team_id"]}
    return payload, headers


def test_register_login_me_and_logout(tmp_path: Path) -> None:
    configure_database(tmp_path / "auth.db"); initialize_database()
    with TestClient(app) as client:
        registered, headers = register_user(client, "engineer@example.com", "选矿工程师")
        assert registered["user"]["email"] == "engineer@example.com"
        assert registered["teams"][0]["role"] == "owner"
        assert "team.members.manage" in registered["permissions"]

        me = client.get("/api/v1/auth/me", headers=headers)
        assert me.status_code == 200
        assert me.json()["active_team_id"] == registered["active_team_id"]

        logout = client.post("/api/v1/auth/logout", headers=headers)
        assert logout.status_code == 204
        assert client.get("/api/v1/auth/me", headers=headers).status_code == 401

        login = client.post("/api/v1/auth/login", json={"email": "engineer@example.com", "password": "MineWorks1234"})
        assert login.status_code == 200
        assert login.json()["user"]["display_name"] == "选矿工程师"


def test_password_policy_and_duplicate_email(tmp_path: Path) -> None:
    configure_database(tmp_path / "password.db"); initialize_database()
    with TestClient(app) as client:
        weak = client.post("/api/v1/auth/register", json={"email":"a@example.com","password":"weakpassword","display_name":"A"})
        assert weak.status_code == 422
        register_user(client, "a@example.com", "A")
        duplicate = client.post("/api/v1/auth/register", json={"email":"a@example.com","password":"MineWorks1234","display_name":"B"})
        assert duplicate.status_code == 409
