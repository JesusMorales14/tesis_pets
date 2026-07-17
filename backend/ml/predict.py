import os
import joblib
import pandas as pd
import numpy as np
import traceback

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DICT_PATH = os.path.join(BASE_DIR, "models_by_species.pkl")
LE_ESPECIE_PATH = os.path.join(BASE_DIR, "le_especie.pkl")
LE_ENFERMEDAD_PATH = os.path.join(BASE_DIR, "le_enfermedad.pkl")

# Cargar diccionario de modelos por especie
models_by_species_paths = joblib.load(MODELS_DICT_PATH)

# Cachear modelos en memoria para no cargarlos en cada petición
models_cache = {
    especie: joblib.load(os.path.join(BASE_DIR, path))
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

    cols_to_drop = ["enfermedad", "especie"]

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

        # Buscar especie válida
        especie_original = None
        for clase in le_especie.classes_:
            if clase.lower() == especie_input:
                especie_original = clase
                break
        if especie_original is None:
            raise ValueError(
                f"Especie '{especie_input}' no reconocida. Opciones: {list(le_especie.classes_)}"
            )

        # Obtener modelo desde cache
        if especie_original not in models_cache:
            raise ValueError(f"No hay modelo cargado para especie '{especie_original}'")
        model = models_cache[especie_original]

        # Convertir especie a número
        especie_num = le_especie.transform([especie_original])[0]

        # Columnas de síntomas
        symptom_columns = [
            col for col in df_reference.columns if col not in ("enfermedad", "especie")
        ]

        # Construir vector de entrada
        input_vector = [int(data.get(col, 0)) for col in symptom_columns]
        if len(input_vector) != len(symptom_columns):
            raise ValueError("El vector de síntomas no coincide con el dataset de referencia")

        # "especie" no se usa como feature del modelo: es constante dentro
        # de cada modelo por especie y por lo tanto no aporta información.
        input_df = pd.DataFrame([input_vector], columns=symptom_columns)
        predicted_enfermedad_num = model.predict(input_df)[0]
        predicted_enfermedad_texto = le_enfermedad.inverse_transform([predicted_enfermedad_num])[0]

        # Probabilidades reales del modelo (regresión logística calibrada por
        # validación cruzada). A diferencia de una versión anterior, ya NO se
        # aplica "temperature scaling" artificial para inflar la confianza:
        # ese truco ocultaba los casos genuinamente ambiguos (p. ej. Leucemia
        # Felina vs. Inmunodeficiencia Felina, indistinguibles por síntomas y
        # que en la práctica requieren un análisis de sangre) detrás de un
        # número de confianza falso. Mostrar la probabilidad real permite
        # señalar cuándo el diagnóstico necesita confirmación clínica.
        raw_probs = model.predict_proba(input_df)[0]
        order = np.argsort(raw_probs)[::-1]
        probability = float(raw_probs[order[0]])

        # Diagnóstico diferencial: si la 2ª y/o 3ª opción están cerca de la
        # primera, se informan como alternativas a confirmar por el
        # veterinario en vez de esconder la incertidumbre. La 3ª solo se
        # muestra cuando el caso es lo bastante ambiguo como para que
        # también esté cerca del líder (no solo cerca de la 2ª) — así un
        # caso claro con una 2ª opción lejana no arrastra una 3ª irrelevante.
        CLOSENESS_THRESHOLD = 0.15
        diagnostico_alternativo = None
        probabilidad_alternativa = None
        diagnostico_tercero = None
        probabilidad_tercero = None
        if len(order) > 1 and (probability - raw_probs[order[1]]) < CLOSENESS_THRESHOLD:
            segunda_enfermedad_num = model.classes_[order[1]]
            diagnostico_alternativo = le_enfermedad.inverse_transform([segunda_enfermedad_num])[0]
            probabilidad_alternativa = float(raw_probs[order[1]])

            if len(order) > 2 and (probability - raw_probs[order[2]]) < CLOSENESS_THRESHOLD:
                tercera_enfermedad_num = model.classes_[order[2]]
                diagnostico_tercero = le_enfermedad.inverse_transform([tercera_enfermedad_num])[0]
                probabilidad_tercero = float(raw_probs[order[2]])

        # Estimar fase
        phase = estimate_phase(np.array(input_vector), predicted_enfermedad_texto, especie_original)
        gravedad_msg = severity_message(phase)

        return {
            "especie": especie_original.lower(),
            "diagnostico": predicted_enfermedad_texto,
            "probabilidad": probability,
            "fase": phase,
            "gravedad": gravedad_msg,
            "diagnostico_alternativo": diagnostico_alternativo,
            "probabilidad_alternativa": probabilidad_alternativa,
            "diagnostico_tercero": diagnostico_tercero,
            "probabilidad_tercero": probabilidad_tercero,
        }

    except Exception as e:
        print("Error en predict_sickness:")
        traceback.print_exc()
        raise e