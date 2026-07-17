from typing import Optional

from fastapi import Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Vaccination


class VaccinationRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_by_pet(self, pet_id: int) -> list[Vaccination]:
        return (
            self.db.query(Vaccination)
            .filter(Vaccination.pet_id == pet_id)
            .order_by(Vaccination.fecha_aplicacion.desc())
            .all()
        )

    def get_by_id_and_pet(self, vaccination_id: int, pet_id: int) -> Optional[Vaccination]:
        return self.db.query(Vaccination).filter(
            Vaccination.id == vaccination_id, Vaccination.pet_id == pet_id,
        ).first()

    def create(self, vaccination: Vaccination) -> Vaccination:
        self.db.add(vaccination)
        self.db.commit()
        self.db.refresh(vaccination)
        return vaccination

    def delete(self, vaccination: Vaccination) -> None:
        self.db.delete(vaccination)
        self.db.commit()


def get_vaccination_repository(db: Session = Depends(get_db)) -> VaccinationRepository:
    return VaccinationRepository(db)
