from __future__ import annotations

from urllib.parse import urlsplit

from fastapi import HTTPException, Request, status

from app.settings import Settings

SAFE_METHODS = {"GET", "HEAD", "OPTIONS", "TRACE"}


def validate_browser_origin(request: Request, settings: Settings) -> None:
    if request.method.upper() in SAFE_METHODS:
        return
    origin = request.headers.get("origin")
    referer = request.headers.get("referer")
    candidate = origin
    if not candidate and referer:
        parsed = urlsplit(referer)
        candidate = f"{parsed.scheme}://{parsed.netloc}" if parsed.scheme and parsed.netloc else None
    if not candidate:
        if settings.environment in {"development", "test"}:
            return
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail={"code":"ORIGIN_REQUIRED","message":"缺少浏览器来源信息。"})
    normalized = candidate.rstrip("/")
    if normalized not in settings.cors_origin_list and normalized != settings.public_origin.rstrip("/"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail={"code":"ORIGIN_NOT_ALLOWED","message":"请求来源不受信任。"})
