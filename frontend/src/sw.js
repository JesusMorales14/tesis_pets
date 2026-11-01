// Service worker mínimo, solo para notificaciones push (Web Push / VAPID).
// No cachea nada — no es un service worker de PWA offline, así que no
// interfiere con el ciclo normal de desarrollo (ng serve / HMR).
//
// El contenido (título, texto, tipo, agrupación) lo define el backend en
// backend/notifications.py; aquí se decide cómo se presenta.

const ICON = '/assets/icon/notification-icon.png';   // logo CityVet a color
const BADGE = '/assets/icon/notification-badge.png'; // silueta monocroma (barra de estado de Android)

// Botón principal según el tipo de aviso.
const ACTIONS = {
  cita: { action: 'open', title: 'Ver mi cita' },
  pago: { action: 'open', title: 'Ver mis citas' },
  vacuna: { action: 'open', title: 'Ver cartilla' },
  admin: { action: 'open', title: 'Revisar comprobante' },
};

self.addEventListener('push', (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'CityVet', body: event.data.text() };
  }

  const title = payload.title || 'CityVet';
  const primary = ACTIONS[payload.type] || { action: 'open', title: 'Abrir CityVet' };
  const options = {
    body: payload.body || '',
    icon: ICON,
    badge: BADGE,
    lang: 'es-PE',
    dir: 'ltr',
    timestamp: Date.now(),
    // Mismo asunto (p. ej. la misma cita): el aviso nuevo reemplaza al
    // anterior en lugar de acumularse, y vuelve a sonar/vibrar.
    tag: payload.tag || undefined,
    renotify: !!payload.tag,
    // Los urgentes (pago rechazado, vacuna pendiente…) no se ocultan solos.
    requireInteraction: !!payload.urgent,
    vibrate: payload.urgent ? [200, 100, 200] : [120],
    actions: [primary, { action: 'close', title: 'Cerrar' }],
    data: { url: payload.url || '/' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') return;

  const target = new URL(event.notification.data?.url || '/', self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      // Si la app ya está abierta, se reutiliza esa pestaña en la pantalla correcta.
      const appWindow = windows.find((w) => new URL(w.url).origin === self.location.origin);
      if (appWindow) {
        return appWindow.navigate(target).then((w) => (w || appWindow).focus()).catch(() => appWindow.focus());
      }
      return self.clients.openWindow(target);
    }),
  );
});
