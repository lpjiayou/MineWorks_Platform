from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "MineWorks API"
    app_version: str = "1.1.0"
    environment: Literal["development", "test", "staging", "production"] = "development"
    api_prefix: str = "/api/v1"
    public_origin: str = "http://127.0.0.1:3000"
    cors_origins: str = "http://127.0.0.1:3000,http://localhost:3000"
    trusted_hosts: str = "127.0.0.1,localhost,testserver"

    database_url: str = ""
    database_url_file: str = ""
    database_path: str = "data/mineworks.db"
    database_pool_size: int = 5
    database_max_overflow: int = 10
    auto_create_schema: bool = True

    allow_self_registration: bool = True
    invitation_ttl_hours: int = 72

    session_ttl_hours: int = 168
    session_idle_minutes: int = 120
    session_cookie_name: str = "mw_session"
    csrf_cookie_name: str = "mw_csrf"
    cookie_secure: bool = False
    cookie_samesite: Literal["lax", "strict", "none"] = "lax"
    cookie_domain: str | None = None
    allow_bearer_tokens: bool = True
    csrf_enabled: bool = True

    login_rate_limit_attempts: int = 8
    login_rate_limit_window_minutes: int = 15
    login_rate_limit_block_minutes: int = 15

    docs_enabled: bool = True
    force_https: bool = False
    allow_local_billing_simulation: bool = True

    model_config = SettingsConfigDict(env_file=".env", env_prefix="MINEWORKS_", extra="ignore")

    @field_validator("api_prefix")
    @classmethod
    def normalize_api_prefix(cls, value: str) -> str:
        return "/" + value.strip("/")

    @model_validator(mode="after")
    def enforce_production_safety(self) -> "Settings":
        if self.environment == "production":
            if not self.effective_database_url.startswith("postgresql"):
                raise ValueError("Production requires a PostgreSQL URL through MINEWORKS_DATABASE_URL or MINEWORKS_DATABASE_URL_FILE")
            if not self.cookie_secure:
                raise ValueError("Production requires MINEWORKS_COOKIE_SECURE=true")
            if self.allow_bearer_tokens:
                raise ValueError("Production requires MINEWORKS_ALLOW_BEARER_TOKENS=false")
            if self.allow_local_billing_simulation:
                raise ValueError("Production requires MINEWORKS_ALLOW_LOCAL_BILLING_SIMULATION=false")
            if self.auto_create_schema:
                raise ValueError("Production requires MINEWORKS_AUTO_CREATE_SCHEMA=false; run Alembic migrations explicitly")
        return self

    @property
    def effective_database_url(self) -> str:
        direct = self.database_url.strip()
        if direct:
            return direct
        url_file = self.database_url_file.strip()
        if url_file:
            try:
                value = __import__("pathlib").Path(url_file).read_text(encoding="utf-8").strip()
            except OSError as error:
                raise ValueError(f"Unable to read MINEWORKS_DATABASE_URL_FILE: {url_file}") from error
            if not value:
                raise ValueError("MINEWORKS_DATABASE_URL_FILE is empty")
            return value
        return self.database_path

    @property
    def cors_origin_list(self) -> list[str]:
        return [item.strip().rstrip("/") for item in self.cors_origins.split(",") if item.strip()]

    @property
    def trusted_host_list(self) -> list[str]:
        return [item.strip() for item in self.trusted_hosts.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
