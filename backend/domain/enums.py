"""Valores de dominio. Antes eran strings sueltos repetidos en servicios y
repositorios ("pendiente", "aprobado", "admin"…); un typo pasaba inadvertido.

Son `StrEnum`: se guardan y se serializan exactamente como los strings de
antes, así que la base de datos y la API no cambian.
"""

from enum import StrEnum


class Role(StrEnum):
    USER = "user"
    ADMIN = "admin"


class Species(StrEnum):
    PERRO = "perro"
    GATO = "gato"


class AppointmentStatus(StrEnum):
    PENDIENTE = "pendiente"
    CONFIRMADA = "confirmada"
    CANCELADA = "cancelada"


class PaymentStatus(StrEnum):
    PENDIENTE = "pendiente"
    APROBADO = "aprobado"
    RECHAZADO = "rechazado"


class VaccinationStatus(StrEnum):
    APLICADA = "aplicada"
    PROGRAMADA = "programada"
