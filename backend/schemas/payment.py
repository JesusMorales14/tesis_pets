from typing import Optional
from pydantic import BaseModel


class PaymentConfigBody(BaseModel):
    yape_phone: Optional[str] = None
    banco: Optional[str] = None
    tipo_cuenta: Optional[str] = None
    numero_cuenta: Optional[str] = None
    cci: Optional[str] = None
    titular: Optional[str] = None


class PagoDecisionBody(BaseModel):
    aprobado: bool
