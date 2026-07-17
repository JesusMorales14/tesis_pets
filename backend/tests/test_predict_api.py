# -*- coding: utf-8 -*-
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi.testclient import TestClient  # noqa: E402
from main import app  # noqa: E402

client = TestClient(app)


def test_predict_endpoint_valid_request():
    response = client.post("/predict", json={"especie": "perro", "vomitos": 3, "letargo": 2})
    assert response.status_code == 200
    body = response.json()
    assert "diagnostico" in body
    assert 0.0 <= body["probabilidad"] <= 1.0


def test_predict_endpoint_rejects_invalid_species():
    # Pydantic's field_validator rejects this before the endpoint body runs,
    # so FastAPI reports it as a 422 validation error (not the 400 raised
    # manually for errors coming from predict_sickness itself).
    response = client.post("/predict", json={"especie": "dragon"})
    assert response.status_code == 422


def test_predict_endpoint_rejects_out_of_range_severity():
    response = client.post("/predict", json={"especie": "perro", "fiebre": 7})
    assert response.status_code == 422


def test_admin_endpoint_requires_auth():
    response = client.get("/admin/appointments")
    assert response.status_code in (401, 403)
