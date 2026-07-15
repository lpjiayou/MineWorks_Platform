from __future__ import annotations

from contextlib import asynccontextmanager
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.database import configure_database, initialize_database
from app.settings import get_settings

settings = get_settings()
configure_database(
    settings.effective_database_url,
    pool_size=settings.database_pool_size,
    max_overflow=settings.database_max_overflow,
)


@asynccontextmanager
async def lifespan(_: FastAPI):
    if settings.auto_create_schema:
        initialize_database()
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="矿业智工平台工程计算API。计算核心、权限、数据库和HTTP层严格分离。",
    docs_url="/docs" if settings.docs_enabled else None,
    redoc_url="/redoc" if settings.docs_enabled else None,
    openapi_url="/openapi.json" if settings.docs_enabled else None,
    lifespan=lifespan,
)

if settings.trusted_host_list:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.trusted_host_list)
if settings.force_https:
    app.add_middleware(HTTPSRedirectMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Accept", "Authorization", "Content-Type", "X-CSRF-Token", "X-Request-Id", "X-Team-Id"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    request_id = request.headers.get("x-request-id") or f"req_{uuid4().hex[:16]}"
    response = await call_next(request)
    response.headers["X-Request-Id"] = request_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=()"
    response.headers["Cache-Control"] = "no-store" if request.url.path.startswith(settings.api_prefix) else response.headers.get("Cache-Control", "")
    if settings.environment == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


app.include_router(api_router, prefix=settings.api_prefix)


@app.exception_handler(RequestValidationError)
async def request_validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    request_id = request.headers.get("x-request-id") or f"req_{uuid4().hex[:16]}"
    fields = [
        {"path": ".".join(str(item) for item in error["loc"] if item != "body"), "message": error["msg"], "type": error["type"]}
        for error in exc.errors()
    ]
    return JSONResponse(status_code=422, content={
        "code": "VALIDATION_ERROR", "message": "输入参数校验失败。",
        "details": {"fields": fields, "context": {}}, "request_id": request_id,
    })


@app.get("/", include_in_schema=False)
def root() -> dict[str, str]:
    return {"service": settings.app_name, "docs": "/docs" if settings.docs_enabled else "disabled", "health": f"{settings.api_prefix}/health"}
