const CACHE_NAME = 'gym-init-v1';
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

// Instalacion: cachear archivos
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Estrategia: Cache First (prioriza velocidad y offline)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
