from fastapi import APIRouter, Depends

from models import User
from routes.dependencies import get_current_user
from schemas.push import PushEndpointBody, PushSubscriptionBody
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
    body: PushEndpointBody,
    current_user: User = Depends(get_current_user),
    service: PushService = Depends(get_push_service),
):
    return service.unsubscribe(body, current_user)


@router.post("/status")
def push_status(
    body: PushEndpointBody,
    current_user: User = Depends(get_current_user),
    service: PushService = Depends(get_push_service),
):
    return service.status(body, current_user)


@router.post("/test")
def send_test_push(
    body: PushEndpointBody,
    current_user: User = Depends(get_current_user),
    service: PushService = Depends(get_push_service),
):
    return service.send_test(body, current_user)
