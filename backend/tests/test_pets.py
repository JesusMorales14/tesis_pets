# -*- coding: utf-8 -*-
"""
Prueba el CRUD de mascotas y el guardado de historial de diagnósticos.
Usa una base de datos SQLite en memoria (no la veterinary.db real).
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
    return client.post(
        "/pets",
        json={"nombre": nombre, "especie": especie, "raza": "Mestizo", "edad_meses": 24, "peso_kg": 12.5},
        headers={"Authorization": f"Bearer {token}"},
    )


def test_create_pet_requires_authentication(client):
    r = client.post("/pets", json={"nombre": "Firulais", "especie": "perro"})
    assert r.status_code == 401


def test_create_and_list_pets(client):
    token = _register(client)
    created = _create_pet(client, token)
    assert created.status_code == 200
    body = created.json()
    assert body["nombre"] == "Firulais"
    assert body["especie"] == "perro"
    assert body["peso_kg"] == 12.5

    listed = client.get("/pets", headers={"Authorization": f"Bearer {token}"})
    assert listed.status_code == 200
    assert len(listed.json()) == 1


def test_create_pet_rejects_invalid_especie(client):
    token = _register(client)
    r = client.post(
        "/pets",
        json={"nombre": "Piolín", "especie": "loro"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 422


def test_pets_are_scoped_per_owner(client):
    token_a = _register(client, email="ana@test.com")
    token_b = _register(client, email="beto@test.com", nombre="Beto")
    _create_pet(client, token_a)

    listed_b = client.get("/pets", headers={"Authorization": f"Bearer {token_b}"})
    assert listed_b.json() == []


def test_update_and_delete_pet(client):
    token = _register(client)
    pet_id = _create_pet(client, token).json()["id"]

    updated = client.put(
        f"/pets/{pet_id}",
        json={"nombre": "Firu", "especie": "perro", "peso_kg": 13.0},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert updated.status_code == 200
    assert updated.json()["nombre"] == "Firu"
    assert updated.json()["raza"] is None  # no se envió, debe limpiarse

    deleted = client.delete(f"/pets/{pet_id}", headers={"Authorization": f"Bearer {token}"})
    assert deleted.status_code == 200

    listed = client.get("/pets", headers={"Authorization": f"Bearer {token}"})
    assert listed.json() == []


def test_cannot_modify_another_users_pet(client):
    token_a = _register(client, email="ana@test.com")
    token_b = _register(client, email="beto@test.com", nombre="Beto")
    pet_id = _create_pet(client, token_a).json()["id"]

    r = client.put(
        f"/pets/{pet_id}",
        json={"nombre": "Hackeado", "especie": "perro"},
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert r.status_code == 403

    r = client.delete(f"/pets/{pet_id}", headers={"Authorization": f"Bearer {token_b}"})
    assert r.status_code == 403


def _sintomas_payload(especie="perro", pet_id=None):
    payload = {"especie": especie, "vomitos": 3, "diarrea": 2, "letargo": 2, "fiebre": 2}
    if pet_id is not None:
        payload["pet_id"] = pet_id
    return payload


def test_predict_without_pet_id_does_not_require_auth_or_save_history(client):
    r = client.post("/predict", json=_sintomas_payload())
    assert r.status_code == 200
    assert "guardado_en_historial" not in r.json()


def test_predict_with_pet_id_requires_authentication(client):
    token = _register(client)
    pet_id = _create_pet(client, token).json()["id"]

    r = client.post("/predict", json=_sintomas_payload(pet_id=pet_id))
    assert r.status_code == 401


def test_predict_with_pet_id_rejects_other_owners_pet(client):
    token_a = _register(client, email="ana@test.com")
    token_b = _register(client, email="beto@test.com", nombre="Beto")
    pet_id = _create_pet(client, token_a).json()["id"]

    r = client.post(
        "/predict",
        json=_sintomas_payload(pet_id=pet_id),
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert r.status_code == 403


def test_predict_with_pet_id_saves_and_lists_history(client):
    token = _register(client)
    pet_id = _create_pet(client, token).json()["id"]

    r = client.post(
        "/predict",
        json=_sintomas_payload(pet_id=pet_id),
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["guardado_en_historial"] is True
    assert body["mascota"] == "Firulais"

    history = client.get(f"/pets/{pet_id}/diagnoses", headers={"Authorization": f"Bearer {token}"})
    assert history.status_code == 200
    entries = history.json()
    assert len(entries) == 1
    assert entries[0]["diagnostico"] == body["diagnostico"]
    assert entries[0]["sintomas"]["vomitos"] == 3


def test_pet_history_is_scoped_per_owner(client):
    token_a = _register(client, email="ana@test.com")
    token_b = _register(client, email="beto@test.com", nombre="Beto")
    pet_id = _create_pet(client, token_a).json()["id"]

    client.post(
        "/predict",
        json=_sintomas_payload(pet_id=pet_id),
        headers={"Authorization": f"Bearer {token_a}"},
    )

    r = client.get(f"/pets/{pet_id}/diagnoses", headers={"Authorization": f"Bearer {token_b}"})
    assert r.status_code == 403
