# -*- coding: utf-8 -*-
"""
Prueba el esquema de vacunas de referencia y el registro de vacunas por
mascota (con cálculo de fecha_proxima). Usa una base de datos SQLite en
memoria (no la veterinary.db real).
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


def _register(client, email="ana@test.com", password="secret123", nombre="Ana"):
    r = client.post(
        "/auth/register",
        json={"nombre": nombre, "email": email, "password": password, "accepted_privacy": True},
    )
    return r.json()["token"]


def _create_pet(client, token, nombre="Firulais", especie="perro"):
    r = client.post(
        "/pets",
        json={"nombre": nombre, "especie": especie},
        headers={"Authorization": f"Bearer {token}"},
    )
    return r.json()["id"]


def test_vaccine_schedule_for_dogs_and_cats(client):
    r = client.get("/vaccine-schedule", params={"especie": "perro"})
    assert r.status_code == 200
    names = [v["nombre"] for v in r.json()]
    assert any("Rabia" in n for n in names)

    r = client.get("/vaccine-schedule", params={"especie": "gato"})
    assert r.status_code == 200
    assert len(r.json()) > 0


def test_vaccine_schedule_rejects_invalid_especie(client):
    r = client.get("/vaccine-schedule", params={"especie": "loro"})
    assert r.status_code == 400


def test_create_vaccination_requires_authentication(client):
    r = client.post(
        "/pets/1/vaccinations",
        json={"nombre": "Rabia", "fecha_aplicacion": "2026-01-15"},
    )
    assert r.status_code == 401


def test_create_vaccination_computes_next_due_date(client):
    token = _register(client)
    pet_id = _create_pet(client, token)

    r = client.post(
        f"/pets/{pet_id}/vaccinations",
        json={"nombre": "Rabia", "fecha_aplicacion": "2026-01-15", "refuerzo_meses": 12},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["fecha_proxima"] == "2027-01-15"


def test_create_vaccination_without_refuerzo_has_no_next_date(client):
    token = _register(client)
    pet_id = _create_pet(client, token)

    r = client.post(
        f"/pets/{pet_id}/vaccinations",
        json={"nombre": "Vacuna puntual", "fecha_aplicacion": "2026-01-15"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    assert r.json()["fecha_proxima"] is None


def test_create_vaccination_rejects_bad_date_format(client):
    token = _register(client)
    pet_id = _create_pet(client, token)

    r = client.post(
        f"/pets/{pet_id}/vaccinations",
        json={"nombre": "Rabia", "fecha_aplicacion": "15/01/2026"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 422


def test_list_and_delete_vaccinations(client):
    token = _register(client)
    pet_id = _create_pet(client, token)

    created = client.post(
        f"/pets/{pet_id}/vaccinations",
        json={"nombre": "Rabia", "fecha_aplicacion": "2026-01-15", "refuerzo_meses": 12},
        headers={"Authorization": f"Bearer {token}"},
    ).json()

    listed = client.get(f"/pets/{pet_id}/vaccinations", headers={"Authorization": f"Bearer {token}"})
    assert len(listed.json()) == 1

    deleted = client.delete(
        f"/pets/{pet_id}/vaccinations/{created['id']}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert deleted.status_code == 200

    listed_after = client.get(f"/pets/{pet_id}/vaccinations", headers={"Authorization": f"Bearer {token}"})
    assert listed_after.json() == []


def test_cannot_manage_vaccinations_of_another_users_pet(client):
    token_a = _register(client, email="ana@test.com")
    token_b = _register(client, email="beto@test.com", nombre="Beto")
    pet_id = _create_pet(client, token_a)

    r = client.post(
        f"/pets/{pet_id}/vaccinations",
        json={"nombre": "Rabia", "fecha_aplicacion": "2026-01-15"},
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert r.status_code == 403

    r = client.get(f"/pets/{pet_id}/vaccinations", headers={"Authorization": f"Bearer {token_b}"})
    assert r.status_code == 403
