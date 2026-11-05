import json

from fastapi import Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.exceptions import ForbiddenError, NotFoundError
from core.time_utils import utc_isoformat
from models import Appointment, DiagnosisRecord, Pet, User, Vaccination
from repositories.pet_repository import PetRepository, get_pet_repository
from schemas.pet import PetBody


def pet_out(pet: Pet) -> dict:
    return {
        "id": pet.id,
        "nombre": pet.nombre,
        "especie": pet.especie,
        "raza": pet.raza,
        "edad_meses": pet.edad_meses,
        "peso_kg": pet.peso_kg,
    }


def diagnosis_out(r: DiagnosisRecord) -> dict:
    return {
        "id": r.id,
        "diagnostico": r.diagnostico,
        "probabilidad": r.probabilidad,
        "diagnostico_alternativo": r.diagnostico_alternativo,
        "probabilidad_alternativa": r.probabilidad_alternativa,
        "gravedad": r.gravedad,
        "sintomas": json.loads(r.sintomas_json),
        "created_at": utc_isoformat(r.created_at),
    }


def get_owned_pet(pet_id: int, db: Session, current_user: User) -> Pet:
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        raise NotFoundError("Mascota no encontrada")
    if pet.owner_id != current_user.id:
        raise ForbiddenError("Esta mascota no te pertenece")
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
        # Se borra el historial clínico explícitamente, sin depender del
        # ON DELETE CASCADE (bases SQLite antiguas no tenían las FK activas).
        self.db.query(Vaccination).filter(Vaccination.pet_id == pet.id).delete(synchronize_session=False)
        self.db.query(DiagnosisRecord).filter(DiagnosisRecord.pet_id == pet.id).delete(synchronize_session=False)
        # NO cancelar citas: el usuario ya pagó por ellas. Solo se desvinculan
        # para que no queden apuntando al id de una mascota que ya no existe.
        self.db.query(Appointment).filter(Appointment.pet_id == pet.id).update(
            {Appointment.pet_id: None},
            synchronize_session=False,
        )
        self.pets.delete(pet)
        self.pets.commit()
        return {"ok": True}

    def pet_diagnoses(self, pet_id: int, current_user: User) -> list[dict]:
        pet = get_owned_pet(pet_id, self.db, current_user)
        return [diagnosis_out(r) for r in self._diagnoses_of(pet.id)]

    def clinical_record(self, pet_id: int) -> dict:
        """Ficha clínica para el veterinario (solo admin): datos de la
        mascota, cartilla de vacunación e historial de diagnósticos, para
        preparar la consulta antes de atenderla."""
        from services.vaccination_service import vaccination_out

        pet = self.pets.get_by_id(pet_id)
        if not pet:
            raise NotFoundError("Mascota no encontrada")
        vaccinations = (
            self.db.query(Vaccination).filter(Vaccination.pet_id == pet.id).order_by(Vaccination.fecha_proxima).all()
        )
        return {
            **pet_out(pet),
            "vacunas": [vaccination_out(v) for v in vaccinations],
            "diagnosticos": [diagnosis_out(r) for r in self._diagnoses_of(pet.id)],
        }

    def _diagnoses_of(self, pet_id: int) -> list[DiagnosisRecord]:
        return (
            self.db.query(DiagnosisRecord)
            .filter(DiagnosisRecord.pet_id == pet_id)
            .order_by(DiagnosisRecord.created_at.desc())
            .all()
        )


def get_pet_service(
    pets: PetRepository = Depends(get_pet_repository),
    db: Session = Depends(get_db),
) -> PetService:
    return PetService(pets, db)
