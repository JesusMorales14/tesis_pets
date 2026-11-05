"""Contraseñas (bcrypt) y tokens de sesión (JWT)."""

import logging
import secrets
from datetime import timedelta

from jose import JWTError, jwt
from passlib.context import CryptContext

from core.config import settings
from core.time_utils import utc_now

logger = logging.getLogger(__name__)

SECRET_KEY = settings.secret_key
ALGORITHM = settings.jwt_algorithm
EXPIRE_DAYS = settings.token_expire_days

# Código que convierte un registro en cuenta de veterinario. Sin .env se
# genera uno por proceso y se muestra una vez en el log (solo desarrollo).
ADMIN_CODE = settings.admin_code_from_env or secrets.token_hex(8)
if not settings.admin_code_from_env:
    logger.warning("ADMIN_CODE no definido en el entorno — usando uno generado para esta sesión: %s", ADMIN_CODE)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def create_token(user_id: int, role: str) -> str:
    expire = utc_now() + timedelta(days=EXPIRE_DAYS)
    return jwt.encode({"user_id": user_id, "role": role, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
