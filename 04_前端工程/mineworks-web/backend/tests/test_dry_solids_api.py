import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def valid_payload() -> dict:
    return {
        "tool_id": "dry-solids-rate",
        "formula_version": "1.0.0",
        "inputs": {
            "slurry_volume_flow": {"value": 118.37, "unit": "m3/h"},
            "slurry_density": {"value": 1.38, "unit": "t/m3"},
            "solids_mass_fraction": {"value": 42, "unit": "%"},
        },
    }


def test_health() -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_calculate_endpoint() -> None:
    response = client.post("/api/v1/tools/dry-solids-rate/calculate", json=valid_payload())
    assert response.status_code == 200
    data = response.json()
    assert data["validity"] == "VALID"
    assert data["results"]["dry_solids_rate"]["value"] == pytest.approx(68.607252)
    assert data["request_id"].startswith("req_")
    assert len(data["steps"]) == 4


def test_unit_normalization() -> None:
    payload = valid_payload()
    payload["inputs"]["slurry_volume_flow"] = {"value": 10, "unit": "L/s"}
    payload["inputs"]["slurry_density"] = {"value": 1380, "unit": "kg/m3"}
    payload["inputs"]["solids_mass_fraction"] = {"value": 0.42, "unit": "fraction"}
    response = client.post("/api/v1/tools/dry-solids-rate/calculate", json=payload)
    assert response.status_code == 200
    normalized = response.json()["normalized_inputs"]
    assert normalized["slurry_volume_flow_m3_h"] == 36
    assert normalized["slurry_density_t_m3"] == 1.38
    assert normalized["solids_mass_fraction"] == 0.42


def test_invalid_concentration_returns_standard_error() -> None:
    payload = valid_payload()
    payload["inputs"]["solids_mass_fraction"] = {"value": 120, "unit": "%"}
    response = client.post("/api/v1/tools/dry-solids-rate/calculate", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["detail"]["code"] == "VALIDATION_ERROR"
