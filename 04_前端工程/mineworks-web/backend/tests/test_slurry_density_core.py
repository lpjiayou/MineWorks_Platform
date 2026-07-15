import pytest
from mining_core.slurry_density import SlurryDensityInput, calculate_slurry_density


def test_from_mass_concentration() -> None:
    result = calculate_slurry_density(SlurryDensityInput(
        mode="from_mass_concentration",
        solids_density_t_m3=2.7,
        liquid_density_t_m3=1.0,
        known_value=0.42,
    ))
    assert result.slurry_density_t_m3 == pytest.approx(1.3595166163141994)
    assert result.solids_mass_fraction == pytest.approx(0.42)
    assert result.solids_volume_fraction == pytest.approx(0.21148036253776434)
    assert result.liquid_mass_fraction + result.solids_mass_fraction == pytest.approx(1.0)
    assert result.liquid_volume_fraction + result.solids_volume_fraction == pytest.approx(1.0)
    assert result.validity == "VALID"


def test_round_trip_from_slurry_density() -> None:
    result = calculate_slurry_density(SlurryDensityInput(
        mode="from_slurry_density",
        solids_density_t_m3=2.7,
        liquid_density_t_m3=1.0,
        known_value=1.3595166163141994,
    ))
    assert result.solids_mass_fraction == pytest.approx(0.42)
    assert result.solids_volume_fraction == pytest.approx(0.21148036253776434)


def test_from_volume_concentration() -> None:
    result = calculate_slurry_density(SlurryDensityInput(
        mode="from_volume_concentration",
        solids_density_t_m3=2.7,
        liquid_density_t_m3=1.0,
        known_value=0.25,
    ))
    assert result.slurry_density_t_m3 == pytest.approx(1.425)
    assert result.solids_mass_fraction == pytest.approx(0.4736842105263158)


def test_zero_concentration_is_valid() -> None:
    result = calculate_slurry_density(SlurryDensityInput(
        mode="from_mass_concentration",
        solids_density_t_m3=2.7,
        liquid_density_t_m3=1.0,
        known_value=0.0,
    ))
    assert result.slurry_density_t_m3 == 1.0
    assert result.solids_volume_fraction == 0.0


def test_high_concentration_returns_caution() -> None:
    result = calculate_slurry_density(SlurryDensityInput(
        mode="from_mass_concentration",
        solids_density_t_m3=2.7,
        liquid_density_t_m3=1.0,
        known_value=0.80,
    ))
    assert result.validity == "CAUTION"
    assert any(item.code == "MASS_CONCENTRATION_HIGH" for item in result.warnings)


@pytest.mark.parametrize("data", [
    SlurryDensityInput("from_mass_concentration", 0, 1.0, 0.4),
    SlurryDensityInput("from_mass_concentration", 1.0, 1.0, 0.4),
    SlurryDensityInput("from_mass_concentration", 2.7, 1.0, 1.1),
    SlurryDensityInput("from_slurry_density", 2.7, 1.0, 3.0),
])
def test_invalid_inputs_are_rejected(data: SlurryDensityInput) -> None:
    with pytest.raises(ValueError):
        calculate_slurry_density(data)
