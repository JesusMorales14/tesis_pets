from typing import Optional

from fastapi import Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Appointment, UnavailableSlot


class AppointmentRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, appt_id: int) -> Optional[Appointment]:
        return self.db.query(Appointment).filter(Appointment.id == appt_id).first()

    def list_by_user(self, user_id: int) -> list[Appointment]:
        return (
            self.db.query(Appointment)
            .filter(Appointment.user_id == user_id)
            .order_by(Appointment.fecha, Appointment.hora)
            .all()
        )

    def list_all(self, fecha: Optional[str] = None) -> list[Appointment]:
        q = self.db.query(Appointment)
        if fecha:
            q = q.filter(Appointment.fecha == fecha)
        return q.order_by(Appointment.fecha, Appointment.hora).all()

    def list_pending_payments(self) -> list[Appointment]:
        return (
            self.db.query(Appointment)
            .filter(Appointment.pago_estado == "pendiente", Appointment.comprobante_path.isnot(None))
            .order_by(Appointment.fecha, Appointment.hora)
            .all()
        )

    def is_slot_occupied(self, fecha: str, hora: str) -> bool:
        return self.db.query(Appointment).filter(
            Appointment.fecha == fecha,
            Appointment.hora == hora,
            Appointment.estado != "cancelada",
        ).first() is not None

    def booked_horas(self, fecha: str) -> set[str]:
        return {
            a.hora for a in self.db.query(Appointment).filter(
                Appointment.fecha == fecha, Appointment.estado != "cancelada",
            ).all()
        }

    def booked_info_by_hora(self, fecha: str) -> dict[str, dict]:
        return {
            a.hora: {"user_nombre": a.user_nombre, "diagnostico": a.diagnostico}
            for a in self.db.query(Appointment).filter(
                Appointment.fecha == fecha, Appointment.estado != "cancelada",
            ).all()
        }

    def create(self, appt: Appointment) -> Appointment:
        self.db.add(appt)
        self.db.commit()
        self.db.refresh(appt)
        return appt

    def commit(self) -> None:
        self.db.commit()

    # ── Slots bloqueados por el administrador ──────────────────────────────

    def blocked_horas(self, fecha: str) -> set[str]:
        return {s.hora for s in self.db.query(UnavailableSlot).filter(UnavailableSlot.fecha == fecha).all()}

    def blocked_ids_by_hora(self, fecha: str) -> dict[str, int]:
        return {
            s.hora: s.id
            for s in self.db.query(UnavailableSlot).filter(UnavailableSlot.fecha == fecha).all()
        }

    def is_slot_blocked(self, fecha: str, hora: str) -> bool:
        return self.db.query(UnavailableSlot).filter(
            UnavailableSlot.fecha == fecha, UnavailableSlot.hora == hora,
        ).first() is not None

    def get_blocked_slot(self, fecha: str, hora: str) -> Optional[UnavailableSlot]:
        return self.db.query(UnavailableSlot).filter(
            UnavailableSlot.fecha == fecha, UnavailableSlot.hora == hora,
        ).first()

    def add_blocked_slot(self, slot: UnavailableSlot) -> None:
        self.db.add(slot)
        self.db.commit()

    def delete_blocked_slot(self, slot: UnavailableSlot) -> None:
        self.db.delete(slot)
        self.db.commit()


def get_appointment_repository(db: Session = Depends(get_db)) -> AppointmentRepository:
    return AppointmentRepository(db)
