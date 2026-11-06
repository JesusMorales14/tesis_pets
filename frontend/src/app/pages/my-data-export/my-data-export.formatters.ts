import { SEVERITY_LABELS } from '@core/data/symptoms.data';
import { MyDataVaccination } from '@core/models/my-data-export';

/**
 * Formateo de la exportación de datos personales, compartido por la vista
 * y el PDF para que ambos muestren exactamente lo mismo.
 */

/** Timestamp ISO → "24 de octubre de 2026". */
export function formatLongTimestamp(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Fechas sin hora ('YYYY-MM-DD'): se leen como medianoche local. Con
// new Date('YYYY-MM-DD') serían medianoche UTC, un día antes en Perú.
/** 'YYYY-MM-DD' → "24 oct 2026". */
export function formatCalendarDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** "aplicada 24 oct 2026 · refuerzo 24 oct 2027" o "programada para 13 nov 2026". */
export function vaccineLabel(v: MyDataVaccination): string {
  if (v.estado === 'programada') {
    return v.fecha_programada ? `programada para ${formatCalendarDate(v.fecha_programada)}` : 'programada';
  }
  const aplicada = v.fecha_aplicacion ? `aplicada ${formatCalendarDate(v.fecha_aplicacion)}` : 'aplicada';
  return v.fecha_proxima ? `${aplicada} · refuerzo ${formatCalendarDate(v.fecha_proxima)}` : aplicada;
}

export function symptomEntries(sintomas: Record<string, number>): { key: string; severidad: string }[] {
  return Object.entries(sintomas)
    .filter(([, v]) => v > 0)
    .map(([key, v]) => ({ key: key.replace(/_/g, ' '), severidad: SEVERITY_LABELS[v] ?? '' }));
}

export function paymentLabel(metodo: string): string {
  return metodo === 'yape' ? 'Yape' : 'Transferencia bancaria';
}

export function diagnosisText(diagnostico: string): string {
  return (diagnostico ?? '').replace(/_/g, ' ');
}
