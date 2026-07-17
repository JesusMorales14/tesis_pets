# -*- coding: utf-8 -*-
"""
El rate limiter de /auth/* (slowapi) guarda su estado en memoria a nivel de
módulo, compartido por todos los archivos de test que se ejecutan en el
mismo proceso de pytest. Sin resetearlo, tests que registran varios
usuarios (test_pets.py, test_auth_password.py, ...) empiezan a chocar con
el límite de /auth/register apenas se acumulan >5 registros en la misma
sesión de pytest, sin relación con lo que cada test intenta probar.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest  # noqa: E402

from main import limiter  # noqa: E402


@pytest.fixture(autouse=True)
def reset_rate_limiter():
    limiter.reset()
    yield
