/**
 * ============================================================
 *  Router — Manejador de Navegacion SPA
 * ============================================================
 */

class Router {
  constructor() {
    this.routes = {
      '#dashboard':   'dashboard-view',
      '#exercises':   'exercises-view',
      '#routines':    'routines-view',
      '#sessions':    'sessions-view',
      '#session/new': 'active-session-view',
    };
    // ID correcto del contenedor principal definido en index.html
    this.outlet = document.getElementById('app-outlet');
  }

  init() {
    window.addEventListener('hashchange', () => this._handleRoute());

    // Si no hay hash, redirigir al dashboard
    if (!window.location.hash || window.location.hash === '#') {
      window.location.hash = '#dashboard';
    } else {
      this._handleRoute();
    }
  }

  async _handleRoute() {
    const hash = window.location.hash || '#dashboard';
    let componentName = null;
    let param = null;

    // Ruta dinamica: #session/123
    if (hash.startsWith('#session/') && hash !== '#session/new') {
      componentName = 'session-detail-view';
      param = hash.split('/')[1];
    } else {
      componentName = this.routes[hash] || 'dashboard-view';
    }

    // Limpiar contenido anterior
    this.outlet.innerHTML = '';

    // Crear e insertar el nuevo componente
    const view = document.createElement(componentName);
    this.outlet.appendChild(view);

    // Cargar datos si el componente los soporta
    if (typeof view.loadData === 'function') {
      try {
        await view.loadData(param);
      } catch (err) {
        console.error(`Error en loadData de ${componentName}:`, err);
      }
    }

    // Notificar al nav para resaltar el item activo
    const activeHash = (componentName === 'session-detail-view') ? '#sessions' : hash;
    document.dispatchEvent(new CustomEvent('route-changed', { detail: { hash: activeHash } }));

    window.scrollTo(0, 0);
  }
}

const appRouter = new Router();
