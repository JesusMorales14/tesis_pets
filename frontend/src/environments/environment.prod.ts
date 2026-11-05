export const environment = {
  production: true,
  // La API se sirve en el mismo dominio bajo /api (proxy de Nginx, ver
  // frontend/nginx.conf). Si se despliega en otro dominio, poner aquí su URL
  // completa y agregar este dominio a CORS_ORIGINS del backend.
  apiUrl: '/api',
};
