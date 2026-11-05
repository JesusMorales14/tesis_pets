import { HttpErrorResponse } from '@angular/common/http';

/**
 * Mensaje legible de un error HTTP de la API.
 *
 * FastAPI devuelve `{ detail: string }` en los errores de negocio y
 * `{ detail: [...] }` en los de validación (422). Antes cada componente
 * repetía `err?.error?.detail || '...'`, que con un 422 mostraba
 * "[object Object]".
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'No se pudo conectar con el servidor. Revisa tu conexión.';
    const detail = (err.error as { detail?: unknown } | null)?.detail;
    if (typeof detail === 'string' && detail.trim()) return detail;
  }
  return fallback;
}
