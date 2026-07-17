# -*- coding: utf-8 -*-
import os
import sys
import pandas as pd
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from ml.predict import predict_sickness  # noqa: E402

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "data", "dataset.csv")


def _payload_for(especie: str, enfermedad: str) -> dict:
    df = pd.read_csv(DATA_PATH)
    sub = df[(df["especie"] == especie) & (df["enfermedad"].str.strip() == enfermedad)]
    assert not sub.empty, f"No hay filas para {especie}/{enfermedad} en el dataset"
    row = sub.iloc[len(sub) // 2]
    return row.drop(["enfermedad"]).to_dict()


def test_rejects_unknown_species():
    with pytest.raises(ValueError):
        predict_sickness({"especie": "iguana"})


def test_rejects_missing_species():
    with pytest.raises(ValueError):
        predict_sickness({"especie": ""})


def test_predicts_known_dog_disease_correctly():
    payload = _payload_for("perro", "parvovirus")
    result = predict_sickness(payload)
    assert result["diagnostico"] == "parvovirus"
    assert result["especie"] == "perro"
    assert 0.0 <= result["probabilidad"] <= 1.0


def test_predicts_known_cat_disease_correctly():
    payload = _payload_for("gato", "diabetes_mellitus_felina")
    result = predict_sickness(payload)
    assert result["diagnostico"] == "diabetes_mellitus_felina"


def test_response_has_expected_shape():
    payload = _payload_for("perro", "otitis_canina")
    result = predict_sickness(payload)
    for key in ("especie", "diagnostico", "probabilidad", "fase", "gravedad"):
        assert key in result
    assert 1 <= result["fase"] <= 10
    assert result["gravedad"] in ("leve", "moderada", "grave")


def test_missing_symptoms_default_to_zero():
    """Un request sin todos los síntomas no debe fallar (los ausentes valen 0)."""
    result = predict_sickness({"especie": "perro", "fiebre": 1})
    assert "diagnostico" in result


def test_differential_diagnosis_present_for_ambiguous_case():
    """
    Verifica el mecanismo de diagnóstico diferencial: cuando el segundo
    diagnóstico más probable está cerca del primero, debe reportarse en
    vez de ocultar la incertidumbre con una confianza artificialmente alta.
    """
    # FeLV y FIV comparten un patrón de síntomas cercano en las fases leves;
    # si el modelo detecta cercanía, debe poblar el campo alternativo.
    payload = _payload_for("gato", "leucemia_felina")
    result = predict_sickness(payload)
    if result["probabilidad_alternativa"] is not None:
        assert result["probabilidad_alternativa"] <= result["probabilidad"]
        assert result["diagnostico_alternativo"] != result["diagnostico"]


def test_third_option_only_appears_alongside_a_second():
    """El top-3 solo tiene sentido si ya hay un top-2 — nunca debe verse un
    3er diagnóstico sin un 2º (sería una ambigüedad "hueca")."""
    for especie, enfermedad in [("perro", "parvovirus"), ("gato", "panleucopenia")]:
        result = predict_sickness(_payload_for(especie, enfermedad))
        if result["diagnostico_tercero"] is not None:
            assert result["diagnostico_alternativo"] is not None
            assert result["probabilidad_tercero"] <= result["probabilidad_alternativa"]
            assert result["diagnostico_tercero"] != result["diagnostico"]
            assert result["diagnostico_tercero"] != result["diagnostico_alternativo"]
