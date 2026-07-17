from typing import Optional

from fastapi import Depends
from sqlalchemy.orm import Session

from database import get_db
from models import PushSubscription


class PushSubscriptionRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_endpoint(self, endpoint: str) -> Optional[PushSubscription]:
        return self.db.query(PushSubscription).filter(PushSubscription.endpoint == endpoint).first()

    def add(self, sub: PushSubscription) -> None:
        self.db.add(sub)

    def delete_by_endpoint_and_user(self, endpoint: str, user_id: int) -> None:
        self.db.query(PushSubscription).filter(
            PushSubscription.endpoint == endpoint, PushSubscription.user_id == user_id,
        ).delete()

    def commit(self) -> None:
        self.db.commit()


def get_push_subscription_repository(db: Session = Depends(get_db)) -> PushSubscriptionRepository:
    return PushSubscriptionRepository(db)
