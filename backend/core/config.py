"""Configuración centralizada de la aplicación.

Todas las variables de entorno se leen aquí, una sola vez, y el resto del
código recibe valores ya tipados a través de `settings`. Antes cada módulo
llamaba a `os.getenv` por su cuenta (seguridad, CORS, push…) y la
variable DATABASE_URL del .env.example ni siquiera se usaba.

Ver backend/.env.example para la lista de variables.
"""

from __future__ import annotations

import os
import secrets
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# ── Archivos subidos ─────────────────────────────────────────────────────────
UPLOADS_DIR = str(BASE_DIR / "uploads")
QR_DIR = os.path.join(UPLOADS_DIR, "payment-config")
COMPROBANTES_DIR = os.path.join(UPLOADS_DIR, "comprobantes")

ALLOWED_IMAGE_TYPES = frozenset({"image/png", "image/jpeg", "image/webp"})
MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB


def _csv(value: str | None) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()] if value else []


@dataclass(frozen=True)
class Settings:
    """Valores de configuración inmutables, leídos del entorno."""

    environment: str = field(default_factory=lambda: os.getenv("ENVIRONMENT", "development"))
    database_url: str = field(
        default_factory=lambda: os.getenv("DATABASE_URL") or f"sqlite:///{BASE_DIR / 'veterinary.db'}"
    )

    # Seguridad. SECRET_KEY y ADMIN_CODE NUNCA tienen un valor fijo en el
    # código (el repositorio es público): sin .env se genera uno aleatorio
    # por proceso, válido solo para desarrollo, tests y CI.
    secret_key: str = field(default_factory=lambda: os.getenv("SECRET_KEY") or secrets.token_hex(32))
    jwt_algorithm: str = field(default_factory=lambda: os.getenv("ALGORITHM", "HS256"))
    token_expire_days: int = field(default_factory=lambda: int(os.getenv("TOKEN_EXPIRE_DAYS", "7")))
    admin_code_from_env: str | None = field(default_factory=lambda: os.getenv("ADMIN_CODE"))

    # CORS: sin CORS_ORIGINS se permite cualquier origen (solo desarrollo).
    cors_origins: list[str] = field(default_factory=lambda: _csv(os.getenv("CORS_ORIGINS")) or ["*"])

    # Notificaciones push (Web Push / VAPID).
    vapid_private_key_pem: str | None = field(default_factory=lambda: os.getenv("VAPID_PRIVATE_KEY_PEM"))
    vapid_public_key: str | None = field(default_factory=lambda: os.getenv("VAPID_PUBLIC_KEY"))
    vapid_claims_email: str = field(
        default_factory=lambda: os.getenv("VAPID_CLAIMS_EMAIL", "mailto:contacto@cityvet.pe")
    )

    # Recordatorios automáticos.
    appointment_reminder_minutes: int = 30
    vaccine_reminder_hours: int = 6

    log_level: str = field(default_factory=lambda: os.getenv("LOG_LEVEL", "INFO"))

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

os.makedirs(QR_DIR, exist_ok=True)
os.makedirs(COMPROBANTES_DIR, exist_ok=True)
