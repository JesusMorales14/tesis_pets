"""Recordatorio de citas: revisa periódicamente las citas confirmadas para
el día siguiente y envía un push al dueño, una sola vez por cita
(recordatorio_enviado evita reenvíos aunque el job corra varias veces
antes de que llegue el día de la cita).

Solo se recuerdan citas 'confirmada' — una cita todavía 'pendiente' (pago
sin revisar) no debería generar una expectativa de que va a suceder.
"""
from datetime import date, timedelta

from sqlalchemy.orm import Session

from models import Appointment
from push_utils import send_push_to_user


def send_reminders_for_db(db: Session) -> int:
    """Lógica pura sobre una sesión dada — separada de dónde viene esa
    sesión para poder probarla contra una base de datos en memoria."""
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    appts = db.query(Appointment).filter(
        Appointment.fecha == tomorrow,
        Appointment.estado == "confirmada",
        Appointment.recordatorio_enviado.is_(False),
    ).all()
    for appt in appts:
        send_push_to_user(db, appt.user_id, {
            "title": "Recordatorio de cita",
            "body": f"Tu cita en CityVet es mañana {appt.fecha} a las {appt.hora}.",
            "url": "/profile",
        })
        appt.recordatorio_enviado = True
    db.commit()
    return len(appts)


def send_appointment_reminders() -> int:
    """Punto de entrada real usado por el scheduler — abre su propia
    sesión contra la base de datos de producción."""
    from database import SessionLocal

    db = SessionLocal()
    try:
        return send_reminders_for_db(db)
    finally:
        db.close()
