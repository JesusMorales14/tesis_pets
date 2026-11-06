"""Fechas en UTC.

La base guarda las marcas de tiempo en UTC *sin* zona (naive). Estas
funciones reemplazan a `datetime.utcnow()`, obsoleta desde Python 3.12.
"""

from datetime import UTC, datetime


def utc_now() -> datetime:
    """Hora actual en UTC, sin zona (mismo formato que se guarda en la base)."""
    return datetime.now(UTC).replace(tzinfo=None)


def utc_isoformat(dt: datetime | None) -> str | None:
    """Las fechas se guardan en UTC sin zona. Al enviarlas se marca
    explícitamente como UTC: sin eso el navegador las interpreta como hora
    local y, en Perú (UTC-5), después de las 19:00 muestra el día siguiente."""
    if dt is None:
        return None
    return dt.replace(tzinfo=UTC).isoformat()
