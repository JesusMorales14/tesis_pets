from pydantic import BaseModel, field_validator


class AppointmentBody(BaseModel):
    fecha: str
    hora: str
    diagnostico: str
    especie: str
    gravedad: str
    metodo_pago: str

    @field_validator("metodo_pago")
    def metodo_pago_valido(cls, v):
        if v not in ("yape", "transferencia"):
            raise ValueError("metodo_pago debe ser 'yape' o 'transferencia'")
        return v


class BlockSlotBody(BaseModel):
    fecha: str
    hora: str


class UpdateEstadoBody(BaseModel):
    estado: str
