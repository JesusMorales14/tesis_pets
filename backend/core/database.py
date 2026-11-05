"""Conexión a la base de datos (SQLAlchemy) y sesión por petición."""

from collections.abc import Iterator

from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from core.config import settings

engine = create_engine(
    settings.database_url,
    # SQLite: FastAPI atiende peticiones en varios hilos con la misma conexión.
    connect_args={"check_same_thread": False} if settings.is_sqlite else {},
    pool_pre_ping=not settings.is_sqlite,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


@event.listens_for(Engine, "connect")
def _enable_sqlite_foreign_keys(dbapi_connection, _):
    """SQLite ignora las FOREIGN KEY (y por lo tanto ON DELETE CASCADE) salvo
    que se active este pragma en cada conexión. Sin esto, borrar una mascota
    dejaba sus vacunas huérfanas en la tabla."""
    if dbapi_connection.__class__.__module__.startswith("sqlite3"):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


def get_db() -> Iterator[Session]:
    """Dependencia de FastAPI: una sesión por petición, cerrada al terminar."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
