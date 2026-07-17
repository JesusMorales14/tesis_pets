# -*- coding: utf-8 -*-
"""
Registrarse sin aceptar la Política de Privacidad no debe crear la cuenta:
es el consentimiento mínimo exigible antes de guardar datos de salud de
mascotas y contacto del dueño. Usa una base de datos SQLite en memoria.
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
from models import Base, User  # noqa: E402


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
    yield TestClient(app), TestingSessionLocal
    app.dependency_overrides.clear()


def test_register_without_accepting_privacy_policy_is_rejected(client):
    test_client, _ = client
    r = test_client.post(
        "/auth/register",
        json={"nombre": "Ana", "email": "ana@test.com", "password": "secret123"},
    )
    assert r.status_code == 422

    r = test_client.post(
        "/auth/register",
        json={
            "nombre": "Ana", "email": "ana@test.com", "password": "secret123",
            "accepted_privacy": False,
        },
    )
    assert r.status_code == 422


def test_register_with_accepted_privacy_records_timestamp(client):
    test_client, TestingSessionLocal = client
    r = test_client.post(
        "/auth/register",
        json={
            "nombre": "Ana", "email": "ana@test.com", "password": "secret123",
            "accepted_privacy": True,
        },
    )
    assert r.status_code == 200

    db = TestingSessionLocal()
    try:
        user = db.query(User).filter(User.email == "ana@test.com").first()
        assert user.accepted_privacy_at is not None
    finally:
        db.close()
