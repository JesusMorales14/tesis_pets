"""Errores de la aplicación, independientes del framework web.

Los servicios (capa de aplicación) lanzan estas excepciones en lugar de
`fastapi.HTTPException`: así la lógica de negocio no depende de HTTP y se
puede probar o reutilizar (p. ej. desde el scheduler) sin FastAPI. Un único
manejador las traduce a respuestas JSON con el mismo formato que usa
FastAPI (`{"detail": "..."}`), por lo que el frontend no cambia.
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class AppError(Exception):
    """Error de negocio con un mensaje apto para mostrar al usuario."""

    status_code = 400

    def __init__(self, detail: str):
        super().__init__(detail)
        self.detail = detail


class BadRequestError(AppError):
    """Datos inválidos o una operación que no aplica al estado actual."""

    status_code = 400


class UnauthorizedError(AppError):
    """Falta la sesión o el token no es válido."""

    status_code = 401


class ForbiddenError(AppError):
    """El usuario no tiene permiso sobre el recurso."""

    status_code = 403


class NotFoundError(AppError):
    status_code = 404


class ConflictError(AppError):
    """El recurso cambió entre la validación y la escritura (p. ej. horario tomado)."""

    status_code = 409


class UnexpectedError(AppError):
    """Fallo interno. El detalle real va al log, nunca a la respuesta."""

    status_code = 500


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def _handle_app_error(_: Request, exc: AppError) -> JSONResponse:
        headers = {"WWW-Authenticate": "Bearer"} if exc.status_code == 401 else None
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail}, headers=headers)
