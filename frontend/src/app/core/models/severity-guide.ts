/**
 * Guía de referencia para que el dueño elija la gravedad correcta de cada
 * síntoma. Sin esto, "leve/moderado/grave" es subjetivo y dos dueños
 * describiendo el mismo cuadro clínico podrían elegir niveles distintos —
 * lo cual degrada directamente la precisión del modelo, que fue entrenado
 * con una escala de severidad consistente (ver backend/data/SOURCES.md).
 * Las descripciones son señales observables sin entrenamiento veterinario,
 * no diagnósticos.
 */
export interface SeverityGuide {
  leve: string;
  moderado: string;
  grave: string;
}
