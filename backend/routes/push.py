from fastapi import APIRouter, Depends

from models import User
from schemas.push import PushSubscriptionBody
from services.auth_service import get_current_user
from services.push_service import PushService, get_push_service

router = APIRouter(prefix="/push", tags=["push"])


@router.get("/vapid-public-key")
def get_vapid_public_key(service: PushService = Depends(get_push_service)):
    return service.get_vapid_public_key()


@router.post("/subscribe")
def subscribe_push(
    body: PushSubscriptionBody,
    current_user: User = Depends(get_current_user),
    service: PushService = Depends(get_push_service),
):
    return service.subscribe(body, current_user)


@router.post("/unsubscribe")
def unsubscribe_push(
    body: dict,
    current_user: User = Depends(get_current_user),
    service: PushService = Depends(get_push_service),
):
    return service.unsubscribe(body, current_user)
