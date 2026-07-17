from typing import Optional

from fastapi import Depends
from sqlalchemy.orm import Session

from database import get_db
from models import PaymentConfig


class PaymentConfigRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self) -> Optional[PaymentConfig]:
        return self.db.query(PaymentConfig).filter(PaymentConfig.id == 1).first()

    def get_or_create(self) -> PaymentConfig:
        cfg = self.get()
        if not cfg:
            cfg = PaymentConfig(id=1)
            self.db.add(cfg)
            self.db.commit()
            self.db.refresh(cfg)
        return cfg

    def commit(self) -> None:
        self.db.commit()

    def refresh(self, cfg: PaymentConfig) -> None:
        self.db.refresh(cfg)


def get_payment_config_repository(db: Session = Depends(get_db)) -> PaymentConfigRepository:
    return PaymentConfigRepository(db)
