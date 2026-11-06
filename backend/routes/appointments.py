from typing import Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile

from models import User
from routes.dependencies import get_current_user
from schemas.appointment import AppointmentBody
from services.appointment_service import AppointmentService, get_appointment_service

router = APIRouter(tags=["appointments"])


@router.post("/appointments")
def create_appointment(
    body: AppointmentBody,
    current_user: User = Depends(get_current_user),
    service: AppointmentService = Depends(get_appointment_service),
):
    return service.create_appointment(body, current_user)


@router.post("/appointments/with-comprobante")
async def create_appointment_with_comprobante(
    fecha: str = Form(...),
    hora: str = Form(...),
    diagnostico: str = Form(...),
    especie: str = Form(...),
    gravedad: str = Form(...),
    metodo_pago: str = Form(...),
    file: UploadFile = File(...),
    probabilidad: Optional[float] = Form(None),
    pet_id: Optional[int] = Form(None),
    sintomas_json: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    service: AppointmentService = Depends(get_appointment_service),
):
    body = AppointmentBody(
        fecha=fecha,
        hora=hora,
        diagnostico=diagnostico,
        especie=especie,
        gravedad=gravedad,
        metodo_pago=metodo_pago,
        probabilidad=probabilidad,
        pet_id=pet_id,
        sintomas_json=sintomas_json,
    )
    return await service.create_appointment_with_comprobante(body, file, current_user)


@router.get("/appointments/mine")
def my_appointments(
    current_user: User = Depends(get_current_user),
    service: AppointmentService = Depends(get_appointment_service),
):
    return service.my_appointments(current_user)


@router.post("/appointments/{appt_id}/comprobante")
async def upload_comprobante(
    appt_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    service: AppointmentService = Depends(get_appointment_service),
):
    return await service.upload_comprobante(appt_id, file, current_user)
