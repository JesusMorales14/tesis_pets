from fastapi import Depends

from core.exceptions import NotFoundError
from infrastructure.push import messages as notifications
from infrastructure.push.web_push import VAPID_PUBLIC_KEY, send_push, send_push_to_admins, send_push_to_user
from models import PushSubscription, User
from repositories.push_subscription_repository import (
    PushSubscriptionRepository,
    get_push_subscription_repository,
)
from schemas.push import PushEndpointBody, PushSubscriptionBody

__all__ = ["PushService", "get_push_service", "VAPID_PUBLIC_KEY", "send_push_to_admins", "send_push_to_user"]


class PushService:
    def __init__(self, subscriptions: PushSubscriptionRepository):
        self.subscriptions = subscriptions

    def get_vapid_public_key(self) -> dict:
        return {"publicKey": VAPID_PUBLIC_KEY}

    def subscribe(self, body: PushSubscriptionBody, current_user: User) -> dict:
        existing = self.subscriptions.get_by_endpoint(body.endpoint)
        if existing:
            existing.user_id = current_user.id
            existing.p256dh = body.p256dh
            existing.auth = body.auth
        else:
            self.subscriptions.add(
                PushSubscription(
                    user_id=current_user.id,
                    endpoint=body.endpoint,
                    p256dh=body.p256dh,
                    auth=body.auth,
                )
            )
        self.subscriptions.commit()
        return {"ok": True}

    def unsubscribe(self, body: PushEndpointBody, current_user: User) -> dict:
        self.subscriptions.delete_by_endpoint_and_user(body.endpoint, current_user.id)
        self.subscriptions.commit()
        return {"ok": True}

    def status(self, body: PushEndpointBody, current_user: User) -> dict:
        """Si este dispositivo recibe las notificaciones de ESTA cuenta. El
        permiso del navegador no basta: sigue "concedido" tras desactivar, y
        el mismo navegador pudo quedar suscrito con otra cuenta."""
        sub = self.subscriptions.get_by_endpoint(body.endpoint)
        return {"subscribed": bool(sub and sub.user_id == current_user.id)}

    def send_test(self, body: PushEndpointBody, current_user: User) -> dict:
        """Notificación de ejemplo a este dispositivo, para ver cómo se ven."""
        sub = self.subscriptions.get_by_endpoint(body.endpoint)
        if not sub or sub.user_id != current_user.id:
            raise NotFoundError("Este dispositivo no tiene las notificaciones activadas")
        send_push(
            {"endpoint": sub.endpoint, "keys": {"p256dh": sub.p256dh, "auth": sub.auth}},
            notifications.prueba(),
        )
        return {"ok": True}


def get_push_service(
    subscriptions: PushSubscriptionRepository = Depends(get_push_subscription_repository),
) -> PushService:
    return PushService(subscriptions)
