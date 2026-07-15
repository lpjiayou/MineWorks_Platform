from __future__ import annotations

import base64
import hashlib
import hmac
import os

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError

_PBKDF2_ALGORITHM = "pbkdf2_sha256"
_PBKDF2_ITERATIONS = 310_000
_ARGON2 = PasswordHasher(time_cost=3, memory_cost=65536, parallelism=4, hash_len=32, salt_len=16)


def validate_password_strength(password: str) -> list[str]:
    errors: list[str] = []
    if len(password) < 10:
        errors.append("密码至少需要10个字符。")
    if len(password) > 128:
        errors.append("密码不能超过128个字符。")
    if not any(char.islower() for char in password):
        errors.append("密码至少需要一个小写字母。")
    if not any(char.isupper() for char in password):
        errors.append("密码至少需要一个大写字母。")
    if not any(char.isdigit() for char in password):
        errors.append("密码至少需要一个数字。")
    return errors


def hash_password(password: str) -> str:
    return _ARGON2.hash(password)


def _verify_pbkdf2(password: str, encoded: str) -> bool:
    try:
        algorithm, iterations_text, salt_text, digest_text = encoded.split("$", 3)
        if algorithm != _PBKDF2_ALGORITHM:
            return False
        salt = base64.urlsafe_b64decode(salt_text.encode("ascii"))
        expected = base64.urlsafe_b64decode(digest_text.encode("ascii"))
        actual = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, int(iterations_text))
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


def verify_password(password: str, encoded: str) -> bool:
    if encoded.startswith("$argon2"):
        try:
            return _ARGON2.verify(encoded, password)
        except (VerifyMismatchError, VerificationError, InvalidHashError):
            return False
    return _verify_pbkdf2(password, encoded)


def password_needs_rehash(encoded: str) -> bool:
    if not encoded.startswith("$argon2"):
        return True
    try:
        return _ARGON2.check_needs_rehash(encoded)
    except InvalidHashError:
        return True
