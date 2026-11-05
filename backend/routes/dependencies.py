"""Dependencias de FastAPI compartidas por los routers (capa de presentación).

Resuelven el usuario a partir del token. Viven aquí y no en los servicios
porque dependen de detalles HTTP (headers); los servicios reciben el
`User` ya resuelto.
"""

from typing import Optional

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from core.database import get_db
from core.exceptions import ForbiddenError, UnauthorizedError
from core.security import decode_token
from domain.enums import Role
from models import User


def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
    """Usuario autenticado por el header `Authorization: Bearer <token>` (401 si no)."""
    if not authorization or not authorization.startswith("Bearer "):
        raise UnauthorizedError("No autenticado")
    payload = decode_token(authorization.split(" ")[1])
    if not payload:
        raise UnauthorizedError("Token inválido o expirado")
    user = db.query(User).filter(User.id == payload.get("user_id")).first()
    if not user:
        raise UnauthorizedError("Usuario no encontrado")
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Solo el veterinario (rol administrador)."""
    if current_user.role != Role.ADMIN:
        raise ForbiddenError("Acceso denegado: se requiere rol administrador")
    return current_user


def get_current_user_optional(
    authorization: Optional[str] = Header(None), db: Session = Depends(get_db)
) -> Optional[User]:
    """Igual que get_current_user pero sin lanzar 401: /predict debe seguir
    funcionando sin sesión iniciada (consulta rápida sin guardar historial)."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    payload = decode_token(authorization.split(" ")[1])
    if not payload:
        return None
    return db.query(User).filter(User.id == payload.get("user_id")).first()
