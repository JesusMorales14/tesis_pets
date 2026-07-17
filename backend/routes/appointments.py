from fastapi import APIRouter, Depends, File, UploadFile

from models import User
from schemas.appointment import AppointmentBody
from services.auth_service import get_current_user
from services.appointment_service import AppointmentService, get_appointment_service

router = APIRouter(tags=["appointments"])


@router.post("/appointments")
def create_appointment(
    body: AppointmentBody,
    current_user: User = Depends(get_current_user),
    service: AppointmentService = Depends(get_appointment_service),
):
    return service.create_appointment(body, current_user)


@router.get("/appointments/mine")
def my_appointments(
    current_user: User = Depends(get_current_user),
    service: AppointmentService = Depends(get_appointment_service),
):
    return service.my_appointments(current_user)


@router.post("/appointments/{appt_id}/comprobante")
async def upload_comprobante(
    appt_id: int, file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    service: AppointmentService = Depends(get_appointment_service),
):
    return await service.upload_comprobante(appt_id, file, current_user)
