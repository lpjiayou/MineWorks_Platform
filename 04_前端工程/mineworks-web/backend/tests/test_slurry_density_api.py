import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def mass_payload() -> dict:
    return {
        "tool_id": "slurry-density-conversion",
        "formula_version": "1.0.0",
        "mode": "from_mass_concentration",
        "inputs": {
            "solids_density": {"value": 2.7, "unit": "t/m3"},
            "liquid_density": {"value": 1.0, "unit": "t/m3"},
            "known_value": {"value": 42, "unit": "%"},
        },
    }


def test_calculate_from_mass_concentration() -> None:
    response = client.post("/api/v1/tools/slurry-density-conversion/calculate", json=mass_payload())
    assert response.status_code == 200
    data = response.json()
    assert data["validity"] == "VALID"
    assert data["results"]["slurry_density"]["value"] == pytest.approx(1.359516616)
    assert data["results"]["solids_mass_fraction"]["value"] == pytest.approx(42)
    assert len(data["steps"]) == 4


def test_density_unit_normalization() -> None:
    payload = mass_payload()
    payload["inputs"]["solids_density"] = {"value": 2700, "unit": "kg/m3"}
    payload["inputs"]["liquid_density"] = {"value": 1.0, "unit": "kg/L"}
    payload["inputs"]["known_value"] = {"value": 0.42, "unit": "fraction"}
    response = client.post("/api/v1/tools/slurry-density-conversion/calculate", json=payload)
    assert response.status_code == 200
    normalized = response.json()["normalized_inputs"]
    assert normalized["solids_density_t_m3"] == 2.7
    assert normalized["liquid_density_t_m3"] == 1.0
    assert normalized["known_value"] == 0.42


def test_slurry_density_mode() -> None:
    payload = mass_payload()
    payload["mode"] = "from_slurry_density"
    payload["inputs"]["known_value"] = {"value": 1.3595166163141994, "unit": "t/m3"}
    response = client.post("/api/v1/tools/slurry-density-conversion/calculate", json=payload)
    assert response.status_code == 200
    assert response.json()["results"]["solids_mass_fraction"]["value"] == pytest.approx(42)


def test_invalid_density_relationship_returns_422() -> None:
    payload = mass_payload()
    payload["inputs"]["solids_density"] = {"value": 0.9, "unit": "t/m3"}
    response = client.post("/api/v1/tools/slurry-density-conversion/calculate", json=payload)
    assert response.status_code == 422
    assert response.json()["detail"]["code"] == "VALIDATION_ERROR"
