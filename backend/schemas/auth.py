from pydantic import BaseModel, Field, field_validator


class RegisterBody(BaseModel):
    nombre: str
    email: str
    password: str = Field(..., min_length=6)
    admin_code: str = ""
    # Sin default: si se omite, Pydantic ya lo rechaza como campo faltante.
    # Con default=False, el validador de abajo NO se ejecuta cuando el
    # cliente no manda el campo (Pydantic v2 no valida valores por
    # default salvo validate_default=True) — así que un registro sin
    # este campo pasaría silenciosamente sin haber aceptado nada.
    accepted_privacy: bool

    @field_validator("accepted_privacy")
    def debe_aceptar_privacidad(cls, v):
        if not v:
            raise ValueError("Debes aceptar la Política de Privacidad para crear una cuenta")
        return v


class LoginBody(BaseModel):
    email: str
    password: str


class ChangePasswordBody(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)
