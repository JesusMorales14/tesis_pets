"""Envío de notificaciones push (Web Push / VAPID).

No depende de Firebase ni de ninguna cuenta de terceros: VAPID es un
estándar abierto (RFC 8292) soportado nativamente por los navegadores
(Chrome, Firefox, Edge, Safari 16.4+). Las claves deben permanecer
estables entre reinicios — si cambian, todas las suscripciones existentes
en los navegadores de los usuarios dejan de funcionar y deben volver a
suscribirse.

En producción, define VAPID_PRIVATE_KEY_PEM y VAPID_PUBLIC_KEY vía
variables de entorno con un par generado para ese despliegue (ver
.env.example). Sin esas variables (desarrollo local / tests / CI) se
genera un par nuevo en cada arranque del proceso — las suscripciones no
sobreviven un reinicio, pero es la única opción que no deja un par de
claves real embebido en el código fuente público de este repositorio.
"""
import base64
import os

from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat
from py_vapid import Vapid
from pywebpush import webpush, WebPushException
from sqlalchemy.orm import Session


def _generate_dev_keypair() -> tuple[str, str]:
    vapid = Vapid()
    vapid.generate_keys()
    private_pem = vapid.private_pem().decode()
    public_raw = vapid.public_key.public_bytes(Encoding.X962, PublicFormat.UncompressedPoint)
    public_b64 = base64.urlsafe_b64encode(public_raw).decode().rstrip("=")
    return private_pem, public_b64


_env_private = os.getenv("VAPID_PRIVATE_KEY_PEM")
_env_public = os.getenv("VAPID_PUBLIC_KEY")

if _env_private and _env_public:
    VAPID_PRIVATE_KEY_PEM = _env_private
    VAPID_PUBLIC_KEY = _env_public
else:
    VAPID_PRIVATE_KEY_PEM, VAPID_PUBLIC_KEY = _generate_dev_keypair()
    print("[push_utils] VAPID_PRIVATE_KEY_PEM/VAPID_PUBLIC_KEY no definidos en el entorno — "
          "generando un par nuevo para esta sesión (las suscripciones push no sobrevivirán un reinicio).")

VAPID_CLAIMS_EMAIL = os.getenv("VAPID_CLAIMS_EMAIL", "mailto:contacto@cityvet.pe")


def send_push(subscription_info: dict, payload: dict) -> bool:
    """Envía una notificación a una suscripción. Devuelve False si la
    suscripción ya no es válida (el navegador la eliminó / el usuario
    revocó el permiso) para que el llamador la borre de la base de datos."""
    try:
        webpush(
            subscription_info=subscription_info,
            data=__import__("json").dumps(payload),
            vapid_private_key=VAPID_PRIVATE_KEY_PEM,
            vapid_claims={"sub": VAPID_CLAIMS_EMAIL},
        )
        return True
    except WebPushException as e:
        status = getattr(e.response, "status_code", None)
        if status in (404, 410):
            return False
        print("Error enviando push:", e)
        return True  # error transitorio: no borrar la suscripción


def send_push_to_user(db: Session, user_id: int, payload: dict) -> None:
    from models import PushSubscription

    subs = db.query(PushSubscription).filter(PushSubscription.user_id == user_id).all()
    for sub in subs:
        still_valid = send_push(
            {"endpoint": sub.endpoint, "keys": {"p256dh": sub.p256dh, "auth": sub.auth}},
            payload,
        )
        if not still_valid:
            db.delete(sub)
    db.commit()


def send_push_to_admins(db: Session, payload: dict) -> None:
    from models import PushSubscription, User

    admin_ids = [u.id for u in db.query(User).filter(User.role == "admin").all()]
    subs = db.query(PushSubscription).filter(PushSubscription.user_id.in_(admin_ids)).all()
    for sub in subs:
        still_valid = send_push(
            {"endpoint": sub.endpoint, "keys": {"p256dh": sub.p256dh, "auth": sub.auth}},
            payload,
        )
        if not still_valid:
            db.delete(sub)
    db.commit()
