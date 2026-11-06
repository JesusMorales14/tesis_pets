/**
 * Indica si un JWT ya expiró leyendo su claim `exp` (sin verificar la
 * firma: eso lo hace el backend). Un token ilegible se trata como no
 * expirado para que sea el servidor quien lo rechace con 401.
 */
export function isJwtExpired(token: string | null): boolean {
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    if (typeof payload.exp !== 'number') return false;
    return payload.exp * 1000 < Date.now();
  } catch {
    return false;
  }
}
