# -*- coding: utf-8 -*-
"""
Estos tests existen porque el dataset tuvo bugs reales de este tipo
exacto: columnas de síntomas mal asignadas hacían que dos enfermedades
distintas tuvieran el mismo vector de síntomas (techo de ~76% de
accuracy en gatos), y una columna con valores fuera de la escala 0-3
rompía la validación del endpoint /predict. Si alguien edita
dataset.csv y reintroduce alguno de estos problemas, estos tests deben
fallar antes de que llegue a producción.
"""
import os
import pandas as pd
import pytest

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "data", "dataset.csv")


@pytest.fixture(scope="module")
def df():
    return pd.read_csv(DATA_PATH)


def test_dataset_file_exists():
    assert os.path.exists(DATA_PATH)


def test_no_missing_values(df):
    assert df.isna().sum().sum() == 0, "El dataset no debe tener valores faltantes"


def test_symptom_severity_within_range(df):
    """Todos los síntomas deben estar en la escala documentada 0 (ausente) - 3 (grave)."""
    symptom_cols = [c for c in df.columns if c not in ("especie", "enfermedad")]
    out_of_range = {}
    for col in symptom_cols:
        bad = df[(df[col] < 0) | (df[col] > 3)]
        if len(bad):
            out_of_range[col] = sorted(bad[col].unique().tolist())
    assert not out_of_range, f"Columnas con valores fuera de 0-3: {out_of_range}"


def test_especie_values_valid(df):
    assert set(df["especie"].unique()) <= {"perro", "gato"}


def test_disease_labels_have_no_stray_whitespace(df):
    stripped = df["enfermedad"].str.strip()
    mismatched = df.loc[df["enfermedad"] != stripped, "enfermedad"].tolist()
    assert not mismatched, f"Etiquetas con espacios accidentales: {mismatched!r}"


def test_no_symptom_vector_collisions_within_species(df):
    """
    El bug real: si dos filas de la MISMA especie tienen el vector de
    síntomas idéntico pero etiquetas de enfermedad distintas, ningún
    modelo puede aprender a distinguirlas — es un techo matemático de
    accuracy, no una limitación del algoritmo.
    """
    symptom_cols = [c for c in df.columns if c not in ("especie", "enfermedad")]
    problems = []
    for especie, sub in df.groupby("especie"):
        grp = sub.groupby(symptom_cols)["enfermedad"].nunique()
        ambiguous = grp[grp > 1]
        if len(ambiguous):
            problems.append(f"{especie}: {len(ambiguous)} vectores de síntomas ambiguos")
    assert not problems, "; ".join(problems)


def test_minimum_samples_per_disease(df):
    """Cada enfermedad necesita muestras suficientes para cross-validation con 5 folds."""
    counts = df["enfermedad"].value_counts()
    too_few = counts[counts < 5]
    assert too_few.empty, f"Enfermedades con menos de 5 muestras: {too_few.to_dict()}"


def test_expected_column_count(df):
    # 1 especie + 54 síntomas + 1 enfermedad
    assert df.shape[1] == 56, f"Se esperaban 56 columnas, hay {df.shape[1]}"
