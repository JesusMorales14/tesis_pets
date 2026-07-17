from datetime import date, datetime
from typing import Optional

from fastapi import Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from config import COMPROBANTES_DIR
from database import get_db
from models import Appointment, UnavailableSlot, User
from push_utils import send_push_to_admins, send_push_to_user
from repositories.appointment_repository import AppointmentRepository, get_appointment_repository
from schemas.appointment import AppointmentBody, BlockSlotBody, UpdateEstadoBody
from schemas.payment import PagoDecisionBody
from services.upload_service import save_uploaded_image


def generate_all_slots() -> list[str]:
    """Genera horarios de 9:00 a 21:30 cada 30 minutos."""
    slots = []
    for hour in range(9, 22):
        slots.append(f"{hour:02d}:00")
        slots.append(f"{hour:02d}:30")
    return slots  # 9:00 … 21:30 (26 slots, último es 21:30)


def appointment_out(a: Appointment) -> dict:
    return {
        "id": a.id, "fecha": a.fecha, "hora": a.hora,
        "diagnostico": a.diagnostico, "especie": a.especie,
        "gravedad": a.gravedad, "estado": a.estado, "metodo_pago": a.metodo_pago,
        "pago_estado": a.pago_estado,
        "comprobante_url": f"/uploads/{a.comprobante_path}" if a.comprobante_path else None,
    }


def admin_appointment_out(a: Appointment) -> dict:
    return {**appointment_out(a), "user_nombre": a.user_nombre, "user_email": a.user_email}


class AppointmentService:
    def __init__(self, appointments: AppointmentRepository, db: Session):
        self.appointments = appointments
        self.db = db

    # ── Slots públicos ──────────────────────────────────────────────────────

    def get_slots(self, fecha: str) -> list[dict]:
        all_slots = generate_all_slots()
        booked = self.appointments.booked_horas(fecha)
        blocked = self.appointments.blocked_horas(fecha)

        today = date.today().isoformat()
        now_time = datetime.now().strftime("%H:%M")

        result = []
        for slot in all_slots:
            if fecha == today and slot <= now_time:
                continue  # pasado
            tipo = "ocupado" if slot in booked else ("bloqueado" if slot in blocked else "libre")
            result.append({"hora": slot, "disponible": tipo == "libre", "tipo": tipo})
        return result

    # ── Citas del usuario ────────────────────────────────────────────────────

    def create_appointment(self, body: AppointmentBody, current_user: User) -> dict:
        if self.appointments.is_slot_occupied(body.fecha, body.hora):
            raise HTTPException(status_code=409, detail="El horario ya fue reservado por otro usuario")
        if self.appointments.is_slot_blocked(body.fecha, body.hora):
            raise HTTPException(status_code=409, detail="El horario está bloqueado por el veterinario")

        appt = Appointment(
            user_id=current_user.id,
            user_nombre=current_user.nombre,
            user_email=current_user.email,
            fecha=body.fecha,
            hora=body.hora,
            diagnostico=body.diagnostico,
            especie=body.especie,
            gravedad=body.gravedad,
            estado="pendiente",
            metodo_pago=body.metodo_pago,
            pago_estado="pendiente",
        )
        appt = self.appointments.create(appt)
        # La cita queda reservada de inmediato — el comprobante se sube después
        # en un segundo paso, sin bloquear ni arriesgar perder el horario.
        return appointment_out(appt)

    def my_appointments(self, current_user: User) -> list[dict]:
        return [appointment_out(a) for a in self.appointments.list_by_user(current_user.id)]

    async def upload_comprobante(self, appt_id: int, file: UploadFile, current_user: User) -> dict:
        appt = self.appointments.get_by_id(appt_id)
        if not appt:
            raise HTTPException(status_code=404, detail="Cita no encontrada")
        if appt.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Esta cita no te pertenece")

        appt.comprobante_path = await save_uploaded_image(file, COMPROBANTES_DIR)
        appt.pago_estado = "pendiente"
        self.appointments.commit()

        send_push_to_admins(self.db, {
            "title": "Nuevo comprobante de pago",
            "body": f"{current_user.nombre} envió un comprobante para su cita del {appt.fecha} {appt.hora}.",
            "url": "/admin",
        })
        return appointment_out(appt)

    # ── Administración ───────────────────────────────────────────────────────

    def admin_get_slots(self, fecha: str) -> list[dict]:
        all_slots = generate_all_slots()
        booked_map = self.appointments.booked_info_by_hora(fecha)
        blocked_ids = self.appointments.blocked_ids_by_hora(fecha)
        result = []
        for slot in all_slots:
            tipo = "ocupado" if slot in booked_map else ("bloqueado" if slot in blocked_ids else "libre")
            result.append({
                "hora": slot,
                "tipo": tipo,
                "disponible": tipo == "libre",
                "block_id": blocked_ids.get(slot),
                "cita_info": booked_map.get(slot),
            })
        return result

    def block_slot(self, body: BlockSlotBody) -> dict:
        if self.appointments.get_blocked_slot(body.fecha, body.hora):
            raise HTTPException(status_code=400, detail="El horario ya está bloqueado")
        self.appointments.add_blocked_slot(UnavailableSlot(fecha=body.fecha, hora=body.hora))
        return {"ok": True}

    def unblock_slot(self, fecha: str, hora: str) -> dict:
        slot = self.appointments.get_blocked_slot(fecha, hora)
        if not slot:
            raise HTTPException(status_code=404, detail="Bloqueo no encontrado")
        self.appointments.delete_blocked_slot(slot)
        return {"ok": True}

    def admin_all_appointments(self, fecha: Optional[str] = None) -> list[dict]:
        return [admin_appointment_out(a) for a in self.appointments.list_all(fecha)]

    def admin_pending_payments(self) -> list[dict]:
        return [admin_appointment_out(a) for a in self.appointments.list_pending_payments()]

    def decide_payment(self, appt_id: int, body: PagoDecisionBody) -> dict:
        appt = self.appointments.get_by_id(appt_id)
        if not appt:
            raise HTTPException(status_code=404, detail="Cita no encontrada")
        if not appt.comprobante_path:
            raise HTTPException(status_code=400, detail="Esta cita todavía no tiene un comprobante subido")

        appt.pago_estado = "aprobado" if body.aprobado else "rechazado"
        if body.aprobado:
            appt.estado = "confirmada"
        self.appointments.commit()

        send_push_to_user(self.db, appt.user_id, {
            "title": "Pago aprobado" if body.aprobado else "Pago rechazado",
            "body": (
                f"Tu pago para la cita del {appt.fecha} {appt.hora} fue aprobado. ¡Nos vemos pronto!"
                if body.aprobado else
                f"No pudimos validar tu comprobante para la cita del {appt.fecha} {appt.hora}. Revisa e intenta de nuevo."
            ),
            "url": "/profile",
        })
        return admin_appointment_out(appt)

    def update_appointment_estado(self, appt_id: int, body: UpdateEstadoBody) -> dict:
        appt = self.appointments.get_by_id(appt_id)
        if not appt:
            raise HTTPException(status_code=404, detail="Cita no encontrada")
        if body.estado not in ("pendiente", "confirmada", "cancelada"):
            raise HTTPException(status_code=400, detail="Estado inválido")
        appt.estado = body.estado
        self.appointments.commit()
        return {"ok": True, "estado": appt.estado}


def get_appointment_service(
    appointments: AppointmentRepository = Depends(get_appointment_repository),
    db: Session = Depends(get_db),
) -> AppointmentService:
    return AppointmentService(appointments, db)
