const CACHE_NAME = 'gym-init-v4';
const ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/db.js',
  './js/seed.js',
  './js/utils.js',
  './js/router.js',
  './js/components/app-nav.js',
  './js/components/dashboard-view.js',
  './js/components/exercises-view.js',
  './js/components/routines-view.js',
  './js/components/sessions-view.js',
  './js/components/active-session-view.js',
  './js/components/session-detail-view.js',
  './js/components/profile-view.js',
  './js/components/loading-state.js',
  './js/components/error-state.js',
  './js/components/confirm-dialog.js',
  './js/components/exercise-modal.js',
  './js/components/routine-modal.js'
];

// Instalacion: cachear archivos y tomar control INMEDIATAMENTE
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()) // <- toma control sin esperar
  );
});

// Activacion: borrar caches viejas y reclamar todas las pestanas
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim()) // <- controla pestanas ya abiertas
  );
});

// Estrategia: Network First para JS/HTML (siempre intenta lo nuevo),
// Cache fallback solo si no hay conexion
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Para archivos JS, HTML y CSS: Network First
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.html') || url.pathname.endsWith('.css') || url.pathname === '/') {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          // Actualizar cache con la respuesta nueva
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request)) // fallback offline
    );
    return;
  }

  // Para el resto: Cache First (imagenes, iconos, etc.)
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
