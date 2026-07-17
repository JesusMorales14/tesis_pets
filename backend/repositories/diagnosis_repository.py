from fastapi import Depends
from sqlalchemy.orm import Session

from database import get_db
from models import DiagnosisRecord


class DiagnosisRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, record: DiagnosisRecord) -> DiagnosisRecord:
        self.db.add(record)
        self.db.commit()
        return record


def get_diagnosis_repository(db: Session = Depends(get_db)) -> DiagnosisRepository:
    return DiagnosisRepository(db)
