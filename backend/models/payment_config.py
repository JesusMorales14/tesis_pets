from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from database import Base


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
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
