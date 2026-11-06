"""Contenido de las notificaciones push, en un solo lugar para que todas
tengan el mismo estilo.

Cada notificación es un dict que el service worker (frontend/src/sw.js)
convierte en la notificación del sistema:
- title / body: texto visible. Título corto y concreto; el cuerpo dice
  qué pasó y qué hacer, con la fecha escrita en lenguaje natural.
- url: pantalla que se abre al tocar la notificación.
- type: categoría ("cita", "pago", "vacuna", "admin"), define el botón de
  acción que muestra la notificación.
- tag: agrupa avisos del mismo asunto: uno nuevo reemplaza al anterior en
  vez de acumularse (p. ej. "pago en revisión" → "pago aprobado").
- urgent: la notificación queda visible hasta que el usuario la atienda.
"""

from datetime import date

_DIAS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
_MESES = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
]


def fecha_legible(iso: str) -> str:
    """'2026-10-27' → 'lunes 27 de octubre'."""
    d = date.fromisoformat(iso)
    return f"{_DIAS[d.weekday()]} {d.day} de {_MESES[d.month - 1]}"


def _paciente(appt) -> str:
    """'Firulais' o, si la cita no tiene mascota registrada, 'tu mascota'."""
    return appt.pet_nombre or "tu mascota"


def _notif(type_: str, title: str, body: str, url: str, tag: str, urgent: bool = False) -> dict:
    return {"type": type_, "title": title, "body": body, "url": url, "tag": tag, "urgent": urgent}


# ── Para el dueño de la mascota ────────────────────────────────────────────


def pago_aprobado(appt) -> dict:
    return _notif(
        "cita",
        "Pago aprobado · Cita confirmada",
        f"Te esperamos el {fecha_legible(appt.fecha)} a las {appt.hora} con {_paciente(appt)} en CityVet.",
        "/profile",
        f"cita-{appt.id}",
    )


def pago_rechazado(appt) -> dict:
    return _notif(
        "pago",
        "No pudimos validar tu pago",
        f"Tu cita del {fecha_legible(appt.fecha)} a las {appt.hora} fue cancelada y el horario se liberó. "
        "Puedes agendar una nueva cita.",
        "/profile",
        f"cita-{appt.id}",
        urgent=True,
    )


def cita_confirmada(appt) -> dict:
    return _notif(
        "cita",
        "Cita confirmada",
        f"CityVet confirmó tu cita del {fecha_legible(appt.fecha)} a las {appt.hora} con {_paciente(appt)}.",
        "/profile",
        f"cita-{appt.id}",
    )


def cita_cancelada(appt) -> dict:
    return _notif(
        "cita",
        "Cita cancelada",
        f"CityVet canceló tu cita del {fecha_legible(appt.fecha)} a las {appt.hora}. "
        "Puedes agendar una nueva desde la app.",
        "/profile",
        f"cita-{appt.id}",
        urgent=True,
    )


def recordatorio_cita(appt, cuando: str) -> dict:
    """cuando: 'hoy' o 'mañana'."""
    return _notif(
        "cita",
        f"Tu cita es {cuando} a las {appt.hora}",
        f"{_paciente(appt).capitalize()} tiene consulta en CityVet el {fecha_legible(appt.fecha)}. "
        "Jr. Los Ángeles 270, Chincha Alta.",
        "/profile",
        f"cita-{appt.id}",
    )


def vacuna_proxima(v, pet, dias: int) -> dict:
    cuando = "mañana" if dias == 1 else f"en {dias} días"
    if v.estado == "programada":
        body = f"{pet.nombre} tiene programada la vacuna {cuando}, el {fecha_legible(v.fecha_programada)}."
    else:
        body = (
            f"El refuerzo de {pet.nombre} vence {cuando}, el {fecha_legible(v.fecha_proxima)}. "
            "Agenda su cita en CityVet."
        )
    return _notif("vacuna", f"Vacuna próxima: {v.nombre}", body, "/profile", f"vacuna-{v.id}")


def vacuna_pendiente(v, pet) -> dict:
    if v.estado == "programada":
        body = (
            f"{pet.nombre} tenía programada esta vacuna para el {fecha_legible(v.fecha_programada)} "
            "y aún no se registra como aplicada. Acude a CityVet."
        )
    else:
        body = f"El refuerzo de {pet.nombre} venció el {fecha_legible(v.fecha_proxima)}. Acude a CityVet."
    return _notif("vacuna", f"Vacuna pendiente: {v.nombre}", body, "/profile", f"vacuna-{v.id}", urgent=True)


def prueba() -> dict:
    return _notif(
        "cita",
        "Notificaciones activadas",
        "Así verás los avisos de CityVet: recordatorios de citas, pagos y vacunas de tus mascotas.",
        "/profile",
        "prueba",
    )


# ── Para el veterinario ────────────────────────────────────────────────────


def comprobante_nuevo(appt, cliente: str) -> dict:
    return _notif(
        "admin",
        "Nuevo comprobante por revisar",
        f"{cliente} · cita del {fecha_legible(appt.fecha)} a las {appt.hora} "
        f"({_paciente(appt) if appt.pet_nombre else 'sin mascota registrada'}, {appt.especie}).",
        "/admin",
        f"comprobante-{appt.id}",
    )
