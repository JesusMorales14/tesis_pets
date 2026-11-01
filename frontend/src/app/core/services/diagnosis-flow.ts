import { Injectable } from '@angular/core';
import { PredictionResult } from './prediction';

export interface SelectedSymptom {
  key: string;
  severity: number;
  label: string;
}

export interface DiagnosisFlowState {
  /** Usuario que inició el flujo (null = consulta anónima). */
  ownerId: number | null;
  especie: 'perro' | 'gato';
  petId: number | null;
  petNombre: string | null;
  result?: PredictionResult;
  selectedSymptoms?: SelectedSymptom[];
  fecha?: string;
  hora?: string;
}

const STORAGE_KEY = 'vet_diagnosis_flow';

/**
 * Estado del flujo mascota → síntomas → resultado → horario → pago.
 *
 * Antes cada página le pasaba los datos a la siguiente por `history.state`,
 * que se pierde al recargar la página, al pasar por /login y en varios
 * botones de "volver". Se guarda en sessionStorage: sobrevive a un F5 y al
 * login intermedio, pero no queda guardado entre sesiones del navegador.
 */
@Injectable({ providedIn: 'root' })
export class DiagnosisFlowService {
  private current: DiagnosisFlowState | null = this.load();

  get state(): DiagnosisFlowState | null {
    return this.current;
  }

  /** Nuevo flujo: elegir una mascota registrada o una especie genérica. */
  start(especie: 'perro' | 'gato', ownerId: number | null, pet?: { id: number; nombre: string }): void {
    this.save({ ownerId, especie, petId: pet?.id ?? null, petNombre: pet?.nombre ?? null });
  }

  setResult(result: PredictionResult, selectedSymptoms: SelectedSymptom[]): void {
    if (!this.current) return;
    this.save({ ...this.current, result, selectedSymptoms, fecha: undefined, hora: undefined });
  }

  setSlot(fecha: string, hora: string): void {
    if (!this.current) return;
    this.save({ ...this.current, fecha, hora });
  }

  /** Mascota del flujo solo si pertenece al usuario actual. */
  petIdFor(userId: number | null | undefined): number | null {
    const s = this.current;
    if (!s?.petId || userId == null || s.ownerId !== userId) return null;
    return s.petId;
  }

  clear(): void {
    this.current = null;
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* storage no disponible */ }
  }

  private save(state: DiagnosisFlowState): void {
    this.current = state;
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* storage no disponible */ }
  }

  private load(): DiagnosisFlowState | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
