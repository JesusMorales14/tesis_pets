# -*- coding: utf-8 -*-
"""
Sin rate limiting, /auth/login es vulnerable a fuerza bruta de
contraseñas y /auth/register a registro masivo de cuentas falsas.
Este test confirma que el límite realmente corta el flujo tras N intentos.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi.testclient import TestClient  # noqa: E402
from main import app  # noqa: E402

client = TestClient(app)


def test_login_is_rate_limited_after_repeated_attempts():
    payload = {"email": "nadie@test.com", "password": "wrong-password"}

    statuses = [client.post("/auth/login", json=payload).status_code for _ in range(15)]

    # Todos los intentos fallidos por credenciales deben ser 401... hasta que
    # el límite (10/minuto) se activa y empieza a responder 429.
    assert 401 in statuses, "Se esperaban rechazos por credenciales inválidas"
    assert 429 in statuses, "El rate limit de /auth/login nunca se activó"
