from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from database import Base


class Vaccination(Base):
    """Registro manual de vacunas aplicadas a una mascota. fecha_proxima se
    calcula en el backend a partir de fecha_aplicacion + el intervalo de
    refuerzo del esquema (ver vaccine_schedule.py) cuando el cliente lo
    indica; si no, queda sin fecha estimada.
    """
    __tablename__ = "vaccinations"
    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, nullable=False, index=True)
    nombre = Column(String, nullable=False)
    fecha_aplicacion = Column(String, nullable=False)  # "YYYY-MM-DD"
    fecha_proxima = Column(String, nullable=True)       # "YYYY-MM-DD"
    notas = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
