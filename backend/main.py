"""Punto de entrada de la API de CityVet (FastAPI).

Arquitectura por capas (dependencias solo hacia adentro):

    routes/          presentación: HTTP, validación de entrada, dependencias de auth
    services/        aplicación: casos de uso y reglas de negocio
    repositories/    acceso a datos (SQLAlchemy)
    models/          entidades persistidas
    domain/          valores y reglas puras del negocio (enums, calendario de vacunas)
    infrastructure/  detalles externos: Web Push, migraciones de SQLite
    core/            transversal: configuración, base de datos, seguridad, errores
"""

from contextlib import asynccontextmanager
from datetime import datetime

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from core.config import UPLOADS_DIR, settings
from core.database import engine
from core.exceptions import register_exception_handlers
from core.logging import configure_logging
from core.rate_limiter import limiter
from infrastructure.db.sqlite_migrations import run_sqlite_migrations
from models import Base
from routes import admin, appointments, auth, payment_config, pets, predict, push, slots, vaccinations
from services.reminder_service import send_appointment_reminders, send_vaccine_reminders

API_VERSION = "1.0.0"

configure_logging()

# Crear tablas si no existen y ajustar bases SQLite antiguas.
Base.metadata.create_all(bind=engine)
run_sqlite_migrations(engine)


def _start_scheduler() -> BackgroundScheduler:
    # next_run_time=ahora: se revisan también al arrancar. Sin esto la primera
    # revisión ocurría recién tras el intervalo (6 h en vacunas) y, con
    # reinicios frecuentes (uvicorn --reload), casi nunca llegaba a correr.
    # Los avisos no se duplican: cada cita/vacuna guarda si ya se notificó.
    scheduler = BackgroundScheduler()
    now = datetime.now()
    scheduler.add_job(
        send_appointment_reminders,
        "interval",
        minutes=settings.appointment_reminder_minutes,
        id="appointment_reminders",
        next_run_time=now,
    )
    scheduler.add_job(
        send_vaccine_reminders,
        "interval",
        hours=settings.vaccine_reminder_hours,
        id="vaccine_reminders",
        next_run_time=now,
    )
    scheduler.start()
    return scheduler


@asynccontextmanager
async def lifespan(_: FastAPI):
    scheduler = _start_scheduler()
    yield
    scheduler.shutdown(wait=False)


def create_app() -> FastAPI:
    application = FastAPI(
        title="API Diagnóstico Veterinario — CityVet",
        version=API_VERSION,
        lifespan=lifespan,
        # La documentación interactiva no se expone en producción.
        docs_url=None if settings.is_production else "/docs",
        redoc_url=None if settings.is_production else "/redoc",
    )
    application.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

    # Rate limiting en /auth/*: protege login y registro de fuerza bruta.
    application.state.limiter = limiter
    application.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    register_exception_handlers(application)

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        # Con "*" el navegador rechaza credenciales; la app usa Bearer, no cookies.
        allow_credentials=settings.cors_origins != ["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    for router in (predict, auth, pets, vaccinations, push, slots, appointments, payment_config, admin):
        application.include_router(router.router)

    @application.get("/health", tags=["infra"])
    def health_check() -> dict:
        """Sonda de vida para el orquestador / balanceador."""
        return {"status": "ok", "service": "cityvet-api", "version": API_VERSION}

    @application.get("/", include_in_schema=False)
    def root() -> dict:
        return {"message": "API de diagnóstico veterinario funcionando"}

    return application


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=not settings.is_production)
