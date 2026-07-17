export interface Pet {
  id: number;
  nombre: string;
  especie: 'perro' | 'gato';
  raza?: string | null;
  edad_meses?: number | null;
  peso_kg?: number | null;
}

export interface PetBody {
  nombre: string;
  especie: 'perro' | 'gato';
  raza?: string | null;
  edad_meses?: number | null;
  peso_kg?: number | null;
}

export interface DiagnosisHistoryEntry {
  id: number;
  diagnostico: string;
  probabilidad: number;
  diagnostico_alternativo?: string | null;
  probabilidad_alternativa?: number | null;
  gravedad: string;
  sintomas: Record<string, number>;
  created_at: string;
}

export interface VaccineScheduleEntry {
  nombre: string;
  refuerzo_meses: number;
}

export interface Vaccination {
  id: number;
  nombre: string;
  fecha_aplicacion: string;
  fecha_proxima?: string | null;
  notas?: string | null;
}

export interface VaccinationBody {
  nombre: string;
  fecha_aplicacion: string;
  refuerzo_meses?: number | null;
  notas?: string | null;
}
