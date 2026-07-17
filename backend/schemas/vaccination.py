from typing import Optional
from datetime import date
from pydantic import BaseModel, Field, field_validator


class VaccinationBody(BaseModel):
    nombre: str
    fecha_aplicacion: str
    refuerzo_meses: Optional[int] = Field(None, ge=1, le=60)
    notas: Optional[str] = None

    @field_validator("nombre")
    def nombre_no_vacio(cls, v):
        if not v.strip():
            raise ValueError("El nombre de la vacuna no puede estar vacío")
        return v.strip()

    @field_validator("fecha_aplicacion")
    def fecha_valida(cls, v):
        try:
            date.fromisoformat(v)
        except ValueError:
            raise ValueError("fecha_aplicacion debe tener formato YYYY-MM-DD")
        return v
