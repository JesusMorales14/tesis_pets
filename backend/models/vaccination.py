from sqlalchemy import Column, DateTime, ForeignKey, Integer, String

from core.database import Base
from core.time_utils import utc_now


class Vaccination(Base):
    """Registro de vacunas (aplicadas o programadas) de una mascota.
    - estado='aplicada': fecha_aplicacion obligatoria, fecha_proxima = fecha_aplicacion + refuerzo_meses
    - estado='programada': fecha_programada obligatoria, fecha_proxima = fecha_programada + refuerzo_meses
    """

    __tablename__ = "vaccinations"
    __table_args__ = {"sqlite_autoincrement": True}
    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, ForeignKey("pets.id", ondelete="CASCADE"), nullable=False, index=True)
    nombre = Column(String, nullable=False)
    estado = Column(String, nullable=False, default="aplicada")  # 'aplicada' | 'programada'
    fecha_aplicacion = Column(String, nullable=True)  # "YYYY-MM-DD" (solo si aplicada)
    fecha_programada = Column(String, nullable=True)  # "YYYY-MM-DD" (solo si programada)
    fecha_proxima = Column(String, nullable=True)  # "YYYY-MM-DD" (calculada para notificaciones)
    refuerzo_meses = Column(Integer, nullable=False)  # meses hasta próximo refuerzo
    notas = Column(String, nullable=True)
    # Campos para notificaciones push de vacunación
    notificacion_enviada = Column(Integer, default=0)  # 0=no, 1=sí (recordatorio 30 días)
    notificacion_urgente_enviada = Column(Integer, default=0)  # 0=no, 1=sí (vencida)
    created_at = Column(DateTime, default=utc_now)
