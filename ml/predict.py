import os
import joblib
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
import traceback

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DICT_PATH = os.path.join(BASE_DIR, "models_by_species.pkl")
LE_ESPECIE_PATH = os.path.join(BASE_DIR, "le_especie.pkl")
LE_ENFERMEDAD_PATH = os.path.join(BASE_DIR, "le_enfermedad.pkl")

# Cargar diccionario de modelos por especie
models_by_species_paths = joblib.load(MODELS_DICT_PATH)

# Cachear modelos en memoria
models_cache = {
    especie: joblib.load(path)
    for especie, path in models_by_species_paths.items()
}

# Cargar LabelEncoders
le_especie = joblib.load(LE_ESPECIE_PATH)
le_enfermedad = joblib.load(LE_ENFERMEDAD_PATH)

# Cargar dataset de referencia
DATA_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "data", "dataset.csv"))
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
        # Normalizar especie
        especie_input = data.get("especie", "").strip().lower()

        if not especie_input:
            raise ValueError("Debes proporcionar la especie")

        # Encuentra especie válida
        especie_original = None
        for clase in le_especie.classes_:
            if clase.lower() == especie_input:
                especie_original = clase
                break

        if especie_original is None:
            raise ValueError(
                f"Especie '{especie_input}' no reconocida. Opciones: {list(le_especie.classes_)}"
            )

        # Obtener modelo correcto
        model_path = models_by_species_paths.get(especie_original)

        if not model_path or not os.path.exists(model_path):
            raise ValueError(
                f"No se encontró modelo entrenado para especie '{especie_original}'"
            )

        # cachear esto fuera de la función
        model = joblib.load(model_path)

        # Convierte especie a valor numérico
        especie_num = le_especie.transform([especie_original])[0]

        # Obtener columnas de síntomas
        symptom_columns = [
            col for col in df_reference.columns if col not in ("enfermedad", "especie")
        ]

        # Construir vector de entrada
        input_vector = [int(data.get(col, 0)) for col in symptom_columns]

        if len(input_vector) != len(symptom_columns):
            raise ValueError("El vector de síntomas no coincide con el dataset de referencia")

        full_input = [especie_num] + input_vector

        # Predicción
        predicted_enfermedad_num = model.predict([full_input])[0]
        predicted_enfermedad_texto = le_enfermedad.inverse_transform(
            [predicted_enfermedad_num]
        )[0]
        probability = float(model.predict_proba([full_input]).max())

        # Estimar fase
        phase = estimate_phase(
            np.array(input_vector),
            predicted_enfermedad_texto,
            especie_original
        )

        gravedad_msg = severity_message(phase)

        return {
            "especie": especie_original.lower(),  # salida limpia
            "diagnostico": predicted_enfermedad_texto,
            "probabilidad": probability,
            "fase": phase,
            "gravedad": gravedad_msg
        }

    except Exception as e:
        print("Error en predict_sickness:")
        traceback.print_exc()
        raise e