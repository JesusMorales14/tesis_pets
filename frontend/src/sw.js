// Service worker mínimo, solo para notificaciones push (Web Push / VAPID).
// No cachea nada — no es un service worker de PWA offline, así que no
// interfiere con el ciclo normal de desarrollo (ng serve / HMR).

self.addEventListener('push', (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'CityVet', body: event.data.text() };
  }

  const title = payload.title || 'CityVet';
  const options = {
    body: payload.body || '',
    icon: '/assets/icon/favicon.png',
    badge: '/assets/icon/favicon.png',
    data: { url: payload.url || '/' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      const existing = clientsArr.find((c) => c.url.includes(url));
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    }),
  );
});
