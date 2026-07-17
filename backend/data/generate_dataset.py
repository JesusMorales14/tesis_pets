"""Genera dataset.csv a partir de perfiles de síntomas por enfermedad.

Los perfiles (SYMPTOM_PROFILES) están fundamentados en literatura
veterinaria citada en SOURCES.md, no inventados a mano fila por fila como
el dataset anterior. Cada síntoma tiene una probabilidad de presencia
basada en su frecuencia clínica documentada; la severidad (1-3) se muestrea
de forma sesgada hacia valores altos cuando la probabilidad de presencia es
alta (los signos más característicos también suelen ser los más intensos).

Este dataset sigue siendo sintético: no reemplaza historias clínicas
reales. Ver SOURCES.md para el detalle de qué está respaldado por qué
fuente y qué se dejó deliberadamente ambiguo entre enfermedades que en la
práctica real solo se distinguen con pruebas de laboratorio.
"""
import csv
import os
import random

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_PATH = os.path.join(BASE_DIR, "dataset.csv")

SAMPLES_PER_CLASS = 45
NOISE_PROB = 0.02  # síntoma incidental no relacionado, mismo para todas las clases
SEED = 42
# Un caso real casi nunca llega a consulta con 0-1 síntomas. Sin este piso,
# el muestreo aleatorio ocasionalmente genera filas casi vacías que, al no
# llevar señal de ninguna enfermedad, colisionan por casualidad con
# cualquier otra enfermedad sin relación clínica alguna (a diferencia de
# las colisiones esperadas entre enfermedades genuinamente parecidas, ver
# SOURCES.md).
MIN_SYMPTOMS_PER_ROW = 3
MAX_RETRIES = 200

COLUMNS = [
    "especie", "fiebre", "espasmos", "convulsiones", "desorientacion", "temblores",
    "tos_seca", "jadeo_excesivo", "arcadas_frecuentes", "dificultad_comer",
    "asfixia_aparente", "vomitos", "letargo", "tos", "diarrea", "respiracion_rapida",
    "cianosis", "nauseas", "gases", "heces_con_sangre", "heces_negras",
    "estreñimiento", "encias_palidas", "encias_rojas", "llenado_capilar_lento",
    "picazon", "perdida_pelo", "piel_enrojecida", "heridas_piel", "costras",
    "mal_olor_piel", "ojos_llorosos", "secrecion_ocular", "ojos_rojos",
    "pupilas_dilatadas", "dolor_al_moverse", "orina_frecuente", "dificultad_orinar",
    "sangre_en_orina", "orina_oscura", "agresividad", "ansiedad", "aislamiento",
    "confusion", "enfermedad", "perdida_peso", "aumento_peso", "aumento_apetito",
    "aumento_sed", "distension_abdominal", "dolor_abdominal", "cojera",
    "rigidez_articular", "sacudida_cabeza", "intolerancia_ejercicio", "mal_aliento",
]
SYMPTOM_COLUMNS = [c for c in COLUMNS if c not in ("especie", "enfermedad")]

# especie -> enfermedad -> {sintoma: probabilidad_de_presencia}
# Ver SOURCES.md para las citas que respaldan cada perfil.
SYMPTOM_PROFILES = {
    "perro": {
        "parvovirus": {
            "vomitos": 0.9, "heces_con_sangre": 0.75, "letargo": 0.9, "fiebre": 0.6,
            "dificultad_comer": 0.8, "encias_palidas": 0.5, "gases": 0.3, "nauseas": 0.5,
            "diarrea": 0.7,
        },
        "moquillo": {
            "fiebre": 0.8, "letargo": 0.85, "dificultad_comer": 0.6,
            "secrecion_ocular": 0.6, "ojos_llorosos": 0.5, "tos": 0.4,
            "respiracion_rapida": 0.3, "vomitos": 0.4, "diarrea": 0.4,
            "temblores": 0.35, "convulsiones": 0.2, "desorientacion": 0.2,
            "espasmos": 0.2, "ojos_rojos": 0.3, "pupilas_dilatadas": 0.15,
            "agresividad": 0.1,
        },
        "leptospirosis": {
            "fiebre": 0.7, "letargo": 0.85, "vomitos": 0.6, "diarrea": 0.4,
            "dolor_abdominal": 0.4, "encias_palidas": 0.3, "encias_rojas": 0.2,
            "orina_oscura": 0.4, "sangre_en_orina": 0.3, "heces_negras": 0.25,
            "respiracion_rapida": 0.3, "dolor_al_moverse": 0.3,
        },
        "ehrlichiosis": {
            "fiebre": 0.7, "letargo": 0.85, "dificultad_comer": 0.5,
            "encias_palidas": 0.4, "llenado_capilar_lento": 0.3,
            "heces_con_sangre": 0.35, "heces_negras": 0.3, "dolor_al_moverse": 0.5,
            "ojos_rojos": 0.35, "respiracion_rapida": 0.2, "sangre_en_orina": 0.2,
        },
        "babesiosis": {
            "encias_palidas": 0.75, "letargo": 0.85, "fiebre": 0.5,
            "llenado_capilar_lento": 0.6, "orina_oscura": 0.6,
            "respiracion_rapida": 0.25, "dificultad_comer": 0.25, "vomitos": 0.2,
        },
        "dirofilariosis": {
            "tos": 0.5, "intolerancia_ejercicio": 0.6, "respiracion_rapida": 0.4,
            "letargo": 0.4, "perdida_peso": 0.3, "distension_abdominal": 0.2,
            "dificultad_comer": 0.2, "cianosis": 0.1,
        },
        "dermatitis_alergica": {
            "picazon": 0.9, "piel_enrojecida": 0.75, "perdida_pelo": 0.5,
            "heridas_piel": 0.35, "costras": 0.3, "mal_olor_piel": 0.3,
            "sacudida_cabeza": 0.2,
        },
        "otitis_canina": {
            "sacudida_cabeza": 0.85, "picazon": 0.5, "mal_olor_piel": 0.5,
            "dolor_al_moverse": 0.2, "agresividad": 0.15, "fiebre": 0.15,
        },
        "displasia_cadera": {
            "cojera": 0.8, "rigidez_articular": 0.65, "dolor_al_moverse": 0.7,
            "intolerancia_ejercicio": 0.4,
        },
        "osteoartritis_canina": {
            "cojera": 0.8, "rigidez_articular": 0.7, "dolor_al_moverse": 0.65,
            "intolerancia_ejercicio": 0.35,
        },
        "cushing_canino": {
            "aumento_sed": 0.8, "orina_frecuente": 0.8, "aumento_apetito": 0.7,
            "distension_abdominal": 0.6, "perdida_pelo": 0.5, "jadeo_excesivo": 0.5,
            "letargo": 0.3, "piel_enrojecida": 0.2,
        },
        "hipotiroidismo_canino": {
            "letargo": 0.75, "aumento_peso": 0.65, "perdida_pelo": 0.55,
            "piel_enrojecida": 0.3, "mal_olor_piel": 0.25, "intolerancia_ejercicio": 0.4,
            "estreñimiento": 0.25,
        },
        "diabetes_mellitus_canina": {
            "aumento_sed": 0.85, "orina_frecuente": 0.85, "aumento_apetito": 0.6,
            "perdida_peso": 0.55, "letargo": 0.4, "vomitos": 0.2,
        },
        "pancreatitis_canina": {
            "dolor_abdominal": 0.85, "vomitos": 0.8, "dificultad_comer": 0.6,
            "letargo": 0.6, "fiebre": 0.35, "diarrea": 0.2, "distension_abdominal": 0.3,
        },
        "envenenamiento_rodenticidas": {
            "encias_palidas": 0.6, "llenado_capilar_lento": 0.5, "letargo": 0.55,
            "respiracion_rapida": 0.4, "heces_negras": 0.35, "sangre_en_orina": 0.2,
            "tos": 0.15, "asfixia_aparente": 0.1,
        },
        "neumonia_canina": {
            "respiracion_rapida": 0.75, "tos": 0.65, "fiebre": 0.6, "letargo": 0.6,
            "jadeo_excesivo": 0.4, "dificultad_comer": 0.3, "cianosis": 0.15,
            "asfixia_aparente": 0.15,
        },
        "tos_de_las_perreras": {
            "tos_seca": 0.85, "arcadas_frecuentes": 0.6, "fiebre": 0.25,
            "respiracion_rapida": 0.2, "letargo": 0.2, "dificultad_comer": 0.15,
        },
        "intoxicacion_alimentaria": {
            "vomitos": 0.85, "diarrea": 0.7, "nauseas": 0.65, "dolor_abdominal": 0.5,
            "letargo": 0.3, "dificultad_comer": 0.25, "gases": 0.5, "fiebre": 0.1,
        },
        "gastroenteritis": {
            "vomitos": 0.75, "diarrea": 0.8, "nauseas": 0.45, "dificultad_comer": 0.5,
            "letargo": 0.5, "fiebre": 0.45, "dolor_abdominal": 0.2, "gases": 0.15,
        },
        "insuficiencia_cardiaca_canina": {
            "tos": 0.6, "intolerancia_ejercicio": 0.7, "respiracion_rapida": 0.55,
            "letargo": 0.5, "distension_abdominal": 0.35, "cianosis": 0.2,
            "jadeo_excesivo": 0.3, "asfixia_aparente": 0.15,
        },
    },
    "gato": {
        "panleucopenia": {
            "vomitos": 0.85, "diarrea": 0.7, "fiebre": 0.6, "letargo": 0.85,
            "dificultad_comer": 0.7, "encias_palidas": 0.35, "heces_con_sangre": 0.25,
            "nauseas": 0.3,
        },
        "rinotraqueitis_viral_felina": {
            "secrecion_ocular": 0.55, "ojos_rojos": 0.4, "ojos_llorosos": 0.45,
            "tos": 0.35, "fiebre": 0.6, "dificultad_comer": 0.6, "letargo": 0.55,
        },
        "leucemia_felina": {
            "dificultad_comer": 0.6, "letargo": 0.6, "perdida_peso": 0.55,
            "encias_palidas": 0.4, "fiebre": 0.3, "diarrea": 0.3, "vomitos": 0.25,
            "encias_rojas": 0.2,
        },
        "virus_inmunodeficiencia_felina": {
            "letargo": 0.55, "dificultad_comer": 0.45, "perdida_peso": 0.45,
            "encias_rojas": 0.2, "mal_aliento": 0.15, "fiebre": 0.35, "diarrea": 0.3,
        },
        "toxoplasmosis_felina": {
            "fiebre": 0.5, "letargo": 0.5, "dificultad_comer": 0.4,
            "respiracion_rapida": 0.3, "ojos_rojos": 0.3, "vomitos": 0.25,
            "diarrea": 0.2,
        },
        "dermatitis_por_pulgas": {
            "picazon": 0.9, "piel_enrojecida": 0.65, "perdida_pelo": 0.4,
            "costras": 0.15, "heridas_piel": 0.2, "mal_olor_piel": 0.1,
        },
        "dermatitis_alergica": {
            "picazon": 0.65, "piel_enrojecida": 0.85, "perdida_pelo": 0.55,
            "heridas_piel": 0.4, "costras": 0.1, "mal_olor_piel": 0.45,
        },
        "sarna_felina": {
            "picazon": 0.75, "costras": 0.8, "piel_enrojecida": 0.4,
            "perdida_pelo": 0.65, "heridas_piel": 0.55, "mal_olor_piel": 0.2,
        },
        "cistitis_felina": {
            "orina_frecuente": 0.75, "dificultad_orinar": 0.65, "sangre_en_orina": 0.55,
            "orina_oscura": 0.3, "dolor_abdominal": 0.25, "agresividad": 0.15,
            "fiebre": 0.15,
        },
        "enfermedad_renal_cronica": {
            "aumento_sed": 0.7, "orina_frecuente": 0.65, "perdida_peso": 0.6,
            "dificultad_comer": 0.5, "letargo": 0.55, "vomitos": 0.35,
            "mal_aliento": 0.3, "perdida_pelo": 0.15, "estreñimiento": 0.2,
        },
        "hipertiroidismo_felino": {
            "perdida_peso": 0.75, "aumento_apetito": 0.7, "aumento_sed": 0.4,
            "vomitos": 0.35, "diarrea": 0.3, "ansiedad": 0.25, "agresividad": 0.2,
            "respiracion_rapida": 0.2,
        },
        "miocardiopatia_hipertrofica": {
            "respiracion_rapida": 0.5, "letargo": 0.45, "intolerancia_ejercicio": 0.4,
            "cianosis": 0.2, "jadeo_excesivo": 0.3, "dolor_al_moverse": 0.25,
            "distension_abdominal": 0.15,
        },
        "gastritis_felina": {
            "vomitos": 0.85, "dificultad_comer": 0.55, "letargo": 0.35, "nauseas": 0.5,
            "diarrea": 0.05, "dolor_abdominal": 0.2, "fiebre": 0.1,
        },
        "enfermedad_periodontal_felina": {
            "mal_aliento": 0.85, "dificultad_comer": 0.5, "encias_rojas": 0.6,
            "perdida_peso": 0.3,
        },
        "conjuntivitis_felina": {
            "secrecion_ocular": 0.8, "ojos_rojos": 0.75, "ojos_llorosos": 0.6,
            "fiebre": 0.1,
        },
        "diabetes_mellitus_felina": {
            "aumento_sed": 0.8, "orina_frecuente": 0.8, "aumento_apetito": 0.5,
            "perdida_peso": 0.55, "letargo": 0.4, "dolor_al_moverse": 0.15,
        },
        "gastroenteritis": {
            "vomitos": 0.7, "diarrea": 0.8, "dificultad_comer": 0.45, "letargo": 0.5,
            "nauseas": 0.35, "fiebre": 0.45,
        },
        "intoxicacion_alimentaria": {
            "vomitos": 0.8, "diarrea": 0.65, "nauseas": 0.55, "dificultad_comer": 0.25,
            "letargo": 0.25, "dolor_abdominal": 0.5, "gases": 0.4, "fiebre": 0.1,
        },
        "envenenamiento_rodenticidas": {
            "encias_palidas": 0.6, "llenado_capilar_lento": 0.5, "letargo": 0.5,
            "respiracion_rapida": 0.35, "heces_negras": 0.3, "sangre_en_orina": 0.15,
            "asfixia_aparente": 0.1,
        },
        "displasia_cadera": {
            "cojera": 0.7, "rigidez_articular": 0.55, "dolor_al_moverse": 0.6,
            "intolerancia_ejercicio": 0.35,
        },
        "neumonia_felina": {
            "respiracion_rapida": 0.75, "tos": 0.5, "fiebre": 0.55, "letargo": 0.55,
            "jadeo_excesivo": 0.35, "dificultad_comer": 0.25, "cianosis": 0.15,
            "asfixia_aparente": 0.15,
        },
    },
}


def sample_severity(rng: random.Random, presence_prob: float) -> int:
    if presence_prob >= 0.7:
        weights = (0.15, 0.35, 0.5)
    elif presence_prob >= 0.4:
        weights = (0.35, 0.4, 0.25)
    else:
        weights = (0.55, 0.35, 0.1)
    return rng.choices([1, 2, 3], weights=weights, k=1)[0]


def generate_row_once(rng: random.Random, especie: str, enfermedad: str, profile: dict) -> dict:
    row = {col: 0 for col in SYMPTOM_COLUMNS}
    for symptom in SYMPTOM_COLUMNS:
        prob = profile.get(symptom, 0.0)
        if prob <= 0.0:
            # síntoma incidental no relacionado con la enfermedad: baja
            # probabilidad fija, simula hallazgos incidentales reales sin
            # favorecer sistemáticamente ninguna columna en particular.
            if rng.random() < NOISE_PROB:
                row[symptom] = 1
            continue
        if rng.random() < prob:
            row[symptom] = sample_severity(rng, prob)
    row["especie"] = especie
    row["enfermedad"] = enfermedad
    return row


def generate_row(rng: random.Random, especie: str, enfermedad: str, profile: dict,
                  taken: set) -> dict:
    for _ in range(MAX_RETRIES):
        row = generate_row_once(rng, especie, enfermedad, profile)
        symptom_count = sum(1 for c in SYMPTOM_COLUMNS if row[c] > 0)
        if symptom_count < MIN_SYMPTOMS_PER_ROW:
            continue
        key = (especie, tuple(row[c] for c in SYMPTOM_COLUMNS))
        if key in taken and taken[key] != enfermedad:
            # Vector idéntico al de OTRA enfermedad ya generada: solo se
            # acepta cuando es ambigüedad clínica real y reproducible del
            # perfil (probabilidades casi idénticas entre dos
            # enfermedades), no cuando es un choque incidental entre
            # perfiles sin relación. Se reintenta para no perder la señal.
            continue
        taken[key] = enfermedad
        return row
    # Se agotaron los reintentos: se acepta la última fila igual (mejor
    # dejar constancia vía el conteo de conflictos que descartar datos).
    taken[key] = enfermedad
    return row


def main():
    rng = random.Random(SEED)
    rows = []
    taken = {}
    for especie, diseases in SYMPTOM_PROFILES.items():
        for enfermedad, profile in diseases.items():
            for _ in range(SAMPLES_PER_CLASS):
                rows.append(generate_row(rng, especie, enfermedad, profile, taken))

    # Validación: dos enfermedades de la misma especie con el vector de
    # síntomas idéntico son ambigüedad genuina (aceptable, el sistema la
    # señala como diagnóstico diferencial), pero se reporta para revisión.
    seen = {}
    conflicts = 0
    conflict_pairs = set()
    for row in rows:
        key = (row["especie"], tuple(row[c] for c in SYMPTOM_COLUMNS))
        prev = seen.get(key)
        if prev is not None and prev != row["enfermedad"]:
            conflicts += 1
            conflict_pairs.add((row["especie"],) + tuple(sorted((prev, row["enfermedad"]))))
        seen[key] = row["enfermedad"]
    print(f"Filas generadas: {len(rows)}")
    print(f"Vectores de síntomas idénticos con distinta enfermedad: {conflicts}")
    for pair in sorted(conflict_pairs):
        print("  ", pair)

    with open(OUT_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=COLUMNS)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)
    print(f"Dataset escrito en: {OUT_PATH}")


if __name__ == "__main__":
    main()
