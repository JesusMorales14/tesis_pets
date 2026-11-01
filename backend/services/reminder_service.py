"""Recordatorio de citas: revisa periódicamente (cada 30 minutos) las citas
confirmadas y envía un push al dueño cuando faltan 24 horas o menos para
la cita — en la práctica, entre 24 h y 23 h 30 min antes. Una sola vez por
cita: recordatorio_enviado evita reenvíos aunque el job corra varias veces.

Solo se recuerdan citas 'confirmada' — una cita todavía 'pendiente' (pago
sin revisar) no debería generar una expectativa de que va a suceder.
"""
from datetime import date, datetime, timedelta
from typing import Optional

from sqlalchemy.orm import Session

from models import Appointment, Vaccination, Pet
import notifications
from push_utils import send_push_to_user

REMINDER_WINDOW = timedelta(hours=24)


def send_reminders_for_db(db: Session, now: Optional[datetime] = None) -> int:
    """Lógica pura sobre una sesión dada — separada de dónde viene esa
    sesión (y de la hora actual) para poder probarla en memoria."""
    now = now or datetime.now()
    # Solo pueden caer en la ventana de 24 h las citas de hoy o de mañana.
    candidates = db.query(Appointment).filter(
        Appointment.fecha.in_([now.date().isoformat(), (now.date() + timedelta(days=1)).isoformat()]),
        Appointment.estado == "confirmada",
        Appointment.recordatorio_enviado.is_(False),
    ).all()

    sent = 0
    for appt in candidates:
        starts_at = datetime.fromisoformat(f"{appt.fecha}T{appt.hora}")
        if not (now < starts_at <= now + REMINDER_WINDOW):
            continue
        cuando = "hoy" if starts_at.date() == now.date() else "mañana"
        send_push_to_user(db, appt.user_id, notifications.recordatorio_cita(appt, cuando))
        appt.recordatorio_enviado = True
        sent += 1
    db.commit()
    return sent


def send_appointment_reminders() -> int:
    """Punto de entrada real usado por el scheduler — abre su propia
    sesión contra la base de datos de producción."""
    from database import SessionLocal

    db = SessionLocal()
    try:
        return send_reminders_for_db(db)
    finally:
        db.close()


def _vaccine_reference_date(v: Vaccination) -> str | None:
    """Misma regla que el semáforo del perfil: una vacuna programada se
    recuerda por su fecha programada; una aplicada, por su próximo refuerzo."""
    return v.fecha_programada if v.estado == "programada" else v.fecha_proxima


def send_vaccine_reminders_for_db(db: Session) -> int:
    """Revisa vacunas próximas (≤30 días) y vencidas y envía un push al
    dueño, una sola vez por cada tipo de aviso."""
    today = date.today()
    count = 0

    pending = (
        db.query(Vaccination, Pet)
        .join(Pet, Pet.id == Vaccination.pet_id)
        .filter(
            (Vaccination.notificacion_enviada == 0)
            | (Vaccination.notificacion_urgente_enviada == 0)
        )
        .all()
    )

    for v, pet in pending:
        ref = _vaccine_reference_date(v)
        if not ref:
            continue
        dias = (date.fromisoformat(ref) - today).days
        if dias <= 0 and not v.notificacion_urgente_enviada:
            send_push_to_user(db, pet.owner_id, notifications.vacuna_pendiente(v, pet))
            # Una vencida ya no necesita también el aviso preventivo.
            v.notificacion_urgente_enviada = 1
            v.notificacion_enviada = 1
            count += 1
        elif 0 < dias <= 30 and not v.notificacion_enviada:
            send_push_to_user(db, pet.owner_id, notifications.vacuna_proxima(v, pet, dias))
            v.notificacion_enviada = 1
            count += 1

    db.commit()
    return count


def send_vaccine_reminders() -> int:
    """Punto de entrada real usado por el scheduler."""
    from database import SessionLocal

    db = SessionLocal()
    try:
        return send_vaccine_reminders_for_db(db)
    finally:
        db.close()
