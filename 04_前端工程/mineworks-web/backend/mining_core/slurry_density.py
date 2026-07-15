from dataclasses import dataclass
from math import isfinite
from typing import Literal

CalculationMode = Literal[
    "from_mass_concentration",
    "from_slurry_density",
    "from_volume_concentration",
]
Validity = Literal["VALID", "CAUTION"]


@dataclass(frozen=True, slots=True)
class SlurryDensityInput:
    mode: CalculationMode
    solids_density_t_m3: float
    liquid_density_t_m3: float
    known_value: float


@dataclass(frozen=True, slots=True)
class EngineeringWarning:
    code: str
    severity: Literal["info", "warning"]
    title: str
    message: str
    field: str | None = None


@dataclass(frozen=True, slots=True)
class SlurryDensityResult:
    slurry_density_t_m3: float
    solids_mass_fraction: float
    solids_volume_fraction: float
    liquid_mass_fraction: float
    liquid_volume_fraction: float
    validity: Validity
    warnings: tuple[EngineeringWarning, ...]


def _validate(data: SlurryDensityInput) -> None:
    values = (data.solids_density_t_m3, data.liquid_density_t_m3, data.known_value)
    if not all(isfinite(value) for value in values):
        raise ValueError("all inputs must be finite numbers")
    if not 0 < data.solids_density_t_m3 <= 25:
        raise ValueError("solids_density_t_m3 must be greater than 0 and less than or equal to 25")
    if not 0 < data.liquid_density_t_m3 <= 5:
        raise ValueError("liquid_density_t_m3 must be greater than 0 and less than or equal to 5")
    if data.solids_density_t_m3 <= data.liquid_density_t_m3:
        raise ValueError("solids_density_t_m3 must be greater than liquid_density_t_m3")
    if data.mode in {"from_mass_concentration", "from_volume_concentration"}:
        if not 0 <= data.known_value <= 1:
            raise ValueError("known concentration must be between 0 and 1")
    elif data.mode == "from_slurry_density":
        if not data.liquid_density_t_m3 <= data.known_value <= data.solids_density_t_m3:
            raise ValueError("slurry density must be between liquid density and solids density")
    else:
        raise ValueError(f"unsupported calculation mode: {data.mode}")


def _warnings(data: SlurryDensityInput, mass_fraction: float, volume_fraction: float) -> tuple[EngineeringWarning, ...]:
    warnings: list[EngineeringWarning] = []
    if data.solids_density_t_m3 < 1.5 or data.solids_density_t_m3 > 8.0:
        warnings.append(EngineeringWarning(
            code="SOLIDS_DENSITY_ATYPICAL",
            severity="warning",
            title="固体密度需要复核",
            message="固体密度超出1.5～8.0 t/m³的常见矿物工程范围，请确认矿物组成、测定方法和单位。",
            field="solids_density",
        ))
    if data.liquid_density_t_m3 < 0.8 or data.liquid_density_t_m3 > 1.5:
        warnings.append(EngineeringWarning(
            code="LIQUID_DENSITY_ATYPICAL",
            severity="warning",
            title="液相密度需要复核",
            message="液相密度超出0.8～1.5 t/m³的常见范围，请确认温度、溶解盐和溶液组成。",
            field="liquid_density",
        ))
    if mass_fraction > 0.75:
        warnings.append(EngineeringWarning(
            code="MASS_CONCENTRATION_HIGH",
            severity="warning",
            title="固体质量浓度较高",
            message="固体质量浓度高于75%，建议进一步核查流变性、可泵送性和取样代表性。",
            field="known_value" if data.mode == "from_mass_concentration" else None,
        ))
    if volume_fraction > 0.50:
        warnings.append(EngineeringWarning(
            code="VOLUME_CONCENTRATION_HIGH",
            severity="warning",
            title="固体体积浓度较高",
            message="固体体积浓度高于50%，两相体积可加假设和均匀悬浮条件需要重点复核。",
            field="known_value" if data.mode == "from_volume_concentration" else None,
        ))
    if data.mode == "from_slurry_density" and data.solids_density_t_m3 - data.liquid_density_t_m3 < 0.10:
        warnings.append(EngineeringWarning(
            code="DENSITY_CONTRAST_LOW",
            severity="warning",
            title="密度差较小",
            message="固体与液相密度差较小，利用矿浆密度反算浓度会对测量误差较敏感。",
            field="solids_density",
        ))
    return tuple(warnings)


def calculate_slurry_density(data: SlurryDensityInput) -> SlurryDensityResult:
    _validate(data)
    rho_s = data.solids_density_t_m3
    rho_l = data.liquid_density_t_m3

    if data.mode == "from_mass_concentration":
        mass_fraction = data.known_value
        denominator = mass_fraction / rho_s + (1 - mass_fraction) / rho_l
        slurry_density = 1 / denominator
        volume_fraction = mass_fraction * slurry_density / rho_s
    elif data.mode == "from_slurry_density":
        slurry_density = data.known_value
        volume_fraction = (slurry_density - rho_l) / (rho_s - rho_l)
        mass_fraction = volume_fraction * rho_s / slurry_density
    else:
        volume_fraction = data.known_value
        slurry_density = volume_fraction * rho_s + (1 - volume_fraction) * rho_l
        mass_fraction = volume_fraction * rho_s / slurry_density

    # Numerical noise near 0 and 1 should not leak into the API.
    mass_fraction = min(1.0, max(0.0, mass_fraction))
    volume_fraction = min(1.0, max(0.0, volume_fraction))
    warnings = _warnings(data, mass_fraction, volume_fraction)
    return SlurryDensityResult(
        slurry_density_t_m3=slurry_density,
        solids_mass_fraction=mass_fraction,
        solids_volume_fraction=volume_fraction,
        liquid_mass_fraction=1 - mass_fraction,
        liquid_volume_fraction=1 - volume_fraction,
        validity="CAUTION" if warnings else "VALID",
        warnings=warnings,
    )
