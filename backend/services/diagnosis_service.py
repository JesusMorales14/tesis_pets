import json
from typing import Optional

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from ml.predict import predict_sickness
from models import DiagnosisRecord, User
from repositories.diagnosis_repository import DiagnosisRepository, get_diagnosis_repository
from schemas.predict import Sintomas
from services.pet_service import get_owned_pet


class DiagnosisService:
    def __init__(self, diagnoses: DiagnosisRepository, db: Session):
        self.diagnoses = diagnoses
        self.db = db

    def predict(self, data: Sintomas, current_user: Optional[User]) -> dict:
        payload = data.model_dump()
        pet_id = payload.pop("pet_id", None)

        try:
            result = predict_sickness(payload)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error inesperado: {str(e)}")

        if pet_id is not None:
            if not current_user:
                raise HTTPException(
                    status_code=401,
                    detail="Debes iniciar sesión para guardar este diagnóstico en el historial de tu mascota",
                )
            pet = get_owned_pet(pet_id, self.db, current_user)
            sintomas_presentes = {
                k: v for k, v in payload.items() if k != "especie" and v
            }
            record = DiagnosisRecord(
                pet_id=pet.id,
                diagnostico=result["diagnostico"],
                probabilidad=result["probabilidad"],
                diagnostico_alternativo=result.get("diagnostico_alternativo"),
                probabilidad_alternativa=result.get("probabilidad_alternativa"),
                gravedad=result["gravedad"],
                sintomas_json=json.dumps(sintomas_presentes, ensure_ascii=False),
            )
            self.diagnoses.create(record)
            result = {**result, "guardado_en_historial": True, "mascota": pet.nombre}

        return result


def get_diagnosis_service(
    diagnoses: DiagnosisRepository = Depends(get_diagnosis_repository),
    db: Session = Depends(get_db),
) -> DiagnosisService:
    return DiagnosisService(diagnoses, db)
