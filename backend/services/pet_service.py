from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Pet, User, DiagnosisRecord
from repositories.pet_repository import PetRepository, get_pet_repository
from schemas.pet import PetBody


def pet_out(pet: Pet) -> dict:
    return {
        "id": pet.id, "nombre": pet.nombre, "especie": pet.especie,
        "raza": pet.raza, "edad_meses": pet.edad_meses, "peso_kg": pet.peso_kg,
    }


def get_owned_pet(pet_id: int, db: Session, current_user: User) -> Pet:
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Mascota no encontrada")
    if pet.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Esta mascota no te pertenece")
    return pet


class PetService:
    def __init__(self, pets: PetRepository, db: Session):
        self.pets = pets
        self.db = db

    def create_pet(self, body: PetBody, current_user: User) -> dict:
        pet = Pet(
            owner_id=current_user.id,
            nombre=body.nombre,
            especie=body.especie,
            raza=body.raza.strip() if body.raza else None,
            edad_meses=body.edad_meses,
            peso_kg=body.peso_kg,
        )
        pet = self.pets.create(pet)
        return pet_out(pet)

    def list_pets(self, current_user: User) -> list[dict]:
        return [pet_out(p) for p in self.pets.list_by_owner(current_user.id)]

    def update_pet(self, pet_id: int, body: PetBody, current_user: User) -> dict:
        pet = get_owned_pet(pet_id, self.db, current_user)
        pet.nombre = body.nombre
        pet.especie = body.especie
        pet.raza = body.raza.strip() if body.raza else None
        pet.edad_meses = body.edad_meses
        pet.peso_kg = body.peso_kg
        self.pets.commit()
        return pet_out(pet)

    def delete_pet(self, pet_id: int, current_user: User) -> dict:
        pet = get_owned_pet(pet_id, self.db, current_user)
        self.db.query(DiagnosisRecord).filter(DiagnosisRecord.pet_id == pet.id).delete()
        self.pets.delete(pet)
        self.pets.commit()
        return {"ok": True}

    def pet_diagnoses(self, pet_id: int, current_user: User) -> list[dict]:
        pet = get_owned_pet(pet_id, self.db, current_user)
        records = (
            self.db.query(DiagnosisRecord)
            .filter(DiagnosisRecord.pet_id == pet.id)
            .order_by(DiagnosisRecord.created_at.desc())
            .all()
        )
        import json
        return [
            {
                "id": r.id,
                "diagnostico": r.diagnostico,
                "probabilidad": r.probabilidad,
                "diagnostico_alternativo": r.diagnostico_alternativo,
                "probabilidad_alternativa": r.probabilidad_alternativa,
                "gravedad": r.gravedad,
                "sintomas": json.loads(r.sintomas_json),
                "created_at": r.created_at.isoformat(),
            }
            for r in records
        ]


def get_pet_service(
    pets: PetRepository = Depends(get_pet_repository),
    db: Session = Depends(get_db),
) -> PetService:
    return PetService(pets, db)
