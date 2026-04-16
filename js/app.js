/**
 * ============================================================
 *  App.js — Punto de entrada de Gym-Init
 *
 *  Maneja la inicialización de la base de datos y la 
 *  configuración del Router. Todas las vistas están en 
 *  js/components/ para mantener el código limpio.
 * ============================================================
 */

(async function initApp() {
  // 1. Inicializa IndexedDB
  try {
    await GymDB.init();
    console.log('%c📦 Base de Datos (Gym-Init) Lista', 'color: #2563EB; font-weight: bold;');
  } catch (err) {
    console.error('Error al inicializar la base de datos:', err);
  }

  // 2. Configura el Router SPA
  const router = new Router('#app-outlet');

  // Registro de rutas -> Componentes (Custom Elements)
  router.on('#dashboard',    'dashboard-view');
  router.on('#exercises',    'exercises-view');
  router.on('#routines',     'routines-view');
  router.on('#sessions',     'sessions-view');
  router.on('#session/new',  'active-session-view');

  // Expone el router globalmente por si se necesita navegar por código
  window.gymRouter = router;

  // 3. Arranca la Navegación
  router.start();

  console.log(
    '%c🏋️ Gym Init v1.0 %c— Ready',
    'color: #2563EB; font-weight: bold; font-size: 14px;',
    'color: #9CA3AF; font-size: 12px;'
  );
})();
