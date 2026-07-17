import calendar
from datetime import date

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User, Vaccination
from repositories.vaccination_repository import VaccinationRepository, get_vaccination_repository
from services.pet_service import get_owned_pet
from schemas.vaccination import VaccinationBody
from vaccine_schedule import VACCINE_SCHEDULE


def add_months(iso_date: str, months: int) -> str:
    """Suma meses a una fecha 'YYYY-MM-DD' sin depender de python-dateutil."""
    d = date.fromisoformat(iso_date)
    total_month = d.month - 1 + months
    year = d.year + total_month // 12
    month = total_month % 12 + 1
    # Recorta al último día válido del mes destino (ej. 31 ene + 1 mes -> 28/29 feb).
    day = min(d.day, calendar.monthrange(year, month)[1])
    return date(year, month, day).isoformat()


def vaccination_out(v: Vaccination) -> dict:
    return {
        "id": v.id, "nombre": v.nombre, "fecha_aplicacion": v.fecha_aplicacion,
        "fecha_proxima": v.fecha_proxima, "notas": v.notas,
    }


def get_vaccine_schedule(especie: str) -> dict:
    especie = especie.strip().lower()
    if especie not in VACCINE_SCHEDULE:
        raise HTTPException(status_code=400, detail="La especie debe ser 'perro' o 'gato'")
    return VACCINE_SCHEDULE[especie]


class VaccinationService:
    def __init__(self, vaccinations: VaccinationRepository, db: Session):
        self.vaccinations = vaccinations
        self.db = db

    def create_vaccination(self, pet_id: int, body: VaccinationBody, current_user: User) -> dict:
        get_owned_pet(pet_id, self.db, current_user)
        fecha_proxima = add_months(body.fecha_aplicacion, body.refuerzo_meses) if body.refuerzo_meses else None
        v = Vaccination(
            pet_id=pet_id,
            nombre=body.nombre,
            fecha_aplicacion=body.fecha_aplicacion,
            fecha_proxima=fecha_proxima,
            notas=body.notas.strip() if body.notas else None,
        )
        v = self.vaccinations.create(v)
        return vaccination_out(v)

    def list_vaccinations(self, pet_id: int, current_user: User) -> list[dict]:
        get_owned_pet(pet_id, self.db, current_user)
        return [vaccination_out(v) for v in self.vaccinations.list_by_pet(pet_id)]

    def delete_vaccination(self, pet_id: int, vaccination_id: int, current_user: User) -> dict:
        get_owned_pet(pet_id, self.db, current_user)
        v = self.vaccinations.get_by_id_and_pet(vaccination_id, pet_id)
        if not v:
            raise HTTPException(status_code=404, detail="Registro de vacuna no encontrado")
        self.vaccinations.delete(v)
        return {"ok": True}


def get_vaccination_service(
    vaccinations: VaccinationRepository = Depends(get_vaccination_repository),
    db: Session = Depends(get_db),
) -> VaccinationService:
    return VaccinationService(vaccinations, db)
