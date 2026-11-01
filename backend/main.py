import os
from contextlib import asynccontextmanager
from datetime import datetime

from dotenv import load_dotenv

# Debe cargarse antes de importar auth_utils, que lee SECRET_KEY/ADMIN_CODE
# del entorno al momento de importarse.
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from apscheduler.schedulers.background import BackgroundScheduler

from config import UPLOADS_DIR
from database import engine
from db_migrations import run_sqlite_migrations
from models import Base
from rate_limiter import limiter
from services.reminder_service import send_appointment_reminders, send_vaccine_reminders

from routes import auth, pets, vaccinations, push, slots, appointments, admin, payment_config, predict

# Crear tablas si no existen
Base.metadata.create_all(bind=engine)
run_sqlite_migrations(engine)

scheduler = BackgroundScheduler()


@asynccontextmanager
async def lifespan(_: FastAPI):
    # next_run_time=ahora: se revisan también al arrancar. Sin esto la primera
    # revisión ocurría recién tras el intervalo (6 h en vacunas) y, con
    # reinicios frecuentes (uvicorn --reload), casi nunca llegaba a correr.
    # Los avisos no se duplican: cada cita/vacuna guarda si ya se notificó.
    now = datetime.now()
    scheduler.add_job(send_appointment_reminders, "interval", minutes=30,
                      id="appointment_reminders", next_run_time=now)
    scheduler.add_job(send_vaccine_reminders, "interval", hours=6,
                      id="vaccine_reminders", next_run_time=now)
    scheduler.start()
    yield
    scheduler.shutdown(wait=False)


app = FastAPI(title="API Diagnóstico Veterinario", lifespan=lifespan)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")


# Rate limiting en /auth/*: sin esto, login y register son vulnerables a
# fuerza bruta de contraseñas y a registro masivo de cuentas.
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# En desarrollo, sin CORS_ORIGINS definido, se permite cualquier origen.
# En producción define CORS_ORIGINS en el .env (lista separada por comas).
_cors_origins_env = os.getenv("CORS_ORIGINS")
_cors_origins = [o.strip() for o in _cors_origins_env.split(",")] if _cors_origins_env else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router)
app.include_router(auth.router)
app.include_router(pets.router)
app.include_router(vaccinations.router)
app.include_router(push.router)
app.include_router(slots.router)
app.include_router(appointments.router)
app.include_router(payment_config.router)
app.include_router(admin.router)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "cityvet-api", "version": "1.0.0"}


@app.get("/")
def root():
    return {"message": "API de diagnóstico veterinario funcionando"}


# ─── Silencia 404s de escáneres OpenAI (extensiones IA, proxys, etc.) ─────────
@app.get("/v1/models", include_in_schema=False)
@app.get("/v1/chat/completions", include_in_schema=False)
@app.get("/v1/completions", include_in_schema=False)
@app.get("/v1/embeddings", include_in_schema=False)
async def openai_compat():
    return {
        "error": "Not an OpenAI-compatible API",
        "message": "Esta es la API de CityVet. Ver documentación en /docs",
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
