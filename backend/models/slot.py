from sqlalchemy import Column, DateTime, Integer, String

from core.database import Base
from core.time_utils import utc_now


class UnavailableSlot(Base):
    __tablename__ = "unavailable_slots"
    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(String, nullable=False)
    hora = Column(String, nullable=False)
    created_at = Column(DateTime, default=utc_now)
