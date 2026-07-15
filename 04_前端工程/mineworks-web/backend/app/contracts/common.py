from typing import Any, Literal
from pydantic import BaseModel, Field


class FieldError(BaseModel):
    path: str
    message: str
    type: str | None = None


class ErrorDetails(BaseModel):
    fields: list[FieldError] = Field(default_factory=list)
    context: dict[str, Any] = Field(default_factory=dict)


class ErrorResponse(BaseModel):
    code: str
    message: str
    details: ErrorDetails = Field(default_factory=ErrorDetails)
    request_id: str


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    service: str
    version: str
    environment: str
