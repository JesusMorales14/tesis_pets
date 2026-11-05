from sqlalchemy import Column, DateTime, Float, Integer, String

from core.database import Base
from core.time_utils import utc_now


class DiagnosisRecord(Base):
    """Historial de predicciones guardadas contra una mascota registrada.

    Solo se crea una fila aquí cuando /predict recibe un pet_id válido — un
    diagnóstico "rápido" sin mascota seleccionada no queda guardado, para no
    forzar cuenta/registro a quien solo quiere una consulta puntual.
    """

    __tablename__ = "diagnosis_records"
    __table_args__ = {"sqlite_autoincrement": True}
    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, nullable=False, index=True)
    diagnostico = Column(String, nullable=False)
    probabilidad = Column(Float, nullable=False)
    diagnostico_alternativo = Column(String, nullable=True)
    probabilidad_alternativa = Column(Float, nullable=True)
    gravedad = Column(String, nullable=False)
    sintomas_json = Column(String, nullable=False)
    created_at = Column(DateTime, default=utc_now)
