from fastapi import APIRouter, Depends

from services.appointment_service import AppointmentService, get_appointment_service

router = APIRouter(tags=["slots"])


@router.get("/slots")
def get_slots(fecha: str, service: AppointmentService = Depends(get_appointment_service)):
    return service.get_slots(fecha)
