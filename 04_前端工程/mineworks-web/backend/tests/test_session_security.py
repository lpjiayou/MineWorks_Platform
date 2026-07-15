from pathlib import Path

from fastapi.testclient import TestClient

from app.database import configure_database, initialize_database
from app.main import app


def test_cookie_session_csrf_and_logout(tmp_path: Path) -> None:
    configure_database(tmp_path / "cookie-security.db")
    initialize_database()
    with TestClient(app) as client:
        register = client.post("/api/v1/auth/register", json={
            "email": "cookie@example.com", "password": "MineWorks1234", "display_name": "Cookie User",
        })
        assert register.status_code == 201, register.text
        assert "mw_session=" in register.headers.get("set-cookie", "")
        assert client.cookies.get("mw_session")
        csrf = client.cookies.get("mw_csrf")
        assert csrf

        assert client.get("/api/v1/auth/me").status_code == 200
        denied = client.post("/api/v1/projects", json={"name": "No CSRF"})
        assert denied.status_code == 403
        assert denied.json()["detail"]["code"] == "CSRF_FAILED"

        created = client.post("/api/v1/projects", headers={"X-CSRF-Token": csrf}, json={"name": "Cookie Project"})
        assert created.status_code == 201, created.text

        logout = client.post("/api/v1/auth/logout", headers={"X-CSRF-Token": csrf})
        assert logout.status_code == 204
        assert client.get("/api/v1/auth/me").status_code == 401


def test_login_rate_limit(tmp_path: Path) -> None:
    configure_database(tmp_path / "rate-limit.db")
    initialize_database()
    with TestClient(app) as client:
        for _ in range(8):
            response = client.post("/api/v1/auth/login", json={"email":"missing@example.com","password":"BadPassword1"})
            assert response.status_code == 401
        blocked = client.post("/api/v1/auth/login", json={"email":"missing@example.com","password":"BadPassword1"})
        assert blocked.status_code == 429
        assert blocked.json()["detail"]["code"] == "LOGIN_RATE_LIMITED"
