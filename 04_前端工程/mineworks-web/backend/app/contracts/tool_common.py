from typing import Literal
from pydantic import BaseModel

WarningSeverity = Literal["info", "warning"]


class UnitValue(BaseModel):
    value: float
    unit: str


class ResultValue(BaseModel):
    value: float
    unit: str
    precision: int


class CalculationStep(BaseModel):
    id: str
    title: str
    description: str | None = None
    formula: str
    substituted_expression: str
    result: ResultValue
    note: str | None = None


class EngineeringWarning(BaseModel):
    code: str
    severity: WarningSeverity
    title: str
    message: str
    field: str | None = None
