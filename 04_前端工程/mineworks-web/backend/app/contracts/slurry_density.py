from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field
from app.contracts.tool_common import CalculationStep, EngineeringWarning, ResultValue, UnitValue

CalculationMode = Literal[
    "from_mass_concentration",
    "from_slurry_density",
    "from_volume_concentration",
]
Validity = Literal["VALID", "CAUTION", "INVALID"]


class SlurryDensityInputs(BaseModel):
    solids_density: UnitValue
    liquid_density: UnitValue
    known_value: UnitValue


class SlurryDensityCalculateRequest(BaseModel):
    tool_id: Literal["slurry-density-conversion"] = "slurry-density-conversion"
    formula_version: Literal["1.0.0"] = "1.0.0"
    mode: CalculationMode
    inputs: SlurryDensityInputs


class NormalizedSlurryDensityInputs(BaseModel):
    mode: CalculationMode
    solids_density_t_m3: float = Field(gt=0)
    liquid_density_t_m3: float = Field(gt=0)
    known_value: float
    known_quantity: Literal["mass_fraction", "slurry_density", "volume_fraction"]


class SlurryDensityResults(BaseModel):
    slurry_density: ResultValue
    solids_mass_fraction: ResultValue
    solids_volume_fraction: ResultValue
    liquid_mass_fraction: ResultValue
    liquid_volume_fraction: ResultValue


class SlurryDensityCalculateResponse(BaseModel):
    request_id: str
    tool_id: Literal["slurry-density-conversion"] = "slurry-density-conversion"
    formula_version: Literal["1.0.0"] = "1.0.0"
    computed_at: datetime
    validity: Validity
    summary: str
    normalized_inputs: NormalizedSlurryDensityInputs
    results: SlurryDensityResults
    steps: list[CalculationStep]
    warnings: list[EngineeringWarning]
    assumptions: list[str]
