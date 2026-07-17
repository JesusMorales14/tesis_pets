from fastapi import APIRouter, Depends

from models import User
from schemas.pet import PetBody
from services.auth_service import get_current_user
from services.pet_service import PetService, get_pet_service

router = APIRouter(tags=["pets"])


@router.post("/pets")
def create_pet(
    body: PetBody,
    current_user: User = Depends(get_current_user),
    service: PetService = Depends(get_pet_service),
):
    return service.create_pet(body, current_user)


@router.get("/pets")
def list_pets(
    current_user: User = Depends(get_current_user),
    service: PetService = Depends(get_pet_service),
):
    return service.list_pets(current_user)


@router.put("/pets/{pet_id}")
def update_pet(
    pet_id: int, body: PetBody,
    current_user: User = Depends(get_current_user),
    service: PetService = Depends(get_pet_service),
):
    return service.update_pet(pet_id, body, current_user)


@router.delete("/pets/{pet_id}")
def delete_pet(
    pet_id: int,
    current_user: User = Depends(get_current_user),
    service: PetService = Depends(get_pet_service),
):
    return service.delete_pet(pet_id, current_user)


@router.get("/pets/{pet_id}/diagnoses")
def pet_diagnoses(
    pet_id: int,
    current_user: User = Depends(get_current_user),
    service: PetService = Depends(get_pet_service),
):
    return service.pet_diagnoses(pet_id, current_user)
