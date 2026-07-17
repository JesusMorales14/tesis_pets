"""Constantes de rutas de archivos y límites de subida, en su propio
módulo hoja para que tanto main.py (mount de /uploads) como
services/upload_service.py puedan importarlas sin depender uno del otro."""
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
QR_DIR = os.path.join(UPLOADS_DIR, "payment-config")
COMPROBANTES_DIR = os.path.join(UPLOADS_DIR, "comprobantes")
os.makedirs(QR_DIR, exist_ok=True)
os.makedirs(COMPROBANTES_DIR, exist_ok=True)

ALLOWED_IMAGE_TYPES = {"image/png", "image/jpeg", "image/webp"}
MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB
