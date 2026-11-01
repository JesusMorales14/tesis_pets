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


ENDPOINT = "https://push.example.com/abc"


def _post(client, url, token, body):
    return client.post(url, json=body, headers={"Authorization": f"Bearer {token}"})


def test_status_belongs_to_the_account_not_to_the_browser(client):
    test_client, _ = client
    ana = _register(test_client, email="ana@test.com")
    beto = _register(test_client, email="beto@test.com")
    sub = {"endpoint": ENDPOINT, "p256dh": "k", "auth": "a"}

    _post(test_client, "/push/subscribe", ana, sub)
    assert _post(test_client, "/push/status", ana, {"endpoint": ENDPOINT}).json() == {"subscribed": True}
    # Mismo navegador, otra cuenta: no recibe las notificaciones de Ana.
    assert _post(test_client, "/push/status", beto, {"endpoint": ENDPOINT}).json() == {"subscribed": False}

    # Si Beto las activa en ese navegador, pasan a ser solo de Beto.
    _post(test_client, "/push/subscribe", beto, sub)
    assert _post(test_client, "/push/status", ana, {"endpoint": ENDPOINT}).json() == {"subscribed": False}
    assert _post(test_client, "/push/status", beto, {"endpoint": ENDPOINT}).json() == {"subscribed": True}

    # Desactivar deja el dispositivo sin suscripción.
    _post(test_client, "/push/unsubscribe", beto, {"endpoint": ENDPOINT})
    assert _post(test_client, "/push/status", beto, {"endpoint": ENDPOINT}).json() == {"subscribed": False}


def test_test_notification_requires_an_active_subscription(client, monkeypatch):
    test_client, _ = client
    token = _register(test_client)
    sent = []
    monkeypatch.setattr("services.push_service.send_push", lambda sub, payload: sent.append(payload) or True)

    assert _post(test_client, "/push/test", token, {"endpoint": ENDPOINT}).status_code == 404
    _post(test_client, "/push/subscribe", token, {"endpoint": ENDPOINT, "p256dh": "k", "auth": "a"})
    assert _post(test_client, "/push/test", token, {"endpoint": ENDPOINT}).status_code == 200
    assert sent and sent[0]["title"] == "Notificaciones activadas"


def test_notification_content_is_readable():
    from types import SimpleNamespace
    import notifications

    appt = SimpleNamespace(id=7, fecha="2026-10-27", hora="10:00", pet_nombre="Firulais", especie="perro")
    n = notifications.pago_aprobado(appt)
    assert n["title"] == "Pago aprobado · Cita confirmada"
    assert "martes 27 de octubre" in n["body"] and "Firulais" in n["body"]
    assert n["tag"] == "cita-7" and n["type"] == "cita" and n["url"] == "/profile"
    assert notifications.pago_rechazado(appt)["urgent"] is True


# ── Envío real (pywebpush) ─────────────────────────────────────────────────

def test_send_push_uses_a_valid_vapid_key(monkeypatch):
    import push_utils
    from py_vapid import Vapid01
    seen = {}
    monkeypatch.setattr(push_utils, "webpush", lambda **kw: seen.update(kw))
    assert push_utils.send_push({"endpoint": "https://x", "keys": {}}, {"title": "t"}) is True
    # Antes se pasaba el PEM como texto y pywebpush lo leía como DER: fallaba siempre.
    assert isinstance(seen["vapid_private_key"], Vapid01)


def test_push_failures_never_break_the_caller(monkeypatch):
    import push_utils
    from pywebpush import WebPushException

    def boom(**kw):
        raise RuntimeError("red caída")
    monkeypatch.setattr(push_utils, "webpush", boom)
    assert push_utils.send_push({"endpoint": "https://x", "keys": {}}, {}) is True

    def rejected(**kw):
        raise WebPushException("clave distinta", response=type("R", (), {"status_code": 403})())
    monkeypatch.setattr(push_utils, "webpush", rejected)
    # 403 (otra clave VAPID): la suscripción ya no sirve y se descarta.
    assert push_utils.send_push({"endpoint": "https://x", "keys": {}}, {}) is False


def test_env_private_key_in_one_line_is_accepted():
    from py_vapid import Vapid
    v = Vapid()
    v.generate_keys()
    one_line = v.private_pem().decode().strip().replace("\n", "\n")
    assert Vapid.from_pem(one_line.replace("\n", "\n").encode()) is not None
