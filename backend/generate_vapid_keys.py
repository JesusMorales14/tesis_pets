"""Genera un par de claves VAPID para las notificaciones push.

Uso (desde la carpeta backend):
    python generate_vapid_keys.py

Copia las dos líneas que imprime en tu archivo .env. Las claves deben ser
estables: si cambian, todas las suscripciones de los navegadores dejan de
recibir notificaciones y cada usuario debe volver a activarlas.
"""
import base64

from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat
from py_vapid import Vapid

vapid = Vapid()
vapid.generate_keys()
public_raw = vapid.public_key.public_bytes(Encoding.X962, PublicFormat.UncompressedPoint)
public_b64 = base64.urlsafe_b64encode(public_raw).decode().rstrip("=")
# El PEM ocupa varias líneas: en el .env se escribe en una sola, con \n.
private_one_line = vapid.private_pem().decode().strip().replace("\n", "\\n")

print(f"VAPID_PUBLIC_KEY={public_b64}")
print(f"VAPID_PRIVATE_KEY_PEM={private_one_line}")
