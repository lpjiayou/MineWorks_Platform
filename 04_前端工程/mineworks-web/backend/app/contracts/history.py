from __future__ import annotations

from typing import Any, Literal
from pydantic import BaseModel, Field, field_validator

ProjectRole = Literal["owner", "manager", "editor", "viewer"]


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    code: str | None = Field(default=None, max_length=60)
    description: str = Field(default="", max_length=1000)
    visibility: Literal["team", "private"] = "team"


class ProjectResponse(BaseModel):
    id: str
    name: str
    code: str | None
    description: str
    status: Literal["active", "archived"]
    team_id: str | None = None
    owner_user_id: str | None = None
    created_by: str | None = None
    visibility: Literal["team", "private"] = "team"
    my_role: ProjectRole | None = None
    record_count: int = 0
    member_count: int = 0
    created_at: str
    updated_at: str


class ProjectListResponse(BaseModel):
    items: list[ProjectResponse]
    total: int


class ProjectMemberResponse(BaseModel):
    user_id: str
    email: str
    display_name: str
    role: ProjectRole
    status: Literal["active", "suspended"]
    created_at: str
    updated_at: str


class ProjectMemberAdd(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    role: Literal["manager", "editor", "viewer"] = "editor"

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class ProjectMemberRoleUpdate(BaseModel):
    role: Literal["manager", "editor", "viewer"]


class ReuseMapping(BaseModel):
    target_tool_id: str
    target_field: str
    target_unit: str
    target_mode: str | None = None


class ReusableOutput(BaseModel):
    key: str
    label: str
    value: float
    unit: str
    quantity: str
    mappings: list[ReuseMapping] = Field(default_factory=list)


class CalculationRecordCreate(BaseModel):
    source_request_id: str
    tool_id: str
    tool_name: str
    tool_version: str
    formula_version: str
    title: str = Field(min_length=1, max_length=160)
    project_id: str | None = None
    data_source: str = "manual"
    validity: str
    computed_at: str
    inputs: dict[str, Any]
    normalized_inputs: dict[str, Any]
    results: dict[str, Any]
    steps: list[dict[str, Any]] = Field(default_factory=list)
    warnings: list[dict[str, Any]] = Field(default_factory=list)
    assumptions: list[str] = Field(default_factory=list)
    reusable_outputs: list[ReusableOutput] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
    note: str = Field(default="", max_length=2000)


class CalculationRecordUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=160)
    project_id: str | None = None
    clear_project: bool = False
    tags: list[str] | None = None
    note: str | None = Field(default=None, max_length=2000)


class CalculationRecordResponse(CalculationRecordCreate):
    id: str
    team_id: str | None = None
    owner_user_id: str | None = None
    created_by: str | None = None
    saved_at: str
    updated_at: str
    project: ProjectResponse | None = None


class CalculationRecordListResponse(BaseModel):
    items: list[CalculationRecordResponse]
    total: int


class ReuseValue(BaseModel):
    source_key: str
    source_label: str
    target_field: str
    value: float
    unit: str
    target_mode: str | None = None


class ReusePackageResponse(BaseModel):
    record_id: str
    source_tool_id: str
    source_tool_name: str
    target_tool_id: str
    values: list[ReuseValue]
    warnings: list[str] = Field(default_factory=list)
