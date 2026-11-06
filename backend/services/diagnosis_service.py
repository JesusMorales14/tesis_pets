import json
import logging
from typing import Optional

from fastapi import Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.exceptions import BadRequestError, UnauthorizedError, UnexpectedError
from ml.predict import predict_sickness
from models import DiagnosisRecord, User
from repositories.diagnosis_repository import DiagnosisRepository, get_diagnosis_repository
from schemas.predict import Sintomas
from services.pet_service import get_owned_pet

logger = logging.getLogger(__name__)


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
            raise BadRequestError(str(e)) from e
        except Exception as e:
            # El detalle va al log: devolverlo al cliente exponía datos internos.
            logger.exception("Fallo inesperado en la predicción")
            raise UnexpectedError("No se pudo procesar el diagnóstico. Intenta de nuevo.") from e

        if pet_id is not None:
            if not current_user:
                raise UnauthorizedError(
                    "Debes iniciar sesión para asociar este diagnóstico a tu mascota",
                )
            pet = get_owned_pet(pet_id, self.db, current_user)
            if pet.especie != result["especie"]:
                raise BadRequestError(
                    "La especie no coincide con la de la mascota seleccionada",
                )
            # Guardar diagnóstico inmediatamente en el historial de la mascota
            record = DiagnosisRecord(
                pet_id=pet.id,
                diagnostico=result["diagnostico"],
                probabilidad=result["probabilidad"],
                diagnostico_alternativo=result.get("diagnostico_alternativo"),
                probabilidad_alternativa=result.get("probabilidad_alternativa"),
                gravedad=result["gravedad"],
                sintomas_json=json.dumps({k: v for k, v in payload.items() if isinstance(v, int)}),
            )
            record = self.diagnoses.create(record)
            result = {
                **result,
                "guardado_en_historial": True,
                "mascota": pet.nombre,
                "pet_id": pet.id,
                "mensaje_historial": "Diagnóstico guardado en el historial de tu mascota",
            }

        return result


def get_diagnosis_service(
    diagnoses: DiagnosisRepository = Depends(get_diagnosis_repository),
    db: Session = Depends(get_db),
) -> DiagnosisService:
    return DiagnosisService(diagnoses, db)
