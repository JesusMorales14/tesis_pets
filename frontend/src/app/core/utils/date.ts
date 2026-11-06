/**
 * Utilidades de fecha compartidas por toda la app.
 *
 * Todas las fechas de la API llegan como 'YYYY-MM-DD' (día de calendario,
 * sin zona horaria) o como ISO con zona (timestamps en UTC). Para los días
 * de calendario se construye la fecha en hora local ('T00:00:00'): con
 * `new Date('YYYY-MM-DD')` el navegador la interpreta en UTC y, en Perú
 * (UTC-5), mostraría el día anterior.
 */

export const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'] as const;
export const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const;
export const DAYS_LONG = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'] as const;

/** Una opción del selector horizontal de días (agenda y reserva). */
export interface DateOption {
  date: Date;
  isoDate: string;
  dayNum: string;
  dayAbbr: string;
  monthAbbr: string;
  isToday: boolean;
}

/**
 * Fecha 'YYYY-MM-DD' en la zona horaria del dispositivo.
 *
 * No usar `toISOString()` para esto: convierte a UTC, y en Perú (UTC-5)
 * a partir de las 19:00 devuelve ya el día siguiente.
 */
export function toLocalIsoDate(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** 'YYYY-MM-DD' → Date a medianoche local. */
export function parseLocalDate(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00`);
}

/** 'YYYY-MM-DD' → "25 Oct 2026". */
export function formatShortDate(isoDate: string): string {
  const d = parseLocalDate(isoDate);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

/** Timestamp ISO (con zona) → "25 Oct 2026" en hora local. */
export function formatTimestampDate(isoTimestamp: string): string {
  const d = new Date(isoTimestamp);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

/** 'YYYY-MM-DD' → "Dom 25 Oct 2026". */
export function formatWeekdayDate(isoDate: string): string {
  const d = parseLocalDate(isoDate);
  return `${DAYS_SHORT[d.getDay()]} ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

/** 'YYYY-MM-DD' → "Domingo, 25 de OCT 2026". */
export function formatLongDate(isoDate: string): string {
  const d = parseLocalDate(isoDate);
  return `${DAYS_LONG[d.getDay()]}, ${d.getDate()} de ${MONTHS_SHORT[d.getMonth()].toUpperCase()} ${d.getFullYear()}`;
}

/** Date → "OCT 2026". */
export function formatMonthYear(d: Date): string {
  return `${MONTHS_SHORT[d.getMonth()].toUpperCase()} ${d.getFullYear()}`;
}

export function isTomorrow(isoDate: string, now: Date = new Date()): boolean {
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isoDate === toLocalIsoDate(tomorrow);
}

/** Próximos `count` días a partir de hoy, para el selector de fechas. */
export function buildDateOptions(count: number, now: Date = new Date()): DateOption[] {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      date: d,
      isoDate: toLocalIsoDate(d),
      dayNum: d.getDate().toString(),
      dayAbbr: DAYS_SHORT[d.getDay()].toUpperCase(),
      monthAbbr: MONTHS_SHORT[d.getMonth()].toUpperCase(),
      isToday: i === 0,
    };
  });
}
