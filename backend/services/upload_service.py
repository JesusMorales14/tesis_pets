import os
import uuid

from fastapi import HTTPException, UploadFile

from config import ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES


async def save_uploaded_image(upload: UploadFile, directory: str) -> str:
    """Valida tipo/tamaño y guarda una imagen subida con nombre único.
    Devuelve la ruta relativa a exponer vía /uploads/..."""
    if upload.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Solo se permiten imágenes PNG, JPEG o WEBP")
    contents = await upload.read()
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="La imagen no debe superar 5 MB")
    ext = {"image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp"}[upload.content_type]
    filename = f"{uuid.uuid4().hex}{ext}"
    with open(os.path.join(directory, filename), "wb") as f:
        f.write(contents)
    return f"{os.path.basename(directory)}/{filename}"
