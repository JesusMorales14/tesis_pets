"""Configuración centralizada (core/config.py)."""

from core.config import BASE_DIR, _csv, _database_url


def test_sin_database_url_usa_sqlite_en_backend():
    assert _database_url(None) == f"sqlite:///{BASE_DIR / 'veterinary.db'}"


def test_ruta_sqlite_relativa_se_resuelve_contra_backend():
    # El .env.example antiguo traía "sqlite:///./veterinary.db": debe apuntar
    # siempre a backend/veterinary.db, sin importar desde dónde se lance uvicorn.
    assert _database_url("sqlite:///./veterinary.db") == f"sqlite:///{(BASE_DIR / 'veterinary.db').resolve()}"


def test_otras_urls_no_se_modifican():
    url = "postgresql+psycopg://user:pass@db:5432/cityvet"
    assert _database_url(url) == url
    assert _database_url("sqlite:///:memory:") == "sqlite:///:memory:"


def test_cors_origins_separados_por_coma():
    assert _csv("http://a.pe, https://b.pe ,") == ["http://a.pe", "https://b.pe"]
    assert _csv(None) == []
