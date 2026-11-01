# -*- coding: utf-8 -*-
"""
Flujo completo usuario → veterinario: mascota, predicción, cita con
comprobante, decisión del pago y recordatorios de vacunas. Usa una base de
datos SQLite en memoria — nunca toca veterinary.db.
"""
import io
import json
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
from models import Base, Vaccination  # noqa: E402
from services.reminder_service import send_vaccine_reminders_for_db  # noqa: E402

FUTURE = (date.today() + timedelta(days=5)).isoformat()


@pytest.fixture()
def ctx():
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


def _register(client, email="ana@test.com", admin=False):
    from auth_utils import ADMIN_CODE

    body = {"nombre": "Ana", "email": email, "password": "secret123", "accepted_privacy": True}
    if admin:
        body["admin_code"] = ADMIN_CODE
    r = client.post("/auth/register", json=body)
    return {"Authorization": f"Bearer {r.json()['token']}"}


def _create_pet(client, headers, nombre="Firulais", especie="perro"):
    r = client.post("/pets", json={"nombre": nombre, "especie": especie}, headers=headers)
    assert r.status_code == 200, r.text
    return r.json()["id"]


def _predict(client, headers, pet_id=None, especie="perro"):
    body = {"especie": especie, "vomitos": 3, "diarrea": 3, "letargo": 2, "heces_con_sangre": 2}
    if pet_id is not None:
        body["pet_id"] = pet_id
    return client.post("/predict", json=body, headers=headers)


def _fake_image():
    return ("comprobante.png", io.BytesIO(b"\x89PNG\r\n\x1a\nfake"), "image/png")


def _book_with_comprobante(client, headers, hora="10:00", fecha=FUTURE, **extra):
    data = {
        "fecha": fecha, "hora": hora, "diagnostico": "parvovirus", "especie": "perro",
        "gravedad": "grave", "metodo_pago": "yape", **{k: str(v) for k, v in extra.items()},
    }
    return client.post(
        "/appointments/with-comprobante", data=data, files={"file": _fake_image()}, headers=headers,
    )


# ── Mascotas eliminadas no "contagian" su historial a mascotas nuevas ──────

def test_deleted_pet_history_does_not_leak_into_new_pet(ctx):
    client, _ = ctx
    headers = _register(client)
    old_id = _create_pet(client, headers, "Viejo")
    client.post(
        f"/pets/{old_id}/vaccinations",
        json={"nombre": "Rabia", "fecha_aplicacion": "2026-01-15", "refuerzo_meses": 12},
        headers=headers,
    )
    assert _predict(client, headers, pet_id=old_id).status_code == 200

    assert client.delete(f"/pets/{old_id}", headers=headers).status_code == 200
    new_id = _create_pet(client, headers, "Nuevo")

    assert new_id != old_id  # SQLite ya no reutiliza el id borrado
    assert [p["nombre"] for p in client.get("/pets", headers=headers).json()] == ["Nuevo"]
    assert client.get(f"/pets/{new_id}/vaccinations", headers=headers).json() == []
    assert client.get(f"/pets/{new_id}/diagnoses", headers=headers).json() == []


def test_deleting_pet_keeps_paid_appointment_but_unlinks_it(ctx):
    client, _ = ctx
    headers = _register(client)
    pet_id = _create_pet(client, headers)
    appt = _book_with_comprobante(client, headers, pet_id=pet_id).json()
    assert appt["pet_id"] == pet_id

    client.delete(f"/pets/{pet_id}", headers=headers)

    mine = client.get("/appointments/mine", headers=headers).json()
    assert len(mine) == 1 and mine[0]["pet_id"] is None


# ── Predicción ─────────────────────────────────────────────────────────────

def test_predict_with_pet_saves_history(ctx):
    client, _ = ctx
    headers = _register(client)
    pet_id = _create_pet(client, headers)
    r = _predict(client, headers, pet_id=pet_id)
    assert r.status_code == 200
    assert r.json()["pet_id"] == pet_id
    history = client.get(f"/pets/{pet_id}/diagnoses", headers=headers).json()
    assert len(history) == 1
    # Marcada como UTC: sin zona, el navegador la leería como hora local.
    assert history[0]["created_at"].endswith("+00:00")


def test_predict_rejects_species_mismatch_with_pet(ctx):
    client, _ = ctx
    headers = _register(client)
    cat_id = _create_pet(client, headers, "Michi", "gato")
    assert _predict(client, headers, pet_id=cat_id, especie="perro").status_code == 400


# ── Cita con comprobante ──────────────────────────────────────────────────

def test_appointment_with_comprobante_keeps_prediction_data(ctx):
    client, _ = ctx
    headers = _register(client)
    pet_id = _create_pet(client, headers)
    sintomas = json.dumps({"vomitos": 3, "diarrea": 3})
    r = _book_with_comprobante(client, headers, pet_id=pet_id, probabilidad=0.82, sintomas_json=sintomas)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["pet_id"] == pet_id
    assert body["probabilidad"] == pytest.approx(0.82)
    assert body["pago_estado"] == "pendiente" and body["estado"] == "pendiente"
    assert body["comprobante_url"].startswith("/uploads/comprobantes/")


def test_cannot_book_with_someone_elses_pet(ctx):
    client, _ = ctx
    owner = _register(client, "owner@test.com")
    other = _register(client, "other@test.com")
    pet_id = _create_pet(client, owner)
    assert _book_with_comprobante(client, other, pet_id=pet_id).status_code == 403


@pytest.mark.parametrize("fecha,hora", [
    ((date.today() - timedelta(days=1)).isoformat(), "10:00"),  # pasado
    (FUTURE, "10:15"),  # no es un horario de 30 min
    (FUTURE, "23:00"),  # fuera del horario de atención
    ("15/01/2099", "10:00"),  # formato inválido
])
def test_rejects_invalid_slots(ctx, fecha, hora):
    client, _ = ctx
    headers = _register(client)
    assert _book_with_comprobante(client, headers, hora=hora, fecha=fecha).status_code == 400


def test_same_slot_cannot_be_booked_twice(ctx):
    client, _ = ctx
    a = _register(client, "a@test.com")
    b = _register(client, "b@test.com")
    assert _book_with_comprobante(client, a).status_code == 200
    assert _book_with_comprobante(client, b).status_code == 409


# ── Decisión del veterinario ──────────────────────────────────────────────

def test_approved_payment_shows_as_confirmed_in_my_appointments(ctx):
    client, _ = ctx
    admin = _register(client, "vet@test.com", admin=True)
    user = _register(client)
    appt_id = _book_with_comprobante(
        client, user, sintomas_json=json.dumps({"vomitos": 3}),
    ).json()["id"]

    assert client.get("/admin/appointments/pending-payments", headers=admin).json()[0]["id"] == appt_id
    r = client.put(f"/admin/appointments/{appt_id}/pago", json={"aprobado": True}, headers=admin)
    assert r.status_code == 200

    mine = client.get("/appointments/mine", headers=user).json()
    assert mine[0]["estado"] == "confirmada" and mine[0]["pago_estado"] == "aprobado"
    assert client.get("/admin/appointments/pending-payments", headers=admin).json() == []


def test_rejected_payment_is_visible_and_frees_the_slot(ctx):
    client, _ = ctx
    admin = _register(client, "vet@test.com", admin=True)
    user = _register(client)
    other = _register(client, "other@test.com")
    appt_id = _book_with_comprobante(
        client, user, sintomas_json=json.dumps({"vomitos": 3}),
    ).json()["id"]

    r = client.put(f"/admin/appointments/{appt_id}/pago", json={"aprobado": False}, headers=admin)
    assert r.status_code == 200

    mine = client.get("/appointments/mine", headers=user).json()
    assert mine[0]["estado"] == "cancelada" and mine[0]["pago_estado"] == "rechazado"
    # El horario quedó libre para otra persona.
    assert _book_with_comprobante(client, other).status_code == 200
    # Y la cita cancelada ya no acepta comprobantes nuevos.
    r = client.post(f"/appointments/{appt_id}/comprobante", files={"file": _fake_image()}, headers=user)
    assert r.status_code == 400


# ── Recordatorios de vacunas ───────────────────────────────────────────────

def _add_vaccine(client, headers, pet_id, **body):
    r = client.post(f"/pets/{pet_id}/vaccinations", json={"nombre": "Rabia", "refuerzo_meses": 12, **body},
                    headers=headers)
    assert r.status_code == 200, r.text
    return r.json()["id"]


def test_vaccine_reminders_run_and_do_not_repeat(ctx):
    client, SessionLocal = ctx
    headers = _register(client)
    pet_id = _create_pet(client, headers)
    hoy = date.today()
    # Aplicada hace ~11.5 meses → refuerzo en menos de 30 días.
    proxima = _add_vaccine(client, headers, pet_id, fecha_aplicacion=(hoy - timedelta(days=350)).isoformat())
    # Aplicada hace más de un año → refuerzo vencido.
    vencida = _add_vaccine(client, headers, pet_id, fecha_aplicacion=(hoy - timedelta(days=400)).isoformat())
    # Programada dentro de 10 días → recordatorio por la fecha programada.
    programada = _add_vaccine(client, headers, pet_id, estado="programada",
                              fecha_programada=(hoy + timedelta(days=10)).isoformat())
    # Aplicada hoy → refuerzo en un año, sin aviso.
    _add_vaccine(client, headers, pet_id, fecha_aplicacion=hoy.isoformat())

    db = SessionLocal()
    try:
        assert send_vaccine_reminders_for_db(db) == 3
        assert send_vaccine_reminders_for_db(db) == 0
        by_id = {v.id: v for v in db.query(Vaccination).all()}
        assert by_id[proxima].notificacion_enviada == 1
        assert by_id[vencida].notificacion_urgente_enviada == 1
        assert by_id[programada].notificacion_enviada == 1
    finally:
        db.close()


# ── Panel del veterinario: mascota de la cita y ficha clínica ──────────────

def test_appointment_keeps_pet_name_even_after_pet_is_deleted(ctx):
    client, _ = ctx
    admin = _register(client, "vet@test.com", admin=True)
    user = _register(client)
    pet_id = _create_pet(client, user, "Firulais")
    assert _book_with_comprobante(client, user, pet_id=pet_id).json()["pet_nombre"] == "Firulais"

    client.delete(f"/pets/{pet_id}", headers=user)

    appt = client.get("/admin/appointments", headers=admin).json()[0]
    assert appt["pet_id"] is None and appt["pet_nombre"] == "Firulais"


def test_clinical_record_is_admin_only_and_complete(ctx):
    client, _ = ctx
    admin = _register(client, "vet@test.com", admin=True)
    user = _register(client)
    pet_id = _create_pet(client, user, "Firulais")
    _add_vaccine(client, user, pet_id, fecha_aplicacion="2026-01-15")
    _predict(client, user, pet_id=pet_id)

    assert client.get(f"/admin/pets/{pet_id}/clinical-record", headers=user).status_code == 403
    r = client.get(f"/admin/pets/{pet_id}/clinical-record", headers=admin)
    assert r.status_code == 200
    body = r.json()
    assert body["nombre"] == "Firulais"
    assert [v["nombre"] for v in body["vacunas"]] == ["Rabia"]
    assert len(body["diagnosticos"]) == 1
    assert client.get("/admin/pets/9999/clinical-record", headers=admin).status_code == 404


def test_migration_adds_pet_name_column_to_old_database(tmp_path):
    import sqlite3
    from sqlalchemy import create_engine as _create_engine
    from db_migrations import run_sqlite_migrations

    path = tmp_path / "old.db"
    con = sqlite3.connect(path)
    con.executescript("""
        CREATE TABLE pets (id INTEGER NOT NULL, owner_id INTEGER NOT NULL, nombre VARCHAR NOT NULL,
            especie VARCHAR NOT NULL, raza VARCHAR, edad_meses INTEGER, peso_kg FLOAT, created_at DATETIME,
            PRIMARY KEY (id));
        CREATE TABLE appointments (id INTEGER NOT NULL, user_id INTEGER NOT NULL, fecha VARCHAR NOT NULL,
            hora VARCHAR NOT NULL, estado VARCHAR, pet_id INTEGER, PRIMARY KEY (id));
        INSERT INTO pets (id, owner_id, nombre, especie) VALUES (1, 1, 'Luna', 'gato');
        INSERT INTO appointments (id, user_id, fecha, hora, estado, pet_id) VALUES (1, 1, '2099-01-01', '09:00', 'pendiente', 1);
    """)
    con.commit()
    con.close()

    engine = _create_engine(f"sqlite:///{path}")
    Base.metadata.create_all(bind=engine)  # crea las tablas que faltan, como en main.py
    run_sqlite_migrations(engine)
    run_sqlite_migrations(engine)  # idempotente
    engine.dispose()

    con = sqlite3.connect(path)
    assert con.execute("SELECT pet_nombre FROM appointments WHERE id = 1").fetchone() == ("Luna",)
    con.close()


# ── Fechas válidas según el tipo de vacuna ─────────────────────────────────

def test_vaccine_dates_must_match_their_type(ctx):
    client, _ = ctx
    headers = _register(client)
    pet_id = _create_pet(client, headers)
    hoy = date.today()
    manana = (hoy + timedelta(days=1)).isoformat()
    ayer = (hoy - timedelta(days=1)).isoformat()

    def post(**body):
        return client.post(f"/pets/{pet_id}/vaccinations",
                           json={"nombre": "Rabia", "refuerzo_meses": 12, **body}, headers=headers)

    # Una vacuna aplicada no puede tener fecha futura…
    assert post(estado="aplicada", fecha_aplicacion=manana).status_code == 422
    # …ni una programada, fecha pasada.
    assert post(estado="programada", fecha_programada=ayer).status_code == 422
    # Hoy es válido en ambos casos.
    assert post(estado="aplicada", fecha_aplicacion=hoy.isoformat()).status_code == 200
    assert post(estado="programada", fecha_programada=hoy.isoformat()).status_code == 200
