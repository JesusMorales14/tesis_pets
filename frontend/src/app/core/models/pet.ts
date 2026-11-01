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

export type VaccinationEstado = 'aplicada' | 'programada';

export interface Vaccination {
  id: number;
  nombre: string;
  estado: VaccinationEstado;
  fecha_aplicacion?: string | null;
  fecha_programada?: string | null;
  fecha_proxima?: string | null;
  refuerzo_meses: number;
  notas?: string | null;
}

export interface VaccinationBody {
  nombre: string;
  estado: VaccinationEstado;
  fecha_aplicacion?: string | null;
  fecha_programada?: string | null;
  refuerzo_meses: number;  // Obligatorio (1-60) para calcular fecha_proxima
  notas?: string | null;
}

/** Ficha clínica que ve el veterinario antes de la consulta (solo admin). */
export interface PetClinicalRecord extends Pet {
  vacunas: Vaccination[];
  diagnosticos: DiagnosisHistoryEntry[];
}
