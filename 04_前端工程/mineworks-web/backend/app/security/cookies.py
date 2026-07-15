from __future__ import annotations

from fastapi import Response

from app.settings import Settings


def set_auth_cookies(response: Response, settings: Settings, *, session_token: str, csrf_token: str, max_age: int) -> None:
    response.set_cookie(
        key=settings.session_cookie_name,
        value=session_token,
        max_age=max_age,
        expires=max_age,
        path="/",
        domain=settings.cookie_domain,
        secure=settings.cookie_secure,
        httponly=True,
        samesite=settings.cookie_samesite,
    )
    response.set_cookie(
        key=settings.csrf_cookie_name,
        value=csrf_token,
        max_age=max_age,
        expires=max_age,
        path="/",
        domain=settings.cookie_domain,
        secure=settings.cookie_secure,
        httponly=False,
        samesite=settings.cookie_samesite,
    )


def clear_auth_cookies(response: Response, settings: Settings) -> None:
    for name in (settings.session_cookie_name, settings.csrf_cookie_name):
        response.delete_cookie(
            key=name,
            path="/",
            domain=settings.cookie_domain,
            secure=settings.cookie_secure,
            httponly=name == settings.session_cookie_name,
            samesite=settings.cookie_samesite,
        )
