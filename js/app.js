/**
 * ============================================================
 *  App.js â€” Arranque de la aplicacion Gym Init
 *
 *  1. Define la vista Dashboard (placeholder con KPIs y graficos).
 *  2. Registra todos los Custom Elements.
 *  3. Configura e inicia el Router SPA.
 *
 *  Las vistas de Ejercicios y Rutinas estan en sus propios
 *  archivos en js/components/ y se cargan desde index.html.
 * ============================================================
 */

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  VISTA: Dashboard (#dashboard)
//  Placeholder con tarjetas KPI y slots de graficos
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

class DashboardView extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
  }

  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    this.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Panel de Control</h1>
          <p class="page-subtitle">Resumen de tu progreso de entrenamiento</p>
        </div>
        <button class="btn btn-glass" id="unit-toggle">
          <i class="ph-bold ph-scales"></i>
          Unidad: <span id="unit-label">${unitLabel()}</span>
        </button>
      </div>
      <div class="view-content">
        <!-- Fila de tarjetas KPI -->
        <div class="kpi-grid">
          ${this._kpiCard('Total Sesiones', 'â€”', 'ph-calendar-check', 'var(--accent-light)')}
          ${this._kpiCard('Racha Actual', 'â€”', 'ph-fire', 'var(--success-light)')}
          ${this._kpiCard('Vol. Total', 'â€”', 'ph-barbell', '#f97316')}
          ${this._kpiCard('Ejercicios', 'â€”', 'ph-list-checks', '#a78bfa')}
        </div>

        <!-- Cuadricula de graficos -->
        <div class="charts-grid">
          ${this._chartPlaceholder('Frecuencia Semanal', 'ph-chart-bar', 'var(--accent-light)')}
          ${this._chartPlaceholder('Progreso de Fuerza', 'ph-trend-up', 'var(--success-light)')}
          ${this._chartPlaceholder('Distribucion Muscular', 'ph-chart-pie-slice', '#f97316')}
          ${this._chartPlaceholder('Volumen Total', 'ph-chart-line-up', '#a78bfa')}
        </div>

        <!-- Sesiones recientes -->
        <div class="glass-card" style="padding:24px;">
          <h3 style="font-size:16px; font-weight:700; margin-bottom:16px; display:flex; align-items:center; gap:8px;">
            <i class="ph-bold ph-clock-counter-clockwise" style="color:var(--accent-light);"></i>
            Sesiones Recientes
          </h3>
          <div class="empty-state" style="padding:32px;">
            <i class="ph ph-clipboard icon" style="font-size:36px;"></i>
            <p>Aun no hay sesiones registradas</p>
          </div>
        </div>
      </div>
    `;

    // Script para cambiar unidades (Kg/Lb)
    this.querySelector('#unit-toggle').addEventListener('click', () => {
      const current = getWeightUnit();
      const next = current === 'kg' ? 'lb' : 'kg';
      setWeightUnit(next);
      this.querySelector('#unit-label').textContent = unitLabel();
      console.log(`Unidades cambiadas a: ${next}`);
    });
  }

  /** Genera una tarjeta KPI de estadistica */
  _kpiCard(title, value, icon, color) {
    return `
      <div class="glass-card hover-lift" style="padding:20px; cursor:default;">
        <p style="font-size:11px; color:var(--text-secondary); margin-bottom:10px; text-transform:uppercase; letter-spacing:0.06em; font-weight:600;">
          ${title}
        </p>
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <span style="font-size:30px; font-weight:900; color:${color}; letter-spacing:-1px;">${value}</span>
          <i class="ph-bold ${icon}" style="font-size:26px; color:${color}; opacity:0.4;"></i>
        </div>
      </div>
    `;
  }

  /** Genera una tarjeta placeholder para un grafico */
  _chartPlaceholder(title, icon, color) {
    return `
      <div class="glass-card" style="padding:20px;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:16px;">
          <i class="ph-bold ${icon}" style="color:${color};"></i>
          <span style="font-weight:600; font-size:14px;">${title}</span>
        </div>
        <div style="height:220px; display:flex; align-items:center; justify-content:center; border-radius:var(--radius-md); background:rgba(255,255,255,0.015); border:1px dashed var(--border);">
          <p style="color:var(--text-muted); font-size:13px;">
            <i class="ph ph-chart-line" style="margin-right:4px;"></i>
            Sin datos suficientes
          </p>
        </div>
      </div>
    `;
  }
}


// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  VISTA: Sesiones (#sessions)
//  Placeholder historial
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

class SessionsView extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
  }

  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    this.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Historial de Sesiones</h1>
      </div>
      <div class="view-content">
        <div class="glass-card" style="padding:24px;">
          <div class="empty-state">
            <i class="ph-bold ph-calendar-check icon"></i>
            <p>Aun no hay sesiones en el historial</p>
          </div>
        </div>
      </div>
    `;
  }
}


// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  VISTA: Entrenamiento Activo (#session/new)
//  Placeholder con estilo de modal de configuracion
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

class ActiveSessionView extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
  }

  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    this.innerHTML = `
      <div class="view-content" style="display:flex; align-items:center; justify-content:center; min-height:80vh;">
        <div class="glass-card" style="padding:48px 40px; text-align:center; max-width:440px; width:100%;">
          <div style="width:80px; height:80px; border-radius:var(--radius-lg); background:linear-gradient(135deg, var(--accent), var(--accent-light)); display:flex; align-items:center; justify-content:center; margin:0 auto 20px; box-shadow: 0 8px 32px var(--accent-glow);">
            <i class="ph-fill ph-barbell" style="font-size:40px; color:#fff;"></i>
          </div>
          <h2 style="font-size:24px; font-weight:800; margin-bottom:8px; letter-spacing:-0.5px;">Modo Entrenamiento</h2>
          <p style="color:var(--text-secondary); margin-bottom:28px; font-size:14px;">Selecciona una rutina para comenzar tu sesion</p>
          <select class="form-select" style="margin-bottom:20px; text-align:center;">
            <option>â€” Seleccionar rutina â€”</option>
          </select>
          <button class="btn btn-success" style="width:100%; justify-content:center; padding:16px; font-size:16px; font-weight:700; letter-spacing:0.5px;">
            <i class="ph-bold ph-play"></i>
            INICIAR SESION
          </button>

        </div>
      </div>
    `;
  }
}


// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  REGISTRO DE CUSTOM ELEMENTS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

customElements.define('dashboard-view',       DashboardView);
customElements.define('sessions-view',        SessionsView);
customElements.define('active-session-view',  ActiveSessionView);


// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  INICIALIZACION DEL ROUTER Y ARRANQUE
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

(async function initApp() {
  // Inicializa IndexedDB (siembra datos en el primer uso)
  try {
    await GymDB.init();
    console.log('%cðŸ“¦ Base de datos lista', 'color: #3b82f6;');
  } catch (err) {
    console.error('Error al inicializar la base de datos:', err);
  }

  // Crea la instancia del router apuntando al contenedor principal
  const router = new Router('#app-outlet');

  // Registra todas las rutas
  router.on('#dashboard',    'dashboard-view');
  router.on('#exercises',    'exercises-view');
  router.on('#routines',     'routines-view');
  router.on('#sessions',     'sessions-view');
  router.on('#session/new',  'active-session-view');

  // Rutas parametrizadas (se implementaran en fases posteriores)
  // router.on('#session/:id',  'session-detail-view');
  // router.on('#routine/:id',  'routine-detail-view');

  // Expone el router globalmente para navegacion programatica desde cualquier componente
  window.gymRouter = router;

  // Inicia la aplicacion
  router.start();

  console.log(
    '%cðŸ‹ï¸ Gym Init v1.0 %câ€” Ready',
    'color: #2563EB; font-weight: bold; font-size: 14px;',
    'color: #9CA3AF; font-size: 12px;'
  );
})();
