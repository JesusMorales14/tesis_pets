import json

from fastapi import Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.exceptions import BadRequestError, UnauthorizedError
from core.security import ADMIN_CODE, create_token, hash_password, verify_password
from core.time_utils import utc_isoformat, utc_now
from domain.enums import Role
from models import Appointment, DiagnosisRecord, Pet, PushSubscription, User, Vaccination
from repositories.user_repository import UserRepository, get_user_repository
from schemas.auth import ChangePasswordBody, LoginBody, RegisterBody


def user_out(user: User) -> dict:
    return {"id": user.id, "nombre": user.nombre, "email": user.email, "role": user.role}


class AuthService:
    def __init__(self, users: UserRepository, db: Session):
        self.users = users
        self.db = db

    def register(self, body: RegisterBody) -> dict:
        if self.users.get_by_email(body.email.lower()):
            raise BadRequestError("El correo ya está registrado")
        role = Role.ADMIN if body.admin_code == ADMIN_CODE else Role.USER
        user = User(
            nombre=body.nombre.strip(),
            email=body.email.strip().lower(),
            password_hash=hash_password(body.password),
            role=role,
            accepted_privacy_at=utc_now(),
        )
        user = self.users.create(user)
        token = create_token(user.id, user.role)
        return {"token": token, "user": user_out(user)}

    def login(self, body: LoginBody) -> dict:
        user = self.users.get_by_email(body.email.strip().lower())
        if not user or not verify_password(body.password, user.password_hash):
            raise UnauthorizedError("Correo o contraseña incorrectos")
        token = create_token(user.id, user.role)
        return {"token": token, "user": user_out(user)}

    def change_password(self, current_user: User, body: ChangePasswordBody) -> dict:
        if not verify_password(body.current_password, current_user.password_hash):
            raise UnauthorizedError("La contraseña actual es incorrecta")
        current_user.password_hash = hash_password(body.new_password)
        self.users.commit()
        return {"message": "Contraseña actualizada correctamente"}

    def export_my_data(self, current_user: User) -> dict:
        """Derecho de acceso (Ley N.° 29733): descarga de todos los datos que
        tenemos sobre el usuario y sus mascotas, en un solo JSON."""
        from services.appointment_service import appointment_out
        from services.pet_service import pet_out
        from services.vaccination_service import vaccination_out

        pets = self.db.query(Pet).filter(Pet.owner_id == current_user.id).all()
        pets_data = []
        for pet in pets:
            vaccinations = self.db.query(Vaccination).filter(Vaccination.pet_id == pet.id).all()
            diagnoses = self.db.query(DiagnosisRecord).filter(DiagnosisRecord.pet_id == pet.id).all()
            pets_data.append(
                {
                    **pet_out(pet),
                    "vacunas": [vaccination_out(v) for v in vaccinations],
                    "historial_diagnosticos": [
                        {
                            "diagnostico": d.diagnostico,
                            "probabilidad": d.probabilidad,
                            "gravedad": d.gravedad,
                            "sintomas": json.loads(d.sintomas_json),
                            "created_at": utc_isoformat(d.created_at),
                        }
                        for d in diagnoses
                    ],
                }
            )

        appointments = self.db.query(Appointment).filter(Appointment.user_id == current_user.id).all()

        return {
            "cuenta": {
                "nombre": current_user.nombre,
                "email": current_user.email,
                "creada_el": utc_isoformat(current_user.created_at),
            },
            "mascotas": pets_data,
            "citas": [appointment_out(a) for a in appointments],
            "exportado_el": utc_isoformat(utc_now()),
        }

    def delete_my_account(self, current_user: User) -> dict:
        """Derecho de cancelación: elimina la cuenta y todo lo que depende de
        ella (mascotas, vacunas, historial de diagnósticos, citas, suscripciones
        push). Irreversible — no hay papelera de reciclaje."""
        pet_ids = [p.id for p in self.db.query(Pet).filter(Pet.owner_id == current_user.id).all()]
        if pet_ids:
            self.db.query(Vaccination).filter(Vaccination.pet_id.in_(pet_ids)).delete(synchronize_session=False)
            self.db.query(DiagnosisRecord).filter(DiagnosisRecord.pet_id.in_(pet_ids)).delete(synchronize_session=False)
            self.db.query(Pet).filter(Pet.id.in_(pet_ids)).delete(synchronize_session=False)
        self.db.query(Appointment).filter(Appointment.user_id == current_user.id).delete(synchronize_session=False)
        self.db.query(PushSubscription).filter(PushSubscription.user_id == current_user.id).delete(
            synchronize_session=False
        )
        self.users.delete(current_user)
        self.users.commit()
        return {"ok": True}


def get_auth_service(
    users: UserRepository = Depends(get_user_repository),
    db: Session = Depends(get_db),
) -> AuthService:
    return AuthService(users, db)
