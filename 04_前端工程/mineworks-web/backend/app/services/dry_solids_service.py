from datetime import datetime, timezone
from app.contracts.dry_solids import (
    CalculationStep,
    DrySolidsCalculateRequest,
    DrySolidsCalculateResponse,
    DrySolidsResults,
    EngineeringWarning,
    NormalizedDrySolidsInputs,
    ResultValue,
)
from mining_core.dry_solids import DrySolidsInput, calculate_dry_solids


def _to_volume_flow_m3_h(value: float, unit: str) -> float:
    if unit == "m3/h":
        return value
    if unit == "L/s":
        return value * 3.6
    raise ValueError(f"Unsupported volume-flow unit: {unit}")


def _to_density_t_m3(value: float, unit: str) -> float:
    if unit in {"t/m3", "kg/L"}:
        return value
    if unit == "kg/m3":
        return value / 1000
    raise ValueError(f"Unsupported density unit: {unit}")


def _to_fraction(value: float, unit: str) -> float:
    if unit == "%":
        return value / 100
    if unit == "fraction":
        return value
    raise ValueError(f"Unsupported concentration unit: {unit}")


def calculate(request: DrySolidsCalculateRequest, request_id: str) -> DrySolidsCalculateResponse:
    normalized = NormalizedDrySolidsInputs(
        slurry_volume_flow_m3_h=_to_volume_flow_m3_h(
            request.inputs.slurry_volume_flow.value,
            request.inputs.slurry_volume_flow.unit,
        ),
        slurry_density_t_m3=_to_density_t_m3(
            request.inputs.slurry_density.value,
            request.inputs.slurry_density.unit,
        ),
        solids_mass_fraction=_to_fraction(
            request.inputs.solids_mass_fraction.value,
            request.inputs.solids_mass_fraction.unit,
        ),
    )

    core_input = DrySolidsInput(**normalized.model_dump())
    result = calculate_dry_solids(core_input)

    mass_result = ResultValue(value=round(result.slurry_mass_flow_t_h, 6), unit="t/h", precision=2)
    solids_result = ResultValue(value=round(result.dry_solids_rate_t_h, 6), unit="t/h", precision=2)
    water_result = ResultValue(value=round(result.water_mass_flow_t_h, 6), unit="t/h", precision=2)

    steps = [
        CalculationStep(
            id="normalize-inputs",
            title="统一输入单位",
            description="将体积流量、矿浆密度和质量浓度转换为计算基准单位。",
            formula="Qv [m³/h], ρm [t/m³], Cw [fraction]",
            substituted_expression=(
                f"Qv = {normalized.slurry_volume_flow_m3_h:.4f} m³/h; "
                f"ρm = {normalized.slurry_density_t_m3:.4f} t/m³; "
                f"Cw = {normalized.solids_mass_fraction:.6f}"
            ),
            result=ResultValue(value=normalized.solids_mass_fraction, unit="fraction", precision=6),
            note="0是有效输入；空值必须在前端和API校验阶段明确处理。",
        ),
        CalculationStep(
            id="slurry-mass-flow",
            title="计算矿浆质量流量",
            description="矿浆体积流量乘以矿浆密度。",
            formula="Qm = Qv × ρm",
            substituted_expression=(
                f"Qm = {normalized.slurry_volume_flow_m3_h:.4f} × "
                f"{normalized.slurry_density_t_m3:.4f} = {result.slurry_mass_flow_t_h:.6f} t/h"
            ),
            result=mass_result,
        ),
        CalculationStep(
            id="dry-solids-rate",
            title="计算干固体量",
            description="矿浆质量流量乘以固体质量分数。",
            formula="Qs = Qm × Cw",
            substituted_expression=(
                f"Qs = {result.slurry_mass_flow_t_h:.6f} × "
                f"{normalized.solids_mass_fraction:.6f} = {result.dry_solids_rate_t_h:.6f} t/h"
            ),
            result=solids_result,
        ),
        CalculationStep(
            id="water-mass-flow",
            title="计算水量",
            description="矿浆质量流量扣除干固体量。",
            formula="Qw = Qm − Qs",
            substituted_expression=(
                f"Qw = {result.slurry_mass_flow_t_h:.6f} − "
                f"{result.dry_solids_rate_t_h:.6f} = {result.water_mass_flow_t_h:.6f} t/h"
            ),
            result=water_result,
            note="按水密度约1.0 t/m³时，水量t/h可近似对应m³/h；正式水量平衡应单独处理温度和溶解物影响。",
        ),
    ]

    warnings = [EngineeringWarning(code=warning.code, severity=warning.severity, title=warning.title, message=warning.message, field=warning.field) for warning in result.warnings]
    summary = (
        f"干固体量为 {result.dry_solids_rate_t_h:.2f} t/h，"
        f"矿浆质量流量为 {result.slurry_mass_flow_t_h:.2f} t/h，"
        f"水量为 {result.water_mass_flow_t_h:.2f} t/h。"
    )

    return DrySolidsCalculateResponse(
        request_id=request_id,
        computed_at=datetime.now(timezone.utc),
        validity=result.validity,
        summary=summary,
        normalized_inputs=normalized,
        results=DrySolidsResults(
            slurry_mass_flow=mass_result,
            dry_solids_rate=solids_result,
            water_mass_flow=water_result,
        ),
        steps=steps,
        warnings=warnings,
        assumptions=[
            "矿浆在测量断面内均匀，体积流量和密度代表同一时段工况。",
            "固体质量浓度采用质量分数定义。",
            "本工具不计算固体真密度、体积浓度或溶解盐质量。",
        ],
    )
