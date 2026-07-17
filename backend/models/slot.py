from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from database import Base


class UnavailableSlot(Base):
    __tablename__ = "unavailable_slots"
    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(String, nullable=False)
    hora = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
