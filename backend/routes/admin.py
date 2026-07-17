from typing import Optional

from fastapi import APIRouter, Depends, File, UploadFile

from schemas.appointment import BlockSlotBody, UpdateEstadoBody
from schemas.payment import PagoDecisionBody, PaymentConfigBody
from services.auth_service import require_admin
from services.appointment_service import AppointmentService, get_appointment_service
from services.payment_service import PaymentService, get_payment_service

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@router.get("/slots")
def admin_get_slots(fecha: str, service: AppointmentService = Depends(get_appointment_service)):
    return service.admin_get_slots(fecha)


@router.post("/block")
def block_slot(body: BlockSlotBody, service: AppointmentService = Depends(get_appointment_service)):
    return service.block_slot(body)


@router.delete("/block/{fecha}/{hora}")
def unblock_slot(fecha: str, hora: str, service: AppointmentService = Depends(get_appointment_service)):
    return service.unblock_slot(fecha, hora)


@router.get("/appointments")
def admin_all_appointments(
    fecha: Optional[str] = None, service: AppointmentService = Depends(get_appointment_service),
):
    return service.admin_all_appointments(fecha)


@router.get("/appointments/pending-payments")
def admin_pending_payments(service: AppointmentService = Depends(get_appointment_service)):
    return service.admin_pending_payments()


@router.put("/appointments/{appt_id}/pago")
def decide_payment(
    appt_id: int, body: PagoDecisionBody, service: AppointmentService = Depends(get_appointment_service),
):
    return service.decide_payment(appt_id, body)


@router.put("/appointments/{appt_id}/estado")
def update_appointment_estado(
    appt_id: int, body: UpdateEstadoBody, service: AppointmentService = Depends(get_appointment_service),
):
    return service.update_appointment_estado(appt_id, body)


@router.put("/payment-config")
def update_payment_config(body: PaymentConfigBody, service: PaymentService = Depends(get_payment_service)):
    return service.update_payment_config(body)


@router.post("/payment-config/qr")
async def upload_payment_qr(
    file: UploadFile = File(...), service: PaymentService = Depends(get_payment_service),
):
    return await service.upload_payment_qr(file)
