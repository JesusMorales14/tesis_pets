# -*- coding: utf-8 -*-
"""
Prueba la exportación y eliminación de cuenta (derechos ARCO de la Ley
N.° 29733). Usa una base de datos SQLite en memoria.
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
from models import Base, User, Pet, Vaccination, DiagnosisRecord, Appointment  # noqa: E402


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


def _register(client, email="ana@test.com"):
    r = client.post(
        "/auth/register",
        json={"nombre": "Ana", "email": email, "password": "secret123", "accepted_privacy": True},
    )
    return r.json()["token"]


def test_export_requires_authentication(client):
    test_client, _ = client
    r = test_client.get("/auth/me/export")
    assert r.status_code == 401


def test_export_includes_account_pets_and_appointments(client):
    test_client, _ = client
    token = _register(test_client)
    headers = {"Authorization": f"Bearer {token}"}

    pet_id = test_client.post(
        "/pets", json={"nombre": "Rocky", "especie": "perro"}, headers=headers,
    ).json()["id"]
    test_client.post(
        f"/pets/{pet_id}/vaccinations",
        json={"nombre": "Rabia", "fecha_aplicacion": "2026-01-15"},
        headers=headers,
    )
    test_client.post(
        "/appointments",
        json={
            "fecha": "2099-01-15", "hora": "09:00", "diagnostico": "gastroenteritis",
            "especie": "perro", "gravedad": "moderada", "metodo_pago": "yape",
        },
        headers=headers,
    )

    r = test_client.get("/auth/me/export", headers=headers)
    assert r.status_code == 200
    body = r.json()
    assert body["cuenta"]["email"] == "ana@test.com"
    assert len(body["mascotas"]) == 1
    assert body["mascotas"][0]["nombre"] == "Rocky"
    assert len(body["mascotas"][0]["vacunas"]) == 1
    assert len(body["citas"]) == 1


def test_delete_account_requires_authentication(client):
    test_client, _ = client
    r = test_client.delete("/auth/me")
    assert r.status_code == 401


def test_delete_account_removes_everything(client):
    test_client, TestingSessionLocal = client
    token = _register(test_client)
    headers = {"Authorization": f"Bearer {token}"}

    pet_id = test_client.post(
        "/pets", json={"nombre": "Rocky", "especie": "perro"}, headers=headers,
    ).json()["id"]
    test_client.post(
        f"/pets/{pet_id}/vaccinations",
        json={"nombre": "Rabia", "fecha_aplicacion": "2026-01-15"},
        headers=headers,
    )
    test_client.post(
        "/predict",
        json={"especie": "perro", "pet_id": pet_id, "vomitos": 2, "diarrea": 2},
        headers=headers,
    )
    test_client.post(
        "/appointments",
        json={
            "fecha": "2099-01-15", "hora": "09:00", "diagnostico": "gastroenteritis",
            "especie": "perro", "gravedad": "moderada", "metodo_pago": "yape",
        },
        headers=headers,
    )

    r = test_client.delete("/auth/me", headers=headers)
    assert r.status_code == 200

    db = TestingSessionLocal()
    try:
        assert db.query(User).count() == 0
        assert db.query(Pet).filter(Pet.id == pet_id).count() == 0
        assert db.query(Vaccination).filter(Vaccination.pet_id == pet_id).count() == 0
        assert db.query(DiagnosisRecord).filter(DiagnosisRecord.pet_id == pet_id).count() == 0
        assert db.query(Appointment).count() == 0
    finally:
        db.close()

    # El token ya no debe servir para nada tras eliminar la cuenta.
    r2 = test_client.get("/auth/me", headers=headers)
    assert r2.status_code == 401


def test_deleting_one_users_account_does_not_affect_others(client):
    test_client, TestingSessionLocal = client
    token_a = _register(test_client, email="ana@test.com")
    token_b = _register(test_client, email="beto@test.com")
    test_client.post(
        "/pets", json={"nombre": "Rocky", "especie": "perro"},
        headers={"Authorization": f"Bearer {token_a}"},
    )
    test_client.post(
        "/pets", json={"nombre": "Michi", "especie": "gato"},
        headers={"Authorization": f"Bearer {token_b}"},
    )

    test_client.delete("/auth/me", headers={"Authorization": f"Bearer {token_a}"})

    db = TestingSessionLocal()
    try:
        assert db.query(User).count() == 1
        assert db.query(Pet).count() == 1
        assert db.query(Pet).first().nombre == "Michi"
    finally:
        db.close()
