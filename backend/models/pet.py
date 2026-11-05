from sqlalchemy import Column, DateTime, Float, Integer, String

from core.database import Base
from core.time_utils import utc_now


class Pet(Base):
    __tablename__ = "pets"
    # Sin AUTOINCREMENT, SQLite reutiliza el id de la última mascota borrada.
    __table_args__ = {"sqlite_autoincrement": True}
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, nullable=False, index=True)
    nombre = Column(String, nullable=False)
    especie = Column(String, nullable=False)  # "perro" | "gato"
    raza = Column(String, nullable=True)
    edad_meses = Column(Integer, nullable=True)
    peso_kg = Column(Float, nullable=True)
    created_at = Column(DateTime, default=utc_now)
