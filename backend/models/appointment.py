from sqlalchemy import Column, Integer, String, DateTime, Boolean
from datetime import datetime
from database import Base


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
    metodo_pago = Column(String)             # "yape" | "transferencia"
    comprobante_path = Column(String, nullable=True)
    pago_estado = Column(String, default="pendiente")  # pendiente | aprobado | rechazado
    # Evita reenviar el recordatorio push de la misma cita más de una vez.
    recordatorio_enviado = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
