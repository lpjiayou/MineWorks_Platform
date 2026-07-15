from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field
from app.contracts.tool_common import CalculationStep, EngineeringWarning, ResultValue, UnitValue, WarningSeverity

Validity = Literal["VALID", "CAUTION", "INVALID"]


class DrySolidsInputs(BaseModel):
    slurry_volume_flow: UnitValue
    slurry_density: UnitValue
    solids_mass_fraction: UnitValue


class DrySolidsCalculateRequest(BaseModel):
    tool_id: Literal["dry-solids-rate"] = "dry-solids-rate"
    formula_version: Literal["1.0.0"] = "1.0.0"
    inputs: DrySolidsInputs


class NormalizedDrySolidsInputs(BaseModel):
    slurry_volume_flow_m3_h: float = Field(ge=0)
    slurry_density_t_m3: float = Field(gt=0)
    solids_mass_fraction: float = Field(ge=0, le=1)


class DrySolidsResults(BaseModel):
    slurry_mass_flow: ResultValue
    dry_solids_rate: ResultValue
    water_mass_flow: ResultValue


class DrySolidsCalculateResponse(BaseModel):
    request_id: str
    tool_id: Literal["dry-solids-rate"] = "dry-solids-rate"
    formula_version: Literal["1.0.0"] = "1.0.0"
    computed_at: datetime
    validity: Validity
    summary: str
    normalized_inputs: NormalizedDrySolidsInputs
    results: DrySolidsResults
    steps: list[CalculationStep]
    warnings: list[EngineeringWarning]
    assumptions: list[str]
