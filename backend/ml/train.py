import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import RepeatedStratifiedKFold, GridSearchCV, cross_val_predict
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import os

# --- Paths ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "data", "dataset.csv")
LE_ESPECIE_PATH = os.path.join(BASE_DIR, "le_especie.pkl")
LE_ENFERMEDAD_PATH = os.path.join(BASE_DIR, "le_enfermedad.pkl")
MODELS_DICT_PATH = os.path.join(BASE_DIR, "models_by_species.pkl")

# --- Cargar datos ---
df = pd.read_csv(DATA_PATH)
print("Dataset cargado desde:", DATA_PATH)

# Validar columnas
expected_columns = 56  # 1 especie + 54 síntomas + 1 enfermedad
if df.shape[1] != expected_columns:
    raise ValueError(f"Dataset debe tener {expected_columns} columnas. Columnas actuales: {df.shape[1]}")

# Limpieza: normaliza espacios accidentales en las etiquetas (p.ej. " envenenamiento_x")
# que rompían el match exacto usado en el frontend y en la estimación de fase.
df["enfermedad"] = df["enfermedad"].astype(str).str.strip()

# --- Codificar especie y enfermedad ---
le_especie = LabelEncoder()
df['especie'] = le_especie.fit_transform(df['especie'])  # 0=Gato, 1=Perro

le_enfermedad = LabelEncoder()
df['enfermedad'] = le_enfermedad.fit_transform(df['enfermedad'])

# Guardar LabelEncoders
joblib.dump(le_especie, LE_ESPECIE_PATH)
joblib.dump(le_enfermedad, LE_ENFERMEDAD_PATH)
print("LabelEncoders guardados en:", LE_ESPECIE_PATH, "y", LE_ENFERMEDAD_PATH)

# --- Selección de modelo ---
# El dataset tiene pocas muestras por clase (45, ver data/generate_dataset.py
# y data/SOURCES.md). Con esa escasez, un RandomForest de cientos de árboles
# sobreajusta (alta varianza entre folds).
# Una regresión logística regularizada generaliza mejor sobre síntomas
# ordinales (0-3) y es la que gana de forma consistente en validación
# cruzada repetida frente a RF/ExtraTrees/GradientBoosting/SVM/KNN.
PARAM_GRID = {
    "clf__C": [0.1, 0.3, 1.0, 3.0, 10.0, 30.0],
    "clf__class_weight": [None, "balanced"],
}

models_by_species = {}

for especie_name in le_especie.classes_:
    print(f"\nEntrenando modelo para especie: {especie_name}")
    especie_num = le_especie.transform([especie_name])[0]
    df_especie = df[df['especie'] == especie_num]

    X = df_especie.drop(columns=["enfermedad", "especie"])
    y = df_especie["enfermedad"]

    if X.isna().sum().sum() > 0:
        raise ValueError(f"Hay valores faltantes en los síntomas para especie '{especie_name}'.")

    # Validación cruzada repetida y estratificada: con clases de 45
    # muestras, un único split 80/20 es demasiado ruidoso para reportar
    # una métrica confiable. 5 folds x 10 repeticiones = 50 evaluaciones.
    cv = RepeatedStratifiedKFold(n_splits=5, n_repeats=10, random_state=42)

    pipeline = Pipeline([
        ("scale", StandardScaler()),
        ("clf", LogisticRegression(max_iter=5000)),
    ])

    grid = GridSearchCV(pipeline, PARAM_GRID, cv=cv, scoring="accuracy", n_jobs=-1)
    grid.fit(X, y)

    best_params = grid.best_params_
    cv_accuracy = grid.best_score_
    print(f"Mejores hiperparámetros: {best_params}")
    print(f"Precisión validada por cross-validation (5x10 folds): {cv_accuracy * 100:.2f}%")

    # Reporte adicional con predicciones out-of-fold (más representativo
    # que un solo split) para inspeccionar la matriz de confusión.
    oof_cv = RepeatedStratifiedKFold(n_splits=5, n_repeats=1, random_state=7)
    y_pred_oof = cross_val_predict(grid.best_estimator_, X, y, cv=oof_cv)
    print(classification_report(y, y_pred_oof, zero_division=0))
    print(confusion_matrix(y, y_pred_oof))

    # Modelo final: se reentrena con el 100% de los datos disponibles de la
    # especie (ya evaluado de forma honesta arriba vía CV) para maximizar
    # el rendimiento real en producción.
    final_model = Pipeline([
        ("scale", StandardScaler()),
        ("clf", LogisticRegression(max_iter=5000, **{k.replace("clf__", ""): v for k, v in best_params.items()})),
    ])
    final_model.fit(X, y)

    train_accuracy = accuracy_score(y, final_model.predict(X))
    print(f"Precisión sobre datos de entrenamiento completos: {train_accuracy * 100:.2f}% (referencial, no usar como métrica de generalización)")

    # Guardar modelo como ruta relativa
    model_filename = f"model_{especie_name}.pkl"
    joblib.dump(final_model, os.path.join(BASE_DIR, model_filename))
    print(f"Modelo guardado en '{model_filename}'")

    # Guardar ruta relativa en diccionario
    models_by_species[especie_name] = model_filename

# Guardar diccionario de modelos por especie
joblib.dump(models_by_species, MODELS_DICT_PATH)
print("\nDiccionario de modelos por especie guardado en:", MODELS_DICT_PATH)
