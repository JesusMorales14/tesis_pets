import json
from datetime import datetime
from typing import Optional

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User, Pet, Vaccination, DiagnosisRecord, Appointment, PushSubscription
from auth_utils import verify_password, hash_password, create_token, decode_token, ADMIN_CODE
from repositories.user_repository import UserRepository, get_user_repository
from schemas.auth import RegisterBody, LoginBody, ChangePasswordBody


def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No autenticado")
    payload = decode_token(authorization.split(" ")[1])
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    user = db.query(User).filter(User.id == payload.get("user_id")).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado: se requiere rol administrador")
    return current_user


def get_current_user_optional(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> Optional[User]:
    """Igual que get_current_user pero sin lanzar 401: /predict debe seguir
    funcionando sin sesión iniciada (consulta rápida sin guardar historial)."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    payload = decode_token(authorization.split(" ")[1])
    if not payload:
        return None
    return db.query(User).filter(User.id == payload.get("user_id")).first()


def user_out(user: User) -> dict:
    return {"id": user.id, "nombre": user.nombre, "email": user.email, "role": user.role}


class AuthService:
    def __init__(self, users: UserRepository, db: Session):
        self.users = users
        self.db = db

    def register(self, body: RegisterBody) -> dict:
        if self.users.get_by_email(body.email.lower()):
            raise HTTPException(status_code=400, detail="El correo ya está registrado")
        role = "admin" if body.admin_code == ADMIN_CODE else "user"
        user = User(
            nombre=body.nombre.strip(),
            email=body.email.strip().lower(),
            password_hash=hash_password(body.password),
            role=role,
            accepted_privacy_at=datetime.utcnow(),
        )
        user = self.users.create(user)
        token = create_token(user.id, user.role)
        return {"token": token, "user": user_out(user)}

    def login(self, body: LoginBody) -> dict:
        user = self.users.get_by_email(body.email.strip().lower())
        if not user or not verify_password(body.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")
        token = create_token(user.id, user.role)
        return {"token": token, "user": user_out(user)}

    def change_password(self, current_user: User, body: ChangePasswordBody) -> dict:
        if not verify_password(body.current_password, current_user.password_hash):
            raise HTTPException(status_code=401, detail="La contraseña actual es incorrecta")
        current_user.password_hash = hash_password(body.new_password)
        self.users.commit()
        return {"message": "Contraseña actualizada correctamente"}

    def export_my_data(self, current_user: User) -> dict:
        """Derecho de acceso (Ley N.° 29733): descarga de todos los datos que
        tenemos sobre el usuario y sus mascotas, en un solo JSON."""
        from services.pet_service import pet_out
        from services.vaccination_service import vaccination_out
        from services.appointment_service import appointment_out

        pets = self.db.query(Pet).filter(Pet.owner_id == current_user.id).all()
        pets_data = []
        for pet in pets:
            vaccinations = self.db.query(Vaccination).filter(Vaccination.pet_id == pet.id).all()
            diagnoses = self.db.query(DiagnosisRecord).filter(DiagnosisRecord.pet_id == pet.id).all()
            pets_data.append({
                **pet_out(pet),
                "vacunas": [vaccination_out(v) for v in vaccinations],
                "historial_diagnosticos": [
                    {
                        "diagnostico": d.diagnostico, "probabilidad": d.probabilidad,
                        "gravedad": d.gravedad, "sintomas": json.loads(d.sintomas_json),
                        "created_at": d.created_at.isoformat(),
                    }
                    for d in diagnoses
                ],
            })

        appointments = self.db.query(Appointment).filter(Appointment.user_id == current_user.id).all()

        return {
            "cuenta": {
                "nombre": current_user.nombre, "email": current_user.email,
                "creada_el": current_user.created_at.isoformat() if current_user.created_at else None,
            },
            "mascotas": pets_data,
            "citas": [appointment_out(a) for a in appointments],
            "exportado_el": datetime.utcnow().isoformat(),
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
        self.db.query(PushSubscription).filter(PushSubscription.user_id == current_user.id).delete(synchronize_session=False)
        self.users.delete(current_user)
        self.users.commit()
        return {"ok": True}


def get_auth_service(
    users: UserRepository = Depends(get_user_repository),
    db: Session = Depends(get_db),
) -> AuthService:
    return AuthService(users, db)
