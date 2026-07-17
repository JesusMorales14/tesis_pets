from typing import Optional

from fastapi import APIRouter, Depends

from models import User
from schemas.predict import Sintomas
from services.auth_service import get_current_user_optional
from services.diagnosis_service import DiagnosisService, get_diagnosis_service

router = APIRouter(tags=["predict"])


@router.post("/predict")
def predict(
    data: Sintomas,
    current_user: Optional[User] = Depends(get_current_user_optional),
    service: DiagnosisService = Depends(get_diagnosis_service),
):
    return service.predict(data, current_user)
