from sqlalchemy import Column, DateTime, Integer, String

from core.database import Base
from core.time_utils import utc_now


class PushSubscription(Base):
    """Suscripción de notificaciones push (Web Push / VAPID) de un
    navegador concreto. Un mismo usuario puede tener varias (una por
    dispositivo/navegador donde aceptó las notificaciones)."""

    __tablename__ = "push_subscriptions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    endpoint = Column(String, unique=True, nullable=False)
    p256dh = Column(String, nullable=False)
    auth = Column(String, nullable=False)
    created_at = Column(DateTime, default=utc_now)
