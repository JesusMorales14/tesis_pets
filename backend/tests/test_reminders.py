# -*- coding: utf-8 -*-
"""
Prueba la lógica de recordatorios de citas (sin la parte de scheduler, que
es de APScheduler y no hace falta reprobar). Usa una base de datos SQLite
en memoria — nunca toca veterinary.db.
"""
import os
import sys
from datetime import date, timedelta

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from main import app  # noqa: E402
from database import get_db  # noqa: E402
from models import Base, Appointment  # noqa: E402
from services.reminder_service import send_reminders_for_db  # noqa: E402

TOMORROW = (date.today() + timedelta(days=1)).isoformat()
TODAY = date.today().isoformat()


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
    return r.json()["user"]["id"], r.json()["token"]


def _book(client, token, fecha, hora="09:00"):
    r = client.post(
        "/appointments",
        json={
            "fecha": fecha, "hora": hora, "diagnostico": "gastroenteritis",
            "especie": "perro", "gravedad": "moderada", "metodo_pago": "yape",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    return r.json()["id"]


def test_reminds_confirmed_appointments_happening_tomorrow(client):
    test_client, TestingSessionLocal = client
    user_id, token = _register(test_client)
    appt_id = _book(test_client, token, TOMORROW)

    db = TestingSessionLocal()
    try:
        appt = db.query(Appointment).filter(Appointment.id == appt_id).first()
        appt.estado = "confirmada"
        db.commit()

        sent = send_reminders_for_db(db)
        assert sent == 1

        db.refresh(appt)
        assert appt.recordatorio_enviado is True
    finally:
        db.close()


def test_does_not_remind_twice(client):
    test_client, TestingSessionLocal = client
    user_id, token = _register(test_client)
    appt_id = _book(test_client, token, TOMORROW)

    db = TestingSessionLocal()
    try:
        appt = db.query(Appointment).filter(Appointment.id == appt_id).first()
        appt.estado = "confirmada"
        db.commit()

        assert send_reminders_for_db(db) == 1
        assert send_reminders_for_db(db) == 0
    finally:
        db.close()


def test_does_not_remind_pending_appointments(client):
    test_client, TestingSessionLocal = client
    _, token = _register(test_client)
    _book(test_client, token, TOMORROW)  # queda 'pendiente' por defecto

    db = TestingSessionLocal()
    try:
        assert send_reminders_for_db(db) == 0
    finally:
        db.close()


def test_does_not_remind_appointments_on_other_days(client):
    test_client, TestingSessionLocal = client
    _, token = _register(test_client)
    appt_id = _book(test_client, token, TODAY)

    db = TestingSessionLocal()
    try:
        appt = db.query(Appointment).filter(Appointment.id == appt_id).first()
        appt.estado = "confirmada"
        db.commit()

        assert send_reminders_for_db(db) == 0
    finally:
        db.close()
