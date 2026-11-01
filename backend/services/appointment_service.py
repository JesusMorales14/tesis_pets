import json
import os
from datetime import date, datetime
from typing import Optional

from fastapi import Depends, HTTPException, UploadFile
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from config import COMPROBANTES_DIR, UPLOADS_DIR
from database import get_db
from models import Appointment, Pet, UnavailableSlot, User
import notifications
from push_utils import send_push_to_admins, send_push_to_user
from repositories.appointment_repository import AppointmentRepository, get_appointment_repository
from schemas.appointment import AppointmentBody, BlockSlotBody, UpdateEstadoBody
from schemas.payment import PagoDecisionBody
from services.pet_service import get_owned_pet
from services.upload_service import save_uploaded_image

SLOT_TAKEN_DETAIL = "El horario ya fue reservado por otro usuario"


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
        "probabilidad": a.probabilidad,
        "pet_id": a.pet_id,
        "pet_nombre": a.pet_nombre,
        "comprobante_url": f"/uploads/{a.comprobante_path}" if a.comprobante_path else None,
        "user_nombre": a.user_nombre,
        "user_email": a.user_email,
    }


def admin_appointment_out(a: Appointment) -> dict:
    return appointment_out(a)


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

    def _validate_new_appointment(self, body: AppointmentBody, current_user: User) -> Optional[Pet]:
        """Validaciones del servidor: el frontend solo ofrece horarios válidos,
        pero la API no debe confiar en eso. Devuelve la mascota de la cita."""
        try:
            fecha = date.fromisoformat(body.fecha)
        except ValueError:
            raise HTTPException(status_code=400, detail="La fecha debe tener formato YYYY-MM-DD")
        if body.hora not in generate_all_slots():
            raise HTTPException(status_code=400, detail="El horario no es válido")
        now = datetime.now()
        if fecha < now.date() or (fecha == now.date() and body.hora <= now.strftime("%H:%M")):
            raise HTTPException(status_code=400, detail="No se puede reservar un horario que ya pasó")

        if self.appointments.is_slot_occupied(body.fecha, body.hora):
            raise HTTPException(status_code=409, detail=SLOT_TAKEN_DETAIL)
        if self.appointments.is_slot_blocked(body.fecha, body.hora):
            raise HTTPException(status_code=409, detail="El horario está bloqueado por el veterinario")

        pet = None
        if body.pet_id is not None:
            pet = get_owned_pet(body.pet_id, self.db, current_user)
            if pet.especie != body.especie.lower():
                raise HTTPException(status_code=400, detail="La especie no coincide con la de la mascota")

        if body.sintomas_json is not None:
            try:
                if not isinstance(json.loads(body.sintomas_json), dict):
                    raise ValueError
            except ValueError:
                raise HTTPException(status_code=400, detail="sintomas_json debe ser un objeto JSON")
        return pet

    def _build_appointment(
        self, body: AppointmentBody, current_user: User, pet: Optional[Pet],
        comprobante_path: Optional[str] = None,
    ) -> Appointment:
        return Appointment(
            user_id=current_user.id,
            user_nombre=current_user.nombre,
            user_email=current_user.email,
            fecha=body.fecha,
            hora=body.hora,
            diagnostico=body.diagnostico,
            especie=body.especie.lower(),
            gravedad=body.gravedad,
            estado="pendiente",
            metodo_pago=body.metodo_pago,
            pago_estado="pendiente",
            comprobante_path=comprobante_path,
            sintomas_json=body.sintomas_json,
            probabilidad=body.probabilidad,
            pet_id=pet.id if pet else None,
            pet_nombre=pet.nombre if pet else None,
        )

    def _create_or_conflict(self, appt: Appointment) -> Appointment:
        """El índice único parcial de (fecha, hora) atrapa la carrera entre
        dos usuarios que pasaron la validación previa al mismo tiempo."""
        try:
            return self.appointments.create(appt)
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(status_code=409, detail=SLOT_TAKEN_DETAIL)

    def _commit_or_conflict(self) -> None:
        try:
            self.appointments.commit()
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(status_code=409, detail="Ese horario ya está ocupado por otra cita activa")

    def create_appointment(self, body: AppointmentBody, current_user: User) -> dict:
        pet = self._validate_new_appointment(body, current_user)
        appt = self._create_or_conflict(self._build_appointment(body, current_user, pet))
        return appointment_out(appt)

    async def create_appointment_with_comprobante(
        self, body: AppointmentBody, file: UploadFile, current_user: User
    ) -> dict:
        pet = self._validate_new_appointment(body, current_user)
        comprobante_path = await save_uploaded_image(file, COMPROBANTES_DIR)
        try:
            appt = self._create_or_conflict(
                self._build_appointment(body, current_user, pet, comprobante_path)
            )
        except HTTPException:
            os.remove(os.path.join(UPLOADS_DIR, comprobante_path))
            raise

        send_push_to_admins(self.db, notifications.comprobante_nuevo(appt, current_user.nombre))
        return appointment_out(appt)

    def my_appointments(self, current_user: User) -> list[dict]:
        return [appointment_out(a) for a in self.appointments.list_by_user(current_user.id)]

    async def upload_comprobante(self, appt_id: int, file: UploadFile, current_user: User) -> dict:
        appt = self.appointments.get_by_id(appt_id)
        if not appt:
            raise HTTPException(status_code=404, detail="Cita no encontrada")
        if appt.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Esta cita no te pertenece")
        if appt.estado == "cancelada":
            # El horario ya se liberó: hay que agendar de nuevo.
            raise HTTPException(status_code=400, detail="Esta cita fue cancelada. Agenda una nueva cita.")

        appt.comprobante_path = await save_uploaded_image(file, COMPROBANTES_DIR)
        appt.pago_estado = "pendiente"
        self.appointments.commit()

        send_push_to_admins(self.db, notifications.comprobante_nuevo(appt, current_user.nombre))
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
        if self.appointments.is_slot_occupied(body.fecha, body.hora):
            raise HTTPException(status_code=409, detail="El horario tiene una cita reservada")
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

        # El diagnóstico ya quedó en el historial de la mascota al momento
        # de la predicción (/predict con pet_id): aquí solo se decide el pago.
        appt.pago_estado = "aprobado" if body.aprobado else "rechazado"
        appt.estado = "confirmada" if body.aprobado else "cancelada"
        self._commit_or_conflict()

        send_push_to_user(
            self.db, appt.user_id,
            notifications.pago_aprobado(appt) if body.aprobado else notifications.pago_rechazado(appt),
        )
        return admin_appointment_out(appt)

    def update_appointment_estado(self, appt_id: int, body: UpdateEstadoBody) -> dict:
        appt = self.appointments.get_by_id(appt_id)
        if not appt:
            raise HTTPException(status_code=404, detail="Cita no encontrada")
        if body.estado not in ("pendiente", "confirmada", "cancelada"):
            raise HTTPException(status_code=400, detail="Estado inválido")
        changed = appt.estado != body.estado
        appt.estado = body.estado
        self._commit_or_conflict()

        if changed and body.estado in ("confirmada", "cancelada"):
            send_push_to_user(
                self.db, appt.user_id,
                notifications.cita_confirmada(appt) if body.estado == "confirmada"
                else notifications.cita_cancelada(appt),
            )
        return {"ok": True, "estado": appt.estado}


def get_appointment_service(
    appointments: AppointmentRepository = Depends(get_appointment_repository),
    db: Session = Depends(get_db),
) -> AppointmentService:
    return AppointmentService(appointments, db)
