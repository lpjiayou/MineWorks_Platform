from dataclasses import dataclass
from typing import Literal

Validity = Literal["VALID", "CAUTION"]


@dataclass(frozen=True, slots=True)
class DrySolidsInput:
    slurry_volume_flow_m3_h: float
    slurry_density_t_m3: float
    solids_mass_fraction: float


@dataclass(frozen=True, slots=True)
class EngineeringWarning:
    code: str
    severity: Literal["info", "warning"]
    title: str
    message: str
    field: str | None = None


@dataclass(frozen=True, slots=True)
class DrySolidsResult:
    slurry_mass_flow_t_h: float
    dry_solids_rate_t_h: float
    water_mass_flow_t_h: float
    validity: Validity
    warnings: tuple[EngineeringWarning, ...]


def validate_engineering_ranges(data: DrySolidsInput) -> tuple[EngineeringWarning, ...]:
    warnings: list[EngineeringWarning] = []
    if data.slurry_volume_flow_m3_h > 50_000:
        warnings.append(EngineeringWarning(
            code="VOLUME_FLOW_HIGH",
            severity="warning",
            title="体积流量超出常见范围",
            message="矿浆体积流量高于50,000 m³/h，请确认单位、测点和工况。",
            field="slurry_volume_flow",
        ))
    if data.slurry_density_t_m3 < 1.0 or data.slurry_density_t_m3 > 4.5:
        warnings.append(EngineeringWarning(
            code="SLURRY_DENSITY_ATYPICAL",
            severity="warning",
            title="矿浆密度需要复核",
            message="矿浆密度超出1.0～4.5 t/m³的常见工程范围，请确认介质和单位。",
            field="slurry_density",
        ))
    if data.solids_mass_fraction > 0.75:
        warnings.append(EngineeringWarning(
            code="SOLIDS_CONCENTRATION_HIGH",
            severity="warning",
            title="固体质量浓度较高",
            message="固体质量浓度高于75%，请确认该物流是否仍可按均匀矿浆处理。",
            field="solids_mass_fraction",
        ))
    return tuple(warnings)


def calculate_dry_solids(data: DrySolidsInput) -> DrySolidsResult:
    if data.slurry_volume_flow_m3_h < 0:
        raise ValueError("slurry_volume_flow_m3_h must be greater than or equal to 0")
    if not 0 < data.slurry_density_t_m3 <= 10:
        raise ValueError("slurry_density_t_m3 must be greater than 0 and less than or equal to 10")
    if not 0 <= data.solids_mass_fraction <= 1:
        raise ValueError("solids_mass_fraction must be between 0 and 1")

    slurry_mass_flow = data.slurry_volume_flow_m3_h * data.slurry_density_t_m3
    dry_solids_rate = slurry_mass_flow * data.solids_mass_fraction
    water_mass_flow = slurry_mass_flow - dry_solids_rate
    warnings = validate_engineering_ranges(data)

    return DrySolidsResult(
        slurry_mass_flow_t_h=slurry_mass_flow,
        dry_solids_rate_t_h=dry_solids_rate,
        water_mass_flow_t_h=water_mass_flow,
        validity="CAUTION" if warnings else "VALID",
        warnings=warnings,
    )
