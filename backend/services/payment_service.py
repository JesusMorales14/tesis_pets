from typing import Optional

from fastapi import Depends, UploadFile

from config import QR_DIR
from models import PaymentConfig
from repositories.payment_config_repository import (
    PaymentConfigRepository, get_payment_config_repository,
)
from schemas.payment import PaymentConfigBody
from services.upload_service import save_uploaded_image


def payment_config_out(cfg: Optional[PaymentConfig]) -> dict:
    if not cfg:
        return {
            "yape_phone": None, "yape_qr_url": None, "banco": None,
            "tipo_cuenta": None, "numero_cuenta": None, "cci": None, "titular": None,
        }
    return {
        "yape_phone": cfg.yape_phone,
        "yape_qr_url": f"/uploads/{cfg.yape_qr_path}" if cfg.yape_qr_path else None,
        "banco": cfg.banco, "tipo_cuenta": cfg.tipo_cuenta,
        "numero_cuenta": cfg.numero_cuenta, "cci": cfg.cci, "titular": cfg.titular,
    }


class PaymentService:
    def __init__(self, config: PaymentConfigRepository):
        self.config = config

    def get_payment_config(self) -> dict:
        return payment_config_out(self.config.get())

    def update_payment_config(self, body: PaymentConfigBody) -> dict:
        cfg = self.config.get_or_create()
        for field, value in body.model_dump().items():
            setattr(cfg, field, value)
        self.config.commit()
        self.config.refresh(cfg)
        return payment_config_out(cfg)

    async def upload_payment_qr(self, file: UploadFile) -> dict:
        cfg = self.config.get_or_create()
        cfg.yape_qr_path = await save_uploaded_image(file, QR_DIR)
        self.config.commit()
        self.config.refresh(cfg)
        return payment_config_out(cfg)


def get_payment_service(
    config: PaymentConfigRepository = Depends(get_payment_config_repository),
) -> PaymentService:
    return PaymentService(config)
