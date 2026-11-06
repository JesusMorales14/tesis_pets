from core.database import Base

from .appointment import Appointment
from .diagnosis import DiagnosisRecord
from .payment_config import PaymentConfig
from .pet import Pet
from .push_subscription import PushSubscription
from .slot import UnavailableSlot
from .user import User
from .vaccination import Vaccination

__all__ = [
    "Base",
    "User",
    "Pet",
    "Appointment",
    "UnavailableSlot",
    "PaymentConfig",
    "PushSubscription",
    "Vaccination",
    "DiagnosisRecord",
]
