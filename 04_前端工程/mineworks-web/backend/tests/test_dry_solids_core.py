import pytest
from mining_core.dry_solids import DrySolidsInput, calculate_dry_solids


def test_normal_case_is_mass_balanced() -> None:
    result = calculate_dry_solids(DrySolidsInput(118.37, 1.38, 0.42))
    assert result.slurry_mass_flow_t_h == pytest.approx(163.3506)
    assert result.dry_solids_rate_t_h == pytest.approx(68.607252)
    assert result.water_mass_flow_t_h == pytest.approx(94.743348)
    assert result.dry_solids_rate_t_h + result.water_mass_flow_t_h == pytest.approx(result.slurry_mass_flow_t_h)
    assert result.validity == "VALID"


def test_zero_flow_is_valid() -> None:
    result = calculate_dry_solids(DrySolidsInput(0, 1.38, 0.42))
    assert result.slurry_mass_flow_t_h == 0
    assert result.dry_solids_rate_t_h == 0
    assert result.water_mass_flow_t_h == 0
    assert result.validity == "VALID"


def test_atypical_density_returns_caution() -> None:
    result = calculate_dry_solids(DrySolidsInput(100, 4.8, 0.4))
    assert result.validity == "CAUTION"
    assert any(item.code == "SLURRY_DENSITY_ATYPICAL" for item in result.warnings)


@pytest.mark.parametrize("data", [
    DrySolidsInput(-1, 1.3, 0.4),
    DrySolidsInput(1, 0, 0.4),
    DrySolidsInput(1, 1.3, -0.1),
    DrySolidsInput(1, 1.3, 1.1),
])
def test_invalid_input_is_rejected(data: DrySolidsInput) -> None:
    with pytest.raises(ValueError):
        calculate_dry_solids(data)
