import { Appointment } from '@core/models/appointment';

export type EspecieFilter = 'todas' | 'perro' | 'gato';
export type AgendaOrder = 'gravedad' | 'hora';

/** Prioridad clínica: lo más grave primero. */
const GRAVEDAD_RANK: Record<string, number> = { grave: 0, moderada: 1, leve: 2 };
const UNKNOWN_RANK = 3;

/**
 * Agenda del día filtrada por especie y ordenada (HU17):
 * 1. las canceladas siempre al final (ya no requieren atención);
 * 2. por gravedad (si se eligió) para preparar primero los casos graves;
 * 3. por hora.
 */
export function organizeAgenda(list: Appointment[], especie: EspecieFilter, order: AgendaOrder): Appointment[] {
  return list
    .filter((a) => especie === 'todas' || a.especie === especie)
    .sort((x, y) => {
      const cancelled = Number(x.estado === 'cancelada') - Number(y.estado === 'cancelada');
      if (cancelled) return cancelled;
      if (order === 'gravedad') {
        const grav = (GRAVEDAD_RANK[x.gravedad] ?? UNKNOWN_RANK) - (GRAVEDAD_RANK[y.gravedad] ?? UNKNOWN_RANK);
        if (grav) return grav;
      }
      return x.hora.localeCompare(y.hora);
    });
}

export function countByEspecie(list: Appointment[], especie: EspecieFilter): number {
  return especie === 'todas' ? list.length : list.filter((a) => a.especie === especie).length;
}

export function paginate<T>(list: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return list.slice(start, start + pageSize);
}
