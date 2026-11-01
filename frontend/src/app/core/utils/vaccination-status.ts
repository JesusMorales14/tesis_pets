import { Vaccination } from '../models/pet';

export type VaccinationStatus = 'vencida' | 'proxima' | 'al-dia' | 'sin-fecha';

/**
 * Semáforo de la cartilla de vacunación (perfil del dueño y ficha clínica
 * del veterinario):
 * - Verde (al-día): la vacuna ya fue aplicada.
 * - Amarillo (próxima): vacuna programada cuya fecha aún no llega.
 * - Rojo (vencida): vacuna programada cuya fecha es hoy o ya pasó sin
 *   haberse aplicado.
 */
export function vaccinationStatus(v: Vaccination): VaccinationStatus {
  if (v.estado === 'aplicada') return 'al-dia';
  if (!v.fecha_programada) return 'sin-fecha';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const programada = new Date(v.fecha_programada + 'T00:00:00');
  return programada.getTime() <= today.getTime() ? 'vencida' : 'proxima';
}

export function vaccinationStatusLabel(status: VaccinationStatus): string {
  return { vencida: 'Urgente', proxima: 'Próxima', 'al-dia': 'Al día', 'sin-fecha': 'Sin recordatorio' }[status];
}
