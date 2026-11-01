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
