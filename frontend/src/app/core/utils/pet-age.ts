/** Edad en meses → texto legible: 27 → "2 años y 3 meses"; null → "Sin dato". */
export function formatPetAge(meses: number | null | undefined): string {
  if (meses == null) return 'Sin dato';
  const anios = Math.floor(meses / 12);
  const resto = meses % 12;
  const partes: string[] = [];
  if (anios) partes.push(`${anios} ${anios === 1 ? 'año' : 'años'}`);
  if (resto || !anios) partes.push(`${resto} ${resto === 1 ? 'mes' : 'meses'}`);
  return partes.join(' y ');
}
