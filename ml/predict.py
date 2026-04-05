import os
import joblib
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
import traceback

# --- Paths ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DICT_PATH = os.path.join(BASE_DIR, "models_by_species.pkl")
LE_ESPECIE_PATH = os.path.join(BASE_DIR, "le_especie.pkl")
LE_ENFERMEDAD_PATH = os.path.join(BASE_DIR, "le_enfermedad.pkl")

# --- Cargar diccionario de modelos por especie ---
models_by_species_paths = joblib.load(MODELS_DICT_PATH)

# --- Cargar LabelEncoders ---
le_especie = joblib.load(LE_ESPECIE_PATH)
le_enfermedad = joblib.load(LE_ENFERMEDAD_PATH)

# --- Cargar dataset de referencia ---
DATA_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "..", "data", "dataset.csv"))
df_reference = pd.read_csv(DATA_PATH)
print("Dataset cargado desde:", DATA_PATH)

def estimate_phase(input_vector, predicted_enfermedad_texto, especie):
    df_filtered = df_reference[
        (df_reference["enfermedad"] == predicted_enfermedad_texto) &
        (df_reference["especie"] == especie)
    ]

    if df_filtered.empty:
        df_filtered = df_reference[df_reference["enfermedad"] == predicted_enfermedad_texto]
    if df_filtered.empty:
        return 1

    cols_to_drop = ["enfermedad", "especie"] if "especie" in df_reference.columns else ["enfermedad"]

    differences = df_filtered.drop(cols_to_drop, axis=1).apply(
        lambda row: np.sum(np.abs(row.values - input_vector)), axis=1
    )

    if differences.empty:
        return 1

    best_match_row = df_filtered.loc[differences.idxmin()]
    severity_values = best_match_row.drop(cols_to_drop).values

    phase = int(np.max(severity_values))
    phase_scaled = min(10, max(1, int((phase / 3) * 10)))
    return phase_scaled

def severity_message(phase):
    if phase <= 3:
        return "leve"
    elif phase <= 7:
        return "moderada"
    else:
        return "grave"

def predict_sickness(data: dict):
    try:
        especie = data.get("especie", "desconocida").lower()
        if especie not in le_especie.classes_:
            raise ValueError(f"Especie '{especie}' no reconocida. Opciones: {list(le_especie.classes_)}")

        # --- Cargar modelo correcto según especie ---
        model_path = models_by_species_paths.get(especie)
        if not model_path or not os.path.exists(model_path):
            raise ValueError(f"No se encontró modelo entrenado para especie '{especie}'")
        model = joblib.load(model_path)

        # Convertir especie a valor numérico
        especie_num = le_especie.transform([especie])[0]

        # Tomar solo columnas de síntomas
        symptom_columns = [col for col in df_reference.columns if col not in ("enfermedad", "especie")]
        input_vector = [int(data.get(col, 0)) for col in symptom_columns]

        if len(input_vector) != len(symptom_columns):
            raise ValueError("El vector de síntomas no coincide con el dataset de referencia")

        full_input = [especie_num] + input_vector

        # Predicción
        predicted_enfermedad_num = model.predict([full_input])[0]
        predicted_enfermedad_texto = le_enfermedad.inverse_transform([predicted_enfermedad_num])[0]
        probability = model.predict_proba([full_input]).max()

        # Estimar fase
        phase = estimate_phase(np.array(input_vector), predicted_enfermedad_texto, especie)
        gravedad_msg = severity_message(phase)

        return {
            "especie": especie,
            "diagnostico": predicted_enfermedad_texto,
            "probabilidad": float(probability),
            "fase": phase,
            "gravedad": gravedad_msg
        }

    except Exception as e:
        print("Error en predict_sickness:")
        traceback.print_exc()
        raise e