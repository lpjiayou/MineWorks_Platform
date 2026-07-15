from datetime import datetime, timezone
from app.contracts.slurry_density import (
    NormalizedSlurryDensityInputs,
    SlurryDensityCalculateRequest,
    SlurryDensityCalculateResponse,
    SlurryDensityResults,
)
from app.contracts.tool_common import CalculationStep, EngineeringWarning, ResultValue
from mining_core.slurry_density import SlurryDensityInput, calculate_slurry_density


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


def _normalize(request: SlurryDensityCalculateRequest) -> NormalizedSlurryDensityInputs:
    if request.mode == "from_slurry_density":
        known = _to_density_t_m3(request.inputs.known_value.value, request.inputs.known_value.unit)
        quantity = "slurry_density"
    else:
        known = _to_fraction(request.inputs.known_value.value, request.inputs.known_value.unit)
        quantity = "mass_fraction" if request.mode == "from_mass_concentration" else "volume_fraction"
    return NormalizedSlurryDensityInputs(
        mode=request.mode,
        solids_density_t_m3=_to_density_t_m3(request.inputs.solids_density.value, request.inputs.solids_density.unit),
        liquid_density_t_m3=_to_density_t_m3(request.inputs.liquid_density.value, request.inputs.liquid_density.unit),
        known_value=known,
        known_quantity=quantity,
    )


def _result_values(result) -> SlurryDensityResults:
    return SlurryDensityResults(
        slurry_density=ResultValue(value=round(result.slurry_density_t_m3, 9), unit="t/m³", precision=3),
        solids_mass_fraction=ResultValue(value=round(result.solids_mass_fraction * 100, 9), unit="%", precision=2),
        solids_volume_fraction=ResultValue(value=round(result.solids_volume_fraction * 100, 9), unit="%", precision=2),
        liquid_mass_fraction=ResultValue(value=round(result.liquid_mass_fraction * 100, 9), unit="%", precision=2),
        liquid_volume_fraction=ResultValue(value=round(result.liquid_volume_fraction * 100, 9), unit="%", precision=2),
    )


def _steps(normalized: NormalizedSlurryDensityInputs, results: SlurryDensityResults) -> list[CalculationStep]:
    rho_s = normalized.solids_density_t_m3
    rho_l = normalized.liquid_density_t_m3
    if normalized.mode == "from_mass_concentration":
        cw = normalized.known_value
        step2 = CalculationStep(
            id="slurry-density",
            title="计算矿浆密度",
            description="按两相质量分数和相密度计算混合密度。",
            formula="ρm = 1 / [Cw / ρs + (1 − Cw) / ρl]",
            substituted_expression=f"ρm = 1 / [{cw:.6f}/{rho_s:.6f} + {(1-cw):.6f}/{rho_l:.6f}] = {results.slurry_density.value:.9f} t/m³",
            result=results.slurry_density,
        )
        step3 = CalculationStep(
            id="volume-concentration",
            title="计算固体体积浓度",
            description="将固体质量分数换算为固体体积分数。",
            formula="Cv = Cw × ρm / ρs",
            substituted_expression=f"Cv = {cw:.6f} × {results.slurry_density.value:.9f} / {rho_s:.6f} = {results.solids_volume_fraction.value:.6f}%",
            result=results.solids_volume_fraction,
        )
    elif normalized.mode == "from_slurry_density":
        rho_m = normalized.known_value
        step2 = CalculationStep(
            id="volume-concentration",
            title="反算固体体积浓度",
            description="由矿浆密度在液相和固相密度之间的位置计算体积分数。",
            formula="Cv = (ρm − ρl) / (ρs − ρl)",
            substituted_expression=f"Cv = ({rho_m:.6f} − {rho_l:.6f}) / ({rho_s:.6f} − {rho_l:.6f}) = {results.solids_volume_fraction.value:.6f}%",
            result=results.solids_volume_fraction,
        )
        step3 = CalculationStep(
            id="mass-concentration",
            title="计算固体质量浓度",
            description="由固体体积分数、固体密度和矿浆密度计算质量分数。",
            formula="Cw = Cv × ρs / ρm",
            substituted_expression=f"Cw = {results.solids_volume_fraction.value/100:.9f} × {rho_s:.6f} / {rho_m:.6f} = {results.solids_mass_fraction.value:.6f}%",
            result=results.solids_mass_fraction,
        )
    else:
        cv = normalized.known_value
        step2 = CalculationStep(
            id="slurry-density",
            title="计算矿浆密度",
            description="按固体和液体体积分数进行密度加权。",
            formula="ρm = Cv × ρs + (1 − Cv) × ρl",
            substituted_expression=f"ρm = {cv:.6f} × {rho_s:.6f} + {(1-cv):.6f} × {rho_l:.6f} = {results.slurry_density.value:.9f} t/m³",
            result=results.slurry_density,
        )
        step3 = CalculationStep(
            id="mass-concentration",
            title="计算固体质量浓度",
            description="将固体体积分数换算为质量分数。",
            formula="Cw = Cv × ρs / ρm",
            substituted_expression=f"Cw = {cv:.6f} × {rho_s:.6f} / {results.slurry_density.value:.9f} = {results.solids_mass_fraction.value:.6f}%",
            result=results.solids_mass_fraction,
        )

    return [
        CalculationStep(
            id="normalize-inputs",
            title="统一输入单位",
            description="将固体密度、液相密度和已知量转换为计算基准单位。",
            formula="ρs [t/m³], ρl [t/m³], concentration [fraction]",
            substituted_expression=(
                f"ρs = {rho_s:.6f} t/m³; ρl = {rho_l:.6f} t/m³; "
                f"known = {normalized.known_value:.9f} ({normalized.known_quantity})"
            ),
            result=ResultValue(value=normalized.known_value, unit="fraction" if normalized.known_quantity != "slurry_density" else "t/m³", precision=6),
            note="浓度基准值采用0～1分数；API结果按百分数返回用于界面展示。",
        ),
        step2,
        step3,
        CalculationStep(
            id="phase-closure",
            title="检查两相闭合",
            description="固体与液体的质量分数、体积分数应分别闭合到100%。",
            formula="Cw + Lw = 100%; Cv + Lv = 100%",
            substituted_expression=(
                f"{results.solids_mass_fraction.value:.6f}% + {results.liquid_mass_fraction.value:.6f}% = 100%; "
                f"{results.solids_volume_fraction.value:.6f}% + {results.liquid_volume_fraction.value:.6f}% = 100%"
            ),
            result=ResultValue(value=100, unit="%", precision=2),
            note="闭合仅验证两相换算关系，不代表现场取样或在线测量不存在误差。",
        ),
    ]


def calculate(request: SlurryDensityCalculateRequest, request_id: str) -> SlurryDensityCalculateResponse:
    normalized = _normalize(request)
    core_input = SlurryDensityInput(
        mode=normalized.mode,
        solids_density_t_m3=normalized.solids_density_t_m3,
        liquid_density_t_m3=normalized.liquid_density_t_m3,
        known_value=normalized.known_value,
    )
    result = calculate_slurry_density(core_input)
    results = _result_values(result)
    warnings = [
        EngineeringWarning(
            code=item.code,
            severity=item.severity,
            title=item.title,
            message=item.message,
            field=item.field,
        )
        for item in result.warnings
    ]
    summary = (
        f"矿浆密度 {results.slurry_density.value:.3f} t/m³，"
        f"固体质量浓度 {results.solids_mass_fraction.value:.2f}%，"
        f"固体体积浓度 {results.solids_volume_fraction.value:.2f}%。"
    )
    return SlurryDensityCalculateResponse(
        request_id=request_id,
        computed_at=datetime.now(timezone.utc),
        validity=result.validity,
        summary=summary,
        normalized_inputs=normalized,
        results=results,
        steps=_steps(normalized, results),
        warnings=warnings,
        assumptions=[
            "矿浆按固体与液体两相体系处理，不单独计入气泡、泡沫和第三相。",
            "固相与液相体积按可加关系处理，未考虑颗粒孔隙和体积收缩。",
            "固体密度和液相密度应对应相同温度、压力及物料组成。",
            "反算结果用于工程快速核算，正式应用需结合取样、密度测量和流变性复核。",
        ],
    )
