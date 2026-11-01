from datetime import datetime, timezone


def utc_isoformat(dt: datetime | None) -> str | None:
    """Las fechas se guardan en UTC sin zona (datetime.utcnow). Al enviarlas
    se marca explícitamente como UTC: sin eso el navegador las interpreta
    como hora local y, en Perú (UTC-5), después de las 19:00 muestra el
    día siguiente."""
    if dt is None:
        return None
    return dt.replace(tzinfo=timezone.utc).isoformat()
