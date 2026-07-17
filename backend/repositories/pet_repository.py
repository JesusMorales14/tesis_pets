from typing import Optional

from fastapi import Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Pet


class PetRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, pet_id: int) -> Optional[Pet]:
        return self.db.query(Pet).filter(Pet.id == pet_id).first()

    def list_by_owner(self, owner_id: int) -> list[Pet]:
        return self.db.query(Pet).filter(Pet.owner_id == owner_id).order_by(Pet.created_at).all()

    def create(self, pet: Pet) -> Pet:
        self.db.add(pet)
        self.db.commit()
        self.db.refresh(pet)
        return pet

    def commit(self) -> None:
        self.db.commit()

    def delete(self, pet: Pet) -> None:
        self.db.delete(pet)


def get_pet_repository(db: Session = Depends(get_db)) -> PetRepository:
    return PetRepository(db)
