/**
 * Datos de contacto y operación de la clínica, en un solo lugar.
 * Antes estaban repetidos (dirección, teléfono, precio, horario) en el
 * footer, la reserva, el resultado y el panel de administración.
 */
export const CLINIC = {
  name: 'Clínica Veterinaria CityVet',
  shortName: 'CityVet',
  address: 'Jirón Los Ángeles 270 (media cuadra antes de la Reniec), Chincha Alta, Perú',
  phoneDisplay: '956 472 846',
  phoneHref: 'tel:+51956472846',
  /** Horario de atención (hora local, formato 24 h). */
  openingHour: 9,
  closingHour: 22,
  hoursLabel: '9:00 am – 10:00 pm',
  /** Costo de la consulta en soles. */
  consultationPrice: 50,
  directionsUrl:
    'https://www.google.com/maps/place/Cl%C3%ADnica+Veterinaria+CityVet/@-13.4156907,-76.1312858,19z/data=!4m6!3m5!1s0x911017c7fecdd98b:0xc590a4ac9f39ab48!8m2!3d-13.4156907!4d-76.1312858!16s%2Fg%2F11k53t33hw',
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1945.748074900762!2d-76.13347442296752!3d-13.415690686940866!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x911017c7fecdd98b%3A0xc590a4ac9f39ab48!2sCl%C3%ADnica%20Veterinaria%20CityVet!5e0!3m2!1ses!2spe!4v1709490000000!5m2!1ses!2spe',
} as const;

export function isClinicOpen(now: Date = new Date()): boolean {
  const hour = now.getHours();
  return hour >= CLINIC.openingHour && hour < CLINIC.closingHour;
}
