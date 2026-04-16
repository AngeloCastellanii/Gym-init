/**
 * ============================================================
 *  Router â€” Navegacion SPA basada en hash para Gym Init
 *
 *  Maneja el registro de rutas, escucha cambios de hash,
 *  soporta rutas parametrizadas (#session/:id) y
 *  gestiona el montaje y desmontaje de vistas.
 *
 *  Uso:
 *    const router = new Router('#app-outlet');
 *    router.on('#dashboard',    'dashboard-view');
 *    router.on('#session/:id',  'session-detail');
 *    router.start();
 * ============================================================
 */

class Router {

  /**
   * @param {string} outletSelector â€” Selector CSS del contenedor
   *        donde se montaran las vistas.
   */
  constructor(outletSelector) {
    /** @type {HTMLElement} Elemento contenedor de vistas */
    this.outlet = document.querySelector(outletSelector);

    /** @type {Array<{pattern:string, regex:RegExp, tagName:string, paramNames:string[]}>} */
    this.routes = [];

    /** @type {HTMLElement|null} Vista actualmente montada */
    this.currentView = null;

    // Escucha cambios de hash
    window.addEventListener('hashchange', () => this._resolve());
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  //  API PUBLICA
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  /**
   * Registra un mapeo ruta â†’ componente.
   * Soporta patrones parametrizados como '#session/:id'.
   *
   * @param {string} pattern  â€” Patron de hash (ej: '#exercises')
   * @param {string} tagName  â€” Nombre del Custom Element
   */
  on(pattern, tagName) {
    // Convierte segmentos :param en grupos de captura para regex
    const regexStr = '^' + pattern.replace(/:[^/]+/g, '([^/]+)') + '$';
    const paramNames = (pattern.match(/:[^/]+/g) || []).map(p => p.slice(1));
    this.routes.push({
      pattern,
      regex: new RegExp(regexStr),
      tagName,
      paramNames
    });
  }

  /**
   * Inicia el router â€” resuelve el hash actual o navega
   * a la ruta por defecto (#dashboard).
   */
  start() {
    if (!window.location.hash) {
      window.location.hash = '#dashboard';
    } else {
      this._resolve();
    }
  }

  /**
   * Navega a una ruta de forma programatica.
   * @param {string} hash â€” ej: '#exercises' o '#session/abc123'
   */
  navigate(hash) {
    window.location.hash = hash;
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  //  METODOS INTERNOS
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  /**
   * Compara el hash actual con las rutas registradas
   * y monta el componente correspondiente.
   */
  _resolve() {
    const hash = window.location.hash || '#dashboard';

    for (const route of this.routes) {
      const match = hash.match(route.regex);
      if (match) {
        // Extrae los parametros nombrados de la URL
        const params = {};
        route.paramNames.forEach((name, i) => {
          params[name] = match[i + 1];
        });
        this._mount(route.tagName, params, hash);
        return;
      }
    }

    // Sin ruta coincidente â†’ ir al dashboard
    window.location.hash = '#dashboard';
  }

  /**
   * Desmonta la vista actual y monta una nueva.
   *
   * @param {string} tagName â€” Custom element a crear
   * @param {Object} params  â€” Parametros de ruta (ej: { id: '123' })
   * @param {string} hash    â€” Hash completo actual
   */
  _mount(tagName, params, hash) {
    // Destruye la vista anterior
    this.outlet.innerHTML = '';
    this.currentView = null;

    // Crea y configura la nueva vista
    const view = document.createElement(tagName);

    // Pasa los parametros de ruta como propiedad del componente
    if (Object.keys(params).length > 0) {
      view.routeParams = params;
    }

    // Animacion de entrada
    view.classList.add('view-enter');

    // Monta en el DOM
    this.outlet.appendChild(view);
    this.currentView = view;

    // Si el componente expone loadData(), lo llama
    // (asi las vistas cargan datos async de IndexedDB tras montarse)
    if (typeof view.loadData === 'function') {
      view.loadData(params);
    }

    // Vuelve al inicio del contenedor al navegar
    this.outlet.scrollTop = 0;

    // Dispara evento para que otros componentes (nav) reaccionen
    document.dispatchEvent(new CustomEvent('route-changed', {
      detail: { hash, params }
    }));
  }
}
