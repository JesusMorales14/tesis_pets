from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="user")  # "user" | "admin"
    created_at = Column(DateTime, default=datetime.utcnow)


class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    user_nombre = Column(String)
    user_email = Column(String)
    fecha = Column(String, nullable=False)   # "2024-06-12"
    hora = Column(String, nullable=False)    # "10:15"
    diagnostico = Column(String)
    especie = Column(String)
    gravedad = Column(String)
    estado = Column(String, default="pendiente")  # pendiente | confirmada | cancelada
    metodo_pago = Column(String)             # "yape" | "tarjeta"
    created_at = Column(DateTime, default=datetime.utcnow)


class UnavailableSlot(Base):
    __tablename__ = "unavailable_slots"
    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(String, nullable=False)
    hora = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
