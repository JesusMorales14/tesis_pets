# -*- coding: utf-8 -*-
"""
Prueba el registro de suscripciones push (Web Push / VAPID). No prueba el
envío real (requeriría un endpoint push real de un navegador); prueba que
el backend guarda/borra suscripciones correctamente por usuario.
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
from models import Base, PushSubscription  # noqa: E402


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


def _register(client, email="ana@test.com", password="secret123", nombre="Ana"):
    r = client.post(
        "/auth/register",
        json={"nombre": nombre, "email": email, "password": password, "accepted_privacy": True},
    )
    return r.json()["token"]


def test_get_vapid_public_key_is_public(client):
    test_client, _ = client
    r = test_client.get("/push/vapid-public-key")
    assert r.status_code == 200
    assert len(r.json()["publicKey"]) > 20


def test_subscribe_requires_authentication(client):
    test_client, _ = client
    r = test_client.post("/push/subscribe", json={
        "endpoint": "https://push.example.com/abc", "p256dh": "key1", "auth": "auth1",
    })
    assert r.status_code == 401


def test_subscribe_and_unsubscribe(client):
    test_client, TestingSessionLocal = client
    token = _register(test_client)

    r = test_client.post(
        "/push/subscribe",
        json={"endpoint": "https://push.example.com/abc", "p256dh": "key1", "auth": "auth1"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200

    db = TestingSessionLocal()
    try:
        assert db.query(PushSubscription).count() == 1
    finally:
        db.close()

    r = test_client.post(
        "/push/unsubscribe",
        json={"endpoint": "https://push.example.com/abc"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200

    db = TestingSessionLocal()
    try:
        assert db.query(PushSubscription).count() == 0
    finally:
        db.close()


def test_resubscribing_same_endpoint_updates_instead_of_duplicating(client):
    test_client, TestingSessionLocal = client
    token = _register(test_client)

    for _ in range(2):
        test_client.post(
            "/push/subscribe",
            json={"endpoint": "https://push.example.com/abc", "p256dh": "key1", "auth": "auth1"},
            headers={"Authorization": f"Bearer {token}"},
        )

    db = TestingSessionLocal()
    try:
        assert db.query(PushSubscription).count() == 1
    finally:
        db.close()
