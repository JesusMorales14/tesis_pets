from pydantic import BaseModel


class PushSubscriptionBody(BaseModel):
    endpoint: str
    p256dh: str
    auth: str


class PushEndpointBody(BaseModel):
    """Identifica la suscripción de este navegador/dispositivo."""
    endpoint: str
