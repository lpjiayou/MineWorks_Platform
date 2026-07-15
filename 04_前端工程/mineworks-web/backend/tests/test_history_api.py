from pathlib import Path

from fastapi.testclient import TestClient

from app.database import configure_database, initialize_database
from app.main import app


def record_payload(project_id: str | None = None) -> dict:
    return {
        "source_request_id": "req_demo_001",
        "tool_id": "slurry-density-conversion",
        "tool_name": "矿浆密度与浓度换算",
        "tool_version": "1.0.0",
        "formula_version": "1.0.0",
        "title": "矿浆密度换算测试",
        "project_id": project_id,
        "data_source": "manual",
        "validity": "VALID",
        "computed_at": "2026-07-14T08:00:00+00:00",
        "inputs": {"mode": "from_mass_concentration"},
        "normalized_inputs": {"solids_density_t_m3": 2.7, "liquid_density_t_m3": 1.0},
        "results": {
            "slurry_density": {"value": 1.3595, "unit": "t/m3", "precision": 3},
            "solids_mass_fraction": {"value": 42.0, "unit": "%", "precision": 2},
        },
        "steps": [],
        "warnings": [],
        "assumptions": ["固液两相体积可加"],
        "reusable_outputs": [
            {
                "key": "slurry_density",
                "label": "矿浆密度",
                "value": 1.3595,
                "unit": "t/m3",
                "quantity": "density",
                "mappings": [
                    {
                        "target_tool_id": "dry-solids-rate",
                        "target_field": "slurryDensity",
                        "target_unit": "t/m3",
                    }
                ],
            }
        ],
        "tags": ["矿浆", "密度"],
        "note": "测试记录",
    }



def register_user(client, email: str, display_name: str, password: str = "MineWorks1234"):
    response = client.post("/api/v1/auth/register", json={"email": email, "password": password, "display_name": display_name})
    assert response.status_code == 201, response.text
    payload = response.json()
    headers = {"Authorization": f"Bearer {payload['access_token']}", "X-Team-Id": payload["active_team_id"]}
    return payload, headers


def test_project_record_and_reuse_flow(tmp_path: Path) -> None:
    configure_database(tmp_path / "history.db")
    initialize_database()
    with TestClient(app) as client:
        identity, headers = register_user(client, "owner@example.com", "项目负责人")
        project_response = client.post("/api/v1/projects", headers=headers, json={"name": "某金矿扩建项目", "code": "MW-001", "description": "测试项目"})
        assert project_response.status_code == 201, project_response.text
        project = project_response.json()
        assert project["record_count"] == 0
        assert project["my_role"] == "owner"

        save_response = client.post("/api/v1/calculation-records", headers=headers, json=record_payload(project["id"]))
        assert save_response.status_code == 201, save_response.text
        record = save_response.json()
        assert record["project"]["name"] == "某金矿扩建项目"
        assert record["owner_user_id"] == identity["user"]["id"]

        list_response = client.get("/api/v1/calculation-records", headers=headers, params={"project_id": project["id"]})
        assert list_response.status_code == 200
        assert list_response.json()["total"] == 1

        reuse_response = client.get(f"/api/v1/calculation-records/{record['id']}/reuse", headers=headers, params={"target_tool_id": "dry-solids-rate"})
        assert reuse_response.status_code == 200
        assert reuse_response.json()["values"][0]["target_field"] == "slurryDensity"

        update_response = client.patch(f"/api/v1/calculation-records/{record['id']}", headers=headers, json={"title": "更新后的记录标题", "note": "已复核"})
        assert update_response.status_code == 200
        assert update_response.json()["title"] == "更新后的记录标题"

        project_after = client.get(f"/api/v1/projects/{project['id']}", headers=headers).json()
        assert project_after["record_count"] == 1

        delete_response = client.delete(f"/api/v1/calculation-records/{record['id']}", headers=headers)
        assert delete_response.status_code == 204
        assert client.get("/api/v1/calculation-records", headers=headers).json()["total"] == 0


def test_duplicate_project_code_returns_conflict(tmp_path: Path) -> None:
    configure_database(tmp_path / "duplicate.db")
    initialize_database()
    with TestClient(app) as client:
        _, headers = register_user(client, "owner@example.com", "项目负责人")
        payload = {"name": "项目A", "code": "DUP-001"}
        assert client.post("/api/v1/projects", headers=headers, json=payload).status_code == 201
        response = client.post("/api/v1/projects", headers=headers, json={"name": "项目B", "code": "DUP-001"})
        assert response.status_code == 409


def test_history_requires_authentication(tmp_path: Path) -> None:
    configure_database(tmp_path / "auth-required.db")
    initialize_database()
    with TestClient(app) as client:
        assert client.get("/api/v1/projects").status_code == 401
        assert client.get("/api/v1/calculation-records").status_code == 401
