# -*- coding: utf-8 -*-
"""
Cada acción del sistema que debe avisar por push, de punta a punta: se
recorren los flujos reales por la API y se verifica QUÉ notificación llega
y a QUIÉN (dueño o veterinarios). El envío real (pywebpush) se reemplaza
por un registro en memoria; usa una base SQLite en memoria.
"""
import io
import os
import sys
from datetime import date, datetime, timedelta

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

import push_utils  # noqa: E402
from main import app  # noqa: E402
from database import get_db  # noqa: E402
from models import Base, Appointment  # noqa: E402
from services.reminder_service import send_reminders_for_db, send_vaccine_reminders_for_db  # noqa: E402

TOMORROW = (date.today() + timedelta(days=1)).isoformat()
_REAL_SEND_PUSH = push_utils.send_push  # antes de que el fixture lo reemplace


@pytest.fixture()
def ctx(monkeypatch):
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = Session()
        try:
            yield db
        finally:
            db.close()

    # Bandeja: (endpoint destino, payload) de cada notificación enviada.
    inbox = []
    monkeypatch.setattr(push_utils, "send_push", lambda sub, payload: inbox.append((sub["endpoint"], payload)) or True)

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app), Session, inbox
    app.dependency_overrides.clear()


def _user(client, email, admin=False, device=None):
    """Registra un usuario y, si se indica, activa las notificaciones en un dispositivo."""
    from auth_utils import ADMIN_CODE
    body = {"nombre": email.split("@")[0].title(), "email": email, "password": "secret123", "accepted_privacy": True}
    if admin:
        body["admin_code"] = ADMIN_CODE
    h = {"Authorization": f"Bearer {client.post('/auth/register', json=body).json()['token']}"}
    if device:
        client.post("/push/subscribe", json={"endpoint": device, "p256dh": "k", "auth": "a"}, headers=h)
    return h


def _book(client, h, hora, pet_id=None, fecha=TOMORROW):
    data = {"fecha": fecha, "hora": hora, "diagnostico": "parvovirus", "especie": "perro",
            "gravedad": "grave", "metodo_pago": "yape"}
    if pet_id:
        data["pet_id"] = str(pet_id)
    r = client.post("/appointments/with-comprobante", data=data,
                    files={"file": ("c.png", io.BytesIO(b"\x89PNG\r\n\x1a\nx"), "image/png")}, headers=h)
    assert r.status_code == 200, r.text
    return r.json()["id"]


def _titles(inbox, device):
    return [p["title"] for d, p in inbox if d == device]


def test_every_trigger_notifies_the_right_person(ctx):
    client, Session, inbox = ctx
    vet = _user(client, "vet@test.com", admin=True, device="https://push/vet")
    ana = _user(client, "ana@test.com", device="https://push/ana")
    pet = client.post("/pets", json={"nombre": "Firulais", "especie": "perro"}, headers=ana).json()["id"]

    # 1) Dueño envía comprobante → aviso a los veterinarios (no al dueño).
    a1 = _book(client, ana, "10:00", pet)
    assert _titles(inbox, "https://push/vet") == ["Nuevo comprobante por revisar"]
    assert _titles(inbox, "https://push/ana") == []
    assert "Firulais" in inbox[-1][1]["body"]

    # 2) Veterinario aprueba el pago → aviso al dueño.
    client.put(f"/admin/appointments/{a1}/pago", json={"aprobado": True}, headers=vet)
    assert _titles(inbox, "https://push/ana")[-1] == "Pago aprobado · Cita confirmada"

    # 3) Veterinario rechaza otro pago → aviso urgente al dueño.
    a2 = _book(client, ana, "11:00")
    client.put(f"/admin/appointments/{a2}/pago", json={"aprobado": False}, headers=vet)
    last = [p for d, p in inbox if d == "https://push/ana"][-1]
    assert last["title"] == "No pudimos validar tu pago" and last["urgent"] is True

    # 4) Veterinario confirma / cancela una cita desde la agenda → aviso al dueño.
    a3 = client.post("/appointments", headers=ana, json={
        "fecha": TOMORROW, "hora": "12:00", "diagnostico": "otitis_canina", "especie": "perro",
        "gravedad": "leve", "metodo_pago": "transferencia"}).json()["id"]
    client.put(f"/admin/appointments/{a3}/estado", json={"estado": "confirmada"}, headers=vet)
    assert _titles(inbox, "https://push/ana")[-1] == "Cita confirmada"
    client.put(f"/admin/appointments/{a3}/estado", json={"estado": "cancelada"}, headers=vet)
    assert _titles(inbox, "https://push/ana")[-1] == "Cita cancelada"

    # 5) Recordatorio 24 h antes de la cita confirmada (a1, mañana 10:00), una sola vez.
    db = Session()
    try:
        appt_at = datetime.fromisoformat(f"{TOMORROW}T10:00")
        assert send_reminders_for_db(db, now=appt_at - timedelta(hours=23)) == 1
        assert send_reminders_for_db(db, now=appt_at - timedelta(hours=22)) == 0
    finally:
        db.close()
    assert _titles(inbox, "https://push/ana")[-1] == "Tu cita es mañana a las 10:00"

    # 6) Vacunas: programada próxima y programada vencida → avisos al dueño.
    hoy = date.today()
    client.post(f"/pets/{pet}/vaccinations", headers=ana, json={
        "nombre": "Rabia", "estado": "programada", "fecha_programada": (hoy + timedelta(days=5)).isoformat(), "refuerzo_meses": 12})
    client.post(f"/pets/{pet}/vaccinations", headers=ana, json={
        "nombre": "Múltiple", "estado": "programada", "fecha_programada": hoy.isoformat(), "refuerzo_meses": 12})
    db = Session()
    try:
        assert send_vaccine_reminders_for_db(db) == 2
        assert send_vaccine_reminders_for_db(db) == 0  # no se repiten
    finally:
        db.close()
    titles = _titles(inbox, "https://push/ana")
    assert "Vacuna próxima: Rabia" in titles and "Vacuna pendiente: Múltiple" in titles

    # El veterinario solo recibió avisos de comprobantes.
    assert set(_titles(inbox, "https://push/vet")) == {"Nuevo comprobante por revisar"}


def test_users_without_notifications_enabled_receive_nothing(ctx):
    client, _, inbox = ctx
    vet = _user(client, "vet@test.com", admin=True)  # sin dispositivo suscrito
    ana = _user(client, "ana@test.com")
    a1 = _book(client, ana, "10:00")
    client.put(f"/admin/appointments/{a1}/pago", json={"aprobado": True}, headers=vet)
    assert inbox == []


def test_logged_out_device_stops_receiving(ctx):
    client, _, inbox = ctx
    vet = _user(client, "vet@test.com", admin=True)
    ana = _user(client, "ana@test.com", device="https://push/compartido")
    # Al cerrar sesión, el frontend desvincula el dispositivo de la cuenta.
    client.post("/push/unsubscribe", json={"endpoint": "https://push/compartido"}, headers=ana)
    a1 = _book(client, ana, "10:00")
    client.put(f"/admin/appointments/{a1}/pago", json={"aprobado": True}, headers=vet)
    assert inbox == []


def test_a_failing_push_does_not_break_the_booking(ctx, monkeypatch):
    client, _, _ = ctx
    _user(client, "vet@test.com", admin=True, device="https://push/vet")
    ana = _user(client, "ana@test.com")

    def boom(**kw):
        raise RuntimeError("servicio push caído")
    # Envío real con pywebpush fallando: la reserva igual debe guardarse (200).
    monkeypatch.setattr(push_utils, "send_push", _REAL_SEND_PUSH)
    monkeypatch.setattr(push_utils, "webpush", boom)
    _book(client, ana, "15:00")
