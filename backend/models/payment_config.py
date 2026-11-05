from sqlalchemy import Column, DateTime, Integer, String

from core.database import Base
from core.time_utils import utc_now


class PaymentConfig(Base):
    """Fila única (id=1) con los datos de pago que el administrador puede
    editar desde el panel — QR/número de Yape y cuenta interbancaria para
    transferencias. Los usuarios la leen (endpoint público) al momento de
    pagar una cita."""

    __tablename__ = "payment_config"
    id = Column(Integer, primary_key=True, index=True)
    yape_phone = Column(String, nullable=True)
    yape_qr_path = Column(String, nullable=True)
    banco = Column(String, nullable=True)
    tipo_cuenta = Column(String, nullable=True)
    numero_cuenta = Column(String, nullable=True)
    cci = Column(String, nullable=True)
    titular = Column(String, nullable=True)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
