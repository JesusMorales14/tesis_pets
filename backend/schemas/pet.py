from typing import Optional
from pydantic import BaseModel, Field, field_validator


class PetBody(BaseModel):
    nombre: str
    especie: str
    raza: Optional[str] = None
    edad_meses: Optional[int] = Field(None, ge=0, le=360)
    peso_kg: Optional[float] = Field(None, gt=0, le=150)

    @field_validator("especie")
    def especie_valida(cls, v):
        if v.lower() not in ["perro", "gato"]:
            raise ValueError("La especie debe ser 'perro' o 'gato'")
        return v.lower()

    @field_validator("nombre")
    def nombre_no_vacio(cls, v):
        if not v.strip():
            raise ValueError("El nombre de la mascota no puede estar vacío")
        return v.strip()
