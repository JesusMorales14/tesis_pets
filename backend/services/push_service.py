from fastapi import Depends

from models import PushSubscription, User
from push_utils import VAPID_PUBLIC_KEY, send_push_to_admins, send_push_to_user
from repositories.push_subscription_repository import (
    PushSubscriptionRepository, get_push_subscription_repository,
)
from schemas.push import PushSubscriptionBody

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
            self.subscriptions.add(PushSubscription(
                user_id=current_user.id, endpoint=body.endpoint, p256dh=body.p256dh, auth=body.auth,
            ))
        self.subscriptions.commit()
        return {"ok": True}

    def unsubscribe(self, body: dict, current_user: User) -> dict:
        endpoint = body.get("endpoint")
        self.subscriptions.delete_by_endpoint_and_user(endpoint, current_user.id)
        self.subscriptions.commit()
        return {"ok": True}


def get_push_service(
    subscriptions: PushSubscriptionRepository = Depends(get_push_subscription_repository),
) -> PushService:
    return PushService(subscriptions)
