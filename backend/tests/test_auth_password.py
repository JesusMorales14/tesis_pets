# -*- coding: utf-8 -*-
"""
Prueba el flujo de cambio de contraseña de punto a punto. Usa una base
de datos SQLite en memoria (no la veterinary.db real) para no ensuciar
datos reales con usuarios de prueba.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from main import app  # noqa: E402
from database import get_db  # noqa: E402
from models import Base  # noqa: E402


@pytest.fixture()
def client():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


def _register(client, email="ana@test.com", password="secret123"):
    return client.post(
        "/auth/register",
        json={"nombre": "Ana", "email": email, "password": password, "accepted_privacy": True},
    )


def test_change_password_with_correct_current_password(client):
    reg = _register(client)
    token = reg.json()["token"]

    response = client.put(
        "/auth/change-password",
        json={"current_password": "secret123", "new_password": "newpass456"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200

    # La contraseña vieja ya no debe funcionar; la nueva sí.
    old_login = client.post("/auth/login", json={"email": "ana@test.com", "password": "secret123"})
    assert old_login.status_code == 401

    new_login = client.post("/auth/login", json={"email": "ana@test.com", "password": "newpass456"})
    assert new_login.status_code == 200


def test_change_password_rejects_wrong_current_password(client):
    reg = _register(client)
    token = reg.json()["token"]

    response = client.put(
        "/auth/change-password",
        json={"current_password": "not-the-real-password", "new_password": "newpass456"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 401


def test_change_password_requires_authentication(client):
    response = client.put(
        "/auth/change-password",
        json={"current_password": "secret123", "new_password": "newpass456"},
    )
    assert response.status_code == 401
