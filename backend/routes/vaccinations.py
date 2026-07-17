from fastapi import APIRouter, Depends

from models import User
from schemas.vaccination import VaccinationBody
from services.auth_service import get_current_user
from services.vaccination_service import (
    VaccinationService, get_vaccination_service, get_vaccine_schedule,
)

router = APIRouter(tags=["vaccinations"])


@router.get("/vaccine-schedule")
def vaccine_schedule(especie: str):
    return get_vaccine_schedule(especie)


@router.post("/pets/{pet_id}/vaccinations")
def create_vaccination(
    pet_id: int, body: VaccinationBody,
    current_user: User = Depends(get_current_user),
    service: VaccinationService = Depends(get_vaccination_service),
):
    return service.create_vaccination(pet_id, body, current_user)


@router.get("/pets/{pet_id}/vaccinations")
def list_vaccinations(
    pet_id: int,
    current_user: User = Depends(get_current_user),
    service: VaccinationService = Depends(get_vaccination_service),
):
    return service.list_vaccinations(pet_id, current_user)


@router.delete("/pets/{pet_id}/vaccinations/{vaccination_id}")
def delete_vaccination(
    pet_id: int, vaccination_id: int,
    current_user: User = Depends(get_current_user),
    service: VaccinationService = Depends(get_vaccination_service),
):
    return service.delete_vaccination(pet_id, vaccination_id, current_user)
