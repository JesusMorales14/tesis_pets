/** Contrato de /predict (modelo de IA de diagnóstico). */

export interface PredictionRequest {
  especie: string;
  pet_id?: number | null;
  [key: string]: string | number | null | undefined;
}

export interface PredictionResult {
  especie: string;
  diagnostico: string;
  probabilidad: number;
  fase: number;
  gravedad: string;
  /** Segundo diagnóstico más probable, presente solo cuando está cerca del principal (caso ambiguo). */
  diagnostico_alternativo?: string | null;
  probabilidad_alternativa?: number | null;
  /** Tercer diagnóstico, presente solo cuando el caso es lo bastante ambiguo (siempre junto al segundo). */
  diagnostico_tercero?: string | null;
  probabilidad_tercero?: number | null;
  /** Presentes solo si la petición incluyó pet_id: el diagnóstico quedó guardado en el historial de esa mascota. */
  guardado_en_historial?: boolean;
  mascota?: string;
  pet_id?: number;
}
