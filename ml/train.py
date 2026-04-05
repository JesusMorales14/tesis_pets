import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.preprocessing import LabelEncoder
import joblib
import os

# --- Paths ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "..", "data", "dataset.csv"))
LE_ESPECIE_PATH = os.path.join(BASE_DIR, "le_especie.pkl")
LE_ENFERMEDAD_PATH = os.path.join(BASE_DIR, "le_enfermedad.pkl")
MODELS_DICT_PATH = os.path.join(BASE_DIR, "models_by_species.pkl")

# --- Cargar datos ---
df = pd.read_csv(DATA_PATH)
print("Dataset cargado desde:", DATA_PATH)

# Validar columnas
expected_columns = 45  # 44 síntomas + 1 enfermedad
if df.shape[1] != expected_columns:
    raise ValueError(f"Dataset debe tener {expected_columns} columnas. Columnas actuales: {df.shape[1]}")

# --- Codificar especie y enfermedad ---
le_especie = LabelEncoder()
df['especie'] = le_especie.fit_transform(df['especie'])  # 0=Gato, 1=Perro

le_enfermedad = LabelEncoder()
df['enfermedad'] = le_enfermedad.fit_transform(df['enfermedad'])

# Guardar los LabelEncoders
joblib.dump(le_especie, LE_ESPECIE_PATH)
joblib.dump(le_enfermedad, LE_ENFERMEDAD_PATH)
print("LabelEncoders guardados en:", LE_ESPECIE_PATH, "y", LE_ENFERMEDAD_PATH)

# --- Crear un modelo por especie ---
models_by_species = {}

for especie_name in le_especie.classes_:
    print(f"\nEntrenando modelo para especie: {especie_name}")
    especie_num = le_especie.transform([especie_name])[0]
    df_especie = df[df['especie'] == especie_num]

    X = df_especie.drop("enfermedad", axis=1)
    y = df_especie["enfermedad"]

    # Revisar NaNs
    if X.isna().sum().sum() > 0:
        raise ValueError(f"Hay valores faltantes en los síntomas para especie '{especie_name}'.")

    # Separación train/test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Crear y entrenar modelo
    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=10,
        random_state=42,
        class_weight='balanced'
    )
    model.fit(X_train, y_train)

    # Evaluación
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Precisión del modelo: {accuracy * 100:.2f}%")
    print(classification_report(y_test, y_pred))
    print(confusion_matrix(y_test, y_pred))

    # Guardar modelo
    model_filename = os.path.join(BASE_DIR, f"model_{especie_name}.pkl")
    joblib.dump(model, model_filename)
    print(f"Modelo guardado en '{model_filename}'")

    models_by_species[especie_name] = model_filename

# Guardar diccionario de modelos por especie
joblib.dump(models_by_species, MODELS_DICT_PATH)
print("\nDiccionario de modelos por especie guardado en:", MODELS_DICT_PATH)