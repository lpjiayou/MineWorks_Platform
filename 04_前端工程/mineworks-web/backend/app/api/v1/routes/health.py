from fastapi import APIRouter, HTTPException

from app.contracts.common import HealthResponse
from app.database import database_healthcheck
from app.settings import get_settings

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(service=settings.app_name, version=settings.app_version, environment=settings.environment)


@router.get("/ready")
def readiness() -> dict[str, str]:
    try:
        database = database_healthcheck()
    except Exception as error:
        raise HTTPException(status_code=503, detail={"code":"DATABASE_UNAVAILABLE","message":"数据库暂不可用。"}) from error
    return {"status":"ok", "database":database["backend"]}
