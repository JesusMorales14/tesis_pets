# -*- coding: utf-8 -*-
"""
Prueba el flujo de pagos: configuración de Yape/transferencia editable por
el admin, subida de comprobante, y aprobación/rechazo por el admin. Usa una
base de datos SQLite en memoria (no la veterinary.db real).
"""
import io
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
from auth_utils import ADMIN_CODE  # noqa: E402


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


def _register(client, email="ana@test.com", password="secret123", nombre="Ana", admin=False):
    body = {"nombre": nombre, "email": email, "password": password, "accepted_privacy": True}
    if admin:
        body["admin_code"] = ADMIN_CODE
    r = client.post("/auth/register", json=body)
    return r.json()["token"]


def _book_appointment(client, token, metodo_pago="yape", hora="09:00"):
    r = client.post(
        "/appointments",
        json={
            "fecha": "2099-01-15", "hora": hora, "diagnostico": "gastroenteritis",
            "especie": "perro", "gravedad": "moderada", "metodo_pago": metodo_pago,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    return r


def _fake_image():
    return ("comprobante.png", io.BytesIO(b"\x89PNG\r\n\x1a\n" + b"0" * 50), "image/png")


def test_appointment_rejects_invalid_metodo_pago(client):
    token = _register(client)
    r = _book_appointment(client, token, metodo_pago="tarjeta")
    assert r.status_code == 422


def test_appointment_created_immediately_pending_payment(client):
    token = _register(client)
    r = _book_appointment(client, token)
    assert r.status_code == 200
    body = r.json()
    assert body["estado"] == "pendiente"
    assert body["pago_estado"] == "pendiente"
    assert body["comprobante_url"] is None


def test_payment_config_defaults_are_public_and_empty(client):
    r = client.get("/payment-config")
    assert r.status_code == 200
    assert r.json()["yape_phone"] is None


def test_only_admin_can_update_payment_config(client):
    token = _register(client)
    r = client.put(
        "/admin/payment-config",
        json={"yape_phone": "987654321"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 403


def test_admin_updates_payment_config(client):
    admin_token = _register(client, email="vet@test.com", nombre="Vet", admin=True)
    r = client.put(
        "/admin/payment-config",
        json={
            "yape_phone": "987654321", "banco": "BCP", "tipo_cuenta": "Ahorros",
            "numero_cuenta": "1234567890", "cci": "00212300123456789015", "titular": "CityVet SAC",
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["yape_phone"] == "987654321"
    assert body["banco"] == "BCP"

    public = client.get("/payment-config").json()
    assert public["numero_cuenta"] == "1234567890"


def test_admin_uploads_yape_qr(client):
    admin_token = _register(client, email="vet@test.com", nombre="Vet", admin=True)
    r = client.post(
        "/admin/payment-config/qr",
        files={"file": _fake_image()},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 200
    assert r.json()["yape_qr_url"].startswith("/uploads/payment-config/")


def test_user_uploads_comprobante_for_own_appointment(client):
    token = _register(client)
    appt_id = _book_appointment(client, token).json()["id"]

    r = client.post(
        f"/appointments/{appt_id}/comprobante",
        files={"file": _fake_image()},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["comprobante_url"].startswith("/uploads/comprobantes/")
    assert body["pago_estado"] == "pendiente"


def test_cannot_upload_comprobante_for_others_appointment(client):
    token_a = _register(client, email="ana@test.com")
    token_b = _register(client, email="beto@test.com", nombre="Beto")
    appt_id = _book_appointment(client, token_a).json()["id"]

    r = client.post(
        f"/appointments/{appt_id}/comprobante",
        files={"file": _fake_image()},
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert r.status_code == 403


def test_pending_payments_only_lists_appointments_with_comprobante(client):
    admin_token = _register(client, email="vet@test.com", nombre="Vet", admin=True)
    user_token = _register(client, email="ana@test.com")

    _book_appointment(client, user_token, hora="09:00")  # sin comprobante
    appt2 = _book_appointment(client, user_token, hora="10:00").json()
    client.post(
        f"/appointments/{appt2['id']}/comprobante",
        files={"file": _fake_image()},
        headers={"Authorization": f"Bearer {user_token}"},
    )

    r = client.get("/admin/appointments/pending-payments", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    pending = r.json()
    assert len(pending) == 1
    assert pending[0]["id"] == appt2["id"]


def test_cannot_decide_payment_without_comprobante(client):
    admin_token = _register(client, email="vet@test.com", nombre="Vet", admin=True)
    user_token = _register(client, email="ana@test.com")
    appt_id = _book_appointment(client, user_token).json()["id"]

    r = client.put(
        f"/admin/appointments/{appt_id}/pago",
        json={"aprobado": True},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 400


def test_approving_payment_confirms_the_appointment(client):
    admin_token = _register(client, email="vet@test.com", nombre="Vet", admin=True)
    user_token = _register(client, email="ana@test.com")
    appt_id = _book_appointment(client, user_token).json()["id"]
    client.post(
        f"/appointments/{appt_id}/comprobante",
        files={"file": _fake_image()},
        headers={"Authorization": f"Bearer {user_token}"},
    )

    r = client.put(
        f"/admin/appointments/{appt_id}/pago",
        json={"aprobado": True},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["pago_estado"] == "aprobado"
    assert body["estado"] == "confirmada"


def test_rejecting_payment_does_not_confirm_the_appointment(client):
    admin_token = _register(client, email="vet@test.com", nombre="Vet", admin=True)
    user_token = _register(client, email="ana@test.com")
    appt_id = _book_appointment(client, user_token).json()["id"]
    client.post(
        f"/appointments/{appt_id}/comprobante",
        files={"file": _fake_image()},
        headers={"Authorization": f"Bearer {user_token}"},
    )

    r = client.put(
        f"/admin/appointments/{appt_id}/pago",
        json={"aprobado": False},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["pago_estado"] == "rechazado"
    assert body["estado"] == "pendiente"
