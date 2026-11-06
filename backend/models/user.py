from sqlalchemy import Column, DateTime, Integer, String

from core.database import Base
from core.time_utils import utc_now
from domain.enums import Role


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default=Role.USER.value)  # ver Role
    created_at = Column(DateTime, default=utc_now)
    # Registro de consentimiento de la política de privacidad — evidencia de
    # que el usuario aceptó explícitamente antes de crear la cuenta, no solo
    # una casilla de UI que no deja rastro.
    accepted_privacy_at = Column(DateTime, nullable=True)
