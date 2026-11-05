"""Configuración de logging (reemplaza los print() dispersos)."""

import logging

from core.config import settings

_FORMAT = "%(asctime)s %(levelname)s [%(name)s] %(message)s"


def configure_logging() -> None:
    logging.basicConfig(level=settings.log_level.upper(), format=_FORMAT)
