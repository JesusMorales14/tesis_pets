from pydantic import BaseModel, field_validator
from typing import Optional


class AppointmentBody(BaseModel):
    fecha: str
    hora: str
    diagnostico: str
    especie: str
    gravedad: str
    metodo_pago: str
    # Probabilidad de la predicción (0.0 - 1.0)
    probabilidad: Optional[float] = None
    # Mascota asociada (ID de mascota registrada del usuario)
    pet_id: Optional[int] = None
    # Síntomas del diagnóstico (para guardar en historial al aprobar pago)
    sintomas_json: Optional[str] = None

    @field_validator("metodo_pago")
    def metodo_pago_valido(cls, v):
        if v not in ("yape", "transferencia"):
            raise ValueError("metodo_pago debe ser 'yape' o 'transferencia'")
        return v

    @field_validator("probabilidad")
    def probabilidad_valida(cls, v):
        if v is not None and (v < 0.0 or v > 1.0):
            raise ValueError("probabilidad debe estar entre 0.0 y 1.0")
        return v


class BlockSlotBody(BaseModel):
    fecha: str
    hora: str


class UpdateEstadoBody(BaseModel):
    estado: str
