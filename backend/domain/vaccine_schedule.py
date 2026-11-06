"""Esquema de vacunas de referencia para perros y gatos.

Basado en las vacunas que SENASA (Servicio Nacional de Sanidad Agraria del
Perú) recomienda para mascotas — parvovirus, moquillo, hepatitis y
leptospirosis (combinadas) más rabia en perros; triple felina y rabia en
gatos — y en el intervalo de refuerzo anual estándar usado en la práctica
veterinaria de pequeños animales.

Esto es un esquema GENERAL de referencia, no el protocolo específico de
ninguna clínica. La primera serie en cachorros/gatitos suele requerir
varias dosis cada 3-4 semanas antes del primer refuerzo anual — eso
depende del criterio del veterinario tratante y no se modela aquí.
"""

VACCINE_SCHEDULE = {
    "perro": [
        {
            "nombre": "Múltiple (Parvovirus, Moquillo, Hepatitis, Leptospirosis)",
            "refuerzo_meses": 12,
        },
        {"nombre": "Rabia", "refuerzo_meses": 12},
    ],
    "gato": [
        {
            "nombre": "Triple felina (Panleucopenia, Rinotraqueitis, Calicivirus)",
            "refuerzo_meses": 12,
        },
        {"nombre": "Rabia", "refuerzo_meses": 12},
    ],
}
