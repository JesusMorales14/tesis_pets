from sqlalchemy import Boolean, Column, DateTime, Float, Index, Integer, String, Text, text

from core.database import Base
from core.time_utils import utc_now
from domain.enums import AppointmentStatus, PaymentStatus


class Appointment(Base):
    __tablename__ = "appointments"
    __table_args__ = (
        # Dos citas activas no pueden ocupar el mismo horario: protege contra
        # dos usuarios reservando a la vez (la validación previa en el
        # servicio sola no basta ante peticiones concurrentes).
        Index(
            "uq_appointments_active_slot",
            "fecha",
            "hora",
            unique=True,
            sqlite_where=text("estado != 'cancelada'"),
        ),
        {"sqlite_autoincrement": True},
    )
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    user_nombre = Column(String)
    user_email = Column(String)
    fecha = Column(String, nullable=False)  # "2024-06-12"
    hora = Column(String, nullable=False)  # "10:15"
    diagnostico = Column(String)
    especie = Column(String)
    gravedad = Column(String)
    estado = Column(String, default=AppointmentStatus.PENDIENTE.value)  # ver AppointmentStatus
    metodo_pago = Column(String)  # "yape" | "transferencia"
    comprobante_path = Column(String, nullable=True)
    pago_estado = Column(String, default=PaymentStatus.PENDIENTE.value)  # ver PaymentStatus
    # Probabilidad de la predicción (0.0 - 1.0)
    probabilidad = Column(Float, nullable=True)
    # Mascota asociada (para historial clínico por mascota)
    pet_id = Column(Integer, nullable=True)
    # Nombre de la mascota al reservar: el veterinario lo sigue viendo aunque
    # el dueño elimine después la mascota (pet_id pasa a NULL en ese caso).
    pet_nombre = Column(String, nullable=True)
    # Síntomas del diagnóstico asociado (para guardar en historial al aprobar pago)
    sintomas_json = Column(Text, nullable=True)
    # Evita reenviar el recordatorio push de la misma cita más de una vez.
    recordatorio_enviado = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)
