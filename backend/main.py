from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.orm import Session
from datetime import datetime, date
from typing import Optional

from ml.predict import predict_sickness
from database import get_db, engine
from db_models import Base, User, Appointment, UnavailableSlot
from auth_utils import verify_password, hash_password, create_token, decode_token, ADMIN_CODE

# Crear tablas si no existen
Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Diagnóstico Veterinario")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── HELPERS ────────────────────────────────────────────────────────────────

def generate_all_slots() -> list[str]:
    """Genera horarios de 9:00 a 21:30 cada 30 minutos."""
    slots = []
    for hour in range(9, 22):
        slots.append(f"{hour:02d}:00")
        slots.append(f"{hour:02d}:30")
    return slots  # 9:00 … 21:30 (26 slots, último es 21:30)


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


# ── SCHEMAS ─────────────────────────────────────────────────────────────────

class Sintomas(BaseModel):
    especie: str
    fiebre: int = Field(0, ge=0, le=3)
    espasmos: int = Field(0, ge=0, le=3)
    convulsiones: int = Field(0, ge=0, le=3)
    desorientacion: int = Field(0, ge=0, le=3)
    temblores: int = Field(0, ge=0, le=3)
    tos_seca: int = Field(0, ge=0, le=3)
    jadeo_excesivo: int = Field(0, ge=0, le=3)
    arcadas_frecuentes: int = Field(0, ge=0, le=3)
    dificultad_comer: int = Field(0, ge=0, le=3)
    asfixia_aparente: int = Field(0, ge=0, le=3)
    vomitos: int = Field(0, ge=0, le=3)
    letargo: int = Field(0, ge=0, le=3)
    tos: int = Field(0, ge=0, le=3)
    diarrea: int = Field(0, ge=0, le=3)
    respiracion_rapida: int = Field(0, ge=0, le=3)
    cianosis: int = Field(0, ge=0, le=3)
    nauseas: int = Field(0, ge=0, le=3)
    gases: int = Field(0, ge=0, le=3)
    heces_con_sangre: int = Field(0, ge=0, le=3)
    heces_negras: int = Field(0, ge=0, le=3)
    estreñimiento: int = Field(0, ge=0, le=3)
    encias_palidas: int = Field(0, ge=0, le=3)
    encias_rojas: int = Field(0, ge=0, le=3)
    llenado_capilar_lento: int = Field(0, ge=0, le=3)
    picazon: int = Field(0, ge=0, le=3)
    perdida_pelo: int = Field(0, ge=0, le=3)
    piel_enrojecida: int = Field(0, ge=0, le=3)
    heridas_piel: int = Field(0, ge=0, le=3)
    costras: int = Field(0, ge=0, le=3)
    mal_olor_piel: int = Field(0, ge=0, le=3)
    ojos_llorosos: int = Field(0, ge=0, le=3)
    secrecion_ocular: int = Field(0, ge=0, le=3)
    ojos_rojos: int = Field(0, ge=0, le=3)
    pupilas_dilatadas: int = Field(0, ge=0, le=3)
    dolor_al_moverse: int = Field(0, ge=0, le=3)
    orina_frecuente: int = Field(0, ge=0, le=3)
    dificultad_orinar: int = Field(0, ge=0, le=3)
    sangre_en_orina: int = Field(0, ge=0, le=3)
    orina_oscura: int = Field(0, ge=0, le=3)
    agresividad: int = Field(0, ge=0, le=3)
    ansiedad: int = Field(0, ge=0, le=3)
    aislamiento: int = Field(0, ge=0, le=3)
    confusion: int = Field(0, ge=0, le=3)

    @field_validator("especie")
    def especie_valida(cls, v):
        if v.lower() not in ["perro", "gato"]:
            raise ValueError("La especie debe ser 'perro' o 'gato'")
        return v.lower()


class RegisterBody(BaseModel):
    nombre: str
    email: str
    password: str
    admin_code: str = ""


class LoginBody(BaseModel):
    email: str
    password: str


class AppointmentBody(BaseModel):
    fecha: str
    hora: str
    diagnostico: str
    especie: str
    gravedad: str
    metodo_pago: str


class BlockSlotBody(BaseModel):
    fecha: str
    hora: str


class UpdateEstadoBody(BaseModel):
    estado: str


# ── PREDICT ─────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "API de diagnóstico veterinario funcionando"}


@app.post("/predict")
def predict(data: Sintomas):
    try:
        result = predict_sickness(data.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error inesperado: {str(e)}")
    return result


# ── AUTH ─────────────────────────────────────────────────────────────────────

@app.post("/auth/register")
def register(body: RegisterBody, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email.lower()).first():
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    role = "admin" if body.admin_code == ADMIN_CODE else "user"
    user = User(
        nombre=body.nombre.strip(),
        email=body.email.strip().lower(),
        password_hash=hash_password(body.password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_token(user.id, user.role)
    return {
        "token": token,
        "user": {"id": user.id, "nombre": user.nombre, "email": user.email, "role": user.role},
    }


@app.post("/auth/login")
def login(body: LoginBody, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email.strip().lower()).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")
    token = create_token(user.id, user.role)
    return {
        "token": token,
        "user": {"id": user.id, "nombre": user.nombre, "email": user.email, "role": user.role},
    }


@app.get("/auth/me")
def me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "nombre": current_user.nombre, "email": current_user.email, "role": current_user.role}


# ── SLOTS PÚBLICOS ──────────────────────────────────────────────────────────

@app.get("/slots")
def get_slots(fecha: str, db: Session = Depends(get_db)):
    all_slots = generate_all_slots()

    booked = {
        a.hora for a in db.query(Appointment).filter(
            Appointment.fecha == fecha,
            Appointment.estado != "cancelada",
        ).all()
    }
    blocked = {
        s.hora for s in db.query(UnavailableSlot).filter(UnavailableSlot.fecha == fecha).all()
    }

    today = date.today().isoformat()
    now_time = datetime.now().strftime("%H:%M")

    result = []
    for slot in all_slots:
        if fecha == today and slot <= now_time:
            continue  # pasado
        tipo = "ocupado" if slot in booked else ("bloqueado" if slot in blocked else "libre")
        result.append({"hora": slot, "disponible": tipo == "libre", "tipo": tipo})
    return result


# ── APPOINTMENTS ─────────────────────────────────────────────────────────────

@app.post("/appointments")
def create_appointment(body: AppointmentBody, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verificar que el slot sigue disponible
    occupied = db.query(Appointment).filter(
        Appointment.fecha == body.fecha,
        Appointment.hora == body.hora,
        Appointment.estado != "cancelada",
    ).first()
    if occupied:
        raise HTTPException(status_code=409, detail="El horario ya fue reservado por otro usuario")
    blocked = db.query(UnavailableSlot).filter(
        UnavailableSlot.fecha == body.fecha,
        UnavailableSlot.hora == body.hora,
    ).first()
    if blocked:
        raise HTTPException(status_code=409, detail="El horario está bloqueado por el veterinario")

    appt = Appointment(
        user_id=current_user.id,
        user_nombre=current_user.nombre,
        user_email=current_user.email,
        fecha=body.fecha,
        hora=body.hora,
        diagnostico=body.diagnostico,
        especie=body.especie,
        gravedad=body.gravedad,
        estado="pendiente",
        metodo_pago=body.metodo_pago,
    )
    db.add(appt)
    db.commit()
    db.refresh(appt)
    return {"id": appt.id, "fecha": appt.fecha, "hora": appt.hora, "estado": appt.estado}


@app.get("/appointments/mine")
def my_appointments(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    appts = db.query(Appointment).filter(Appointment.user_id == current_user.id).order_by(Appointment.fecha, Appointment.hora).all()
    return [
        {
            "id": a.id, "fecha": a.fecha, "hora": a.hora,
            "diagnostico": a.diagnostico, "especie": a.especie,
            "gravedad": a.gravedad, "estado": a.estado, "metodo_pago": a.metodo_pago,
        }
        for a in appts
    ]


# ── ADMIN ────────────────────────────────────────────────────────────────────

@app.get("/admin/slots")
def admin_get_slots(fecha: str, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    all_slots = generate_all_slots()
    booked_map = {
        a.hora: {"user_nombre": a.user_nombre, "diagnostico": a.diagnostico}
        for a in db.query(Appointment).filter(
            Appointment.fecha == fecha, Appointment.estado != "cancelada"
        ).all()
    }
    blocked_ids = {
        s.hora: s.id
        for s in db.query(UnavailableSlot).filter(UnavailableSlot.fecha == fecha).all()
    }
    result = []
    for slot in all_slots:
        tipo = "ocupado" if slot in booked_map else ("bloqueado" if slot in blocked_ids else "libre")
        result.append({
            "hora": slot,
            "tipo": tipo,
            "disponible": tipo == "libre",
            "block_id": blocked_ids.get(slot),
            "cita_info": booked_map.get(slot),
        })
    return result


@app.post("/admin/block")
def block_slot(body: BlockSlotBody, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    existing = db.query(UnavailableSlot).filter(
        UnavailableSlot.fecha == body.fecha, UnavailableSlot.hora == body.hora
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="El horario ya está bloqueado")
    slot = UnavailableSlot(fecha=body.fecha, hora=body.hora)
    db.add(slot)
    db.commit()
    return {"ok": True}


@app.delete("/admin/block/{fecha}/{hora}")
def unblock_slot(fecha: str, hora: str, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    slot = db.query(UnavailableSlot).filter(
        UnavailableSlot.fecha == fecha, UnavailableSlot.hora == hora
    ).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Bloqueo no encontrado")
    db.delete(slot)
    db.commit()
    return {"ok": True}


@app.get("/admin/appointments")
def admin_all_appointments(fecha: Optional[str] = None, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    q = db.query(Appointment)
    if fecha:
        q = q.filter(Appointment.fecha == fecha)
    appts = q.order_by(Appointment.fecha, Appointment.hora).all()
    return [
        {
            "id": a.id, "user_nombre": a.user_nombre, "user_email": a.user_email,
            "fecha": a.fecha, "hora": a.hora, "diagnostico": a.diagnostico,
            "especie": a.especie, "gravedad": a.gravedad, "estado": a.estado,
            "metodo_pago": a.metodo_pago,
        }
        for a in appts
    ]


@app.put("/admin/appointments/{appt_id}/estado")
def update_appointment_estado(appt_id: int, body: UpdateEstadoBody, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    appt = db.query(Appointment).filter(Appointment.id == appt_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    if body.estado not in ("pendiente", "confirmada", "cancelada"):
        raise HTTPException(status_code=400, detail="Estado inválido")
    appt.estado = body.estado
    db.commit()
    return {"ok": True, "estado": appt.estado}
