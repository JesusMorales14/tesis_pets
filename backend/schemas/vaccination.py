from datetime import date
from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator, model_validator


class VaccinationBody(BaseModel):
    nombre: str
    estado: Literal["aplicada", "programada"] = "aplicada"
    fecha_aplicacion: Optional[str] = None  # Requerida si estado='aplicada'
    fecha_programada: Optional[str] = None  # Requerida si estado='programada'
    refuerzo_meses: int = Field(..., ge=1, le=60)  # Obligatorio (1-60 meses)
    notas: Optional[str] = None

    @field_validator("nombre")
    def nombre_no_vacio(cls, v):
        if not v.strip():
            raise ValueError("El nombre de la vacuna no puede estar vacío")
        return v.strip()

    @field_validator("fecha_aplicacion", "fecha_programada")
    @classmethod
    def fecha_valida(cls, v):
        if v is not None:
            try:
                date.fromisoformat(v)
            except ValueError:
                raise ValueError("La fecha debe tener formato YYYY-MM-DD") from None
        return v

    @model_validator(mode="after")
    def validar_fechas_segun_estado(self):
        hoy = date.today().isoformat()
        if self.estado == "aplicada":
            if not self.fecha_aplicacion:
                raise ValueError("fecha_aplicacion es obligatoria para vacuna 'aplicada'")
            if self.fecha_programada:
                raise ValueError("fecha_programada no debe enviarse para vacuna 'aplicada'")
            # Una vacuna aplicada no puede tener fecha futura.
            if self.fecha_aplicacion > hoy:
                raise ValueError("La fecha de aplicación no puede ser posterior a hoy")
        elif self.estado == "programada":
            if not self.fecha_programada:
                raise ValueError("fecha_programada es obligatoria para vacuna 'programada'")
            if self.fecha_aplicacion:
                raise ValueError("fecha_aplicacion no debe enviarse para vacuna 'programada'")
            # Programar es a futuro: una fecha ya pasada debe registrarse como aplicada.
            if self.fecha_programada < hoy:
                raise ValueError("La fecha programada no puede ser anterior a hoy")
        return self
