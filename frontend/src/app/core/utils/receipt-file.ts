/**
 * Reglas del comprobante de pago: las mismas que valida el backend
 * (backend/core/config.py → ALLOWED_IMAGE_TYPES / MAX_UPLOAD_BYTES), para
 * avisar al elegir el archivo y no recién al enviar la reserva.
 */
export const RECEIPT_TYPES: Readonly<Record<string, string>> = {
  'image/png': 'PNG',
  'image/jpeg': 'JPG',
  'image/webp': 'WEBP',
};
export const RECEIPT_MAX_BYTES = 5 * 1024 * 1024;
export const RECEIPT_ACCEPT = Object.keys(RECEIPT_TYPES).join(',');

/** Devuelve el mensaje de error, o null si el archivo es válido. */
export function validateReceiptFile(file: Pick<File, 'type' | 'size'>): string | null {
  if (!RECEIPT_TYPES[file.type]) return 'El comprobante debe ser una imagen PNG, JPG o WEBP.';
  if (file.size > RECEIPT_MAX_BYTES) return 'La imagen del comprobante no debe superar los 5 MB.';
  return null;
}

/** "Imagen PNG · 245 KB" */
export function describeReceiptFile(file: Pick<File, 'type' | 'size'>): string {
  const kb = file.size / 1024;
  const size = kb < 1024 ? `${Math.max(1, Math.round(kb))} KB` : `${(kb / 1024).toFixed(1)} MB`;
  return `Imagen ${RECEIPT_TYPES[file.type] ?? ''} · ${size}`;
}
