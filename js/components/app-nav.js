/**
 * ============================================================
 *  <app-nav> — Componente principal de navegacion
 *
 *  Renderiza dos layouts segun el ancho de la ventana:
 *    - Desktop (>= 768px) → Barra lateral izquierda con logo + menu vertical
 *    - Movil  (< 768px)  → Barra de navegacion fija en la parte inferior
 *
 *  Ambos se renderizan simultaneamente; el CSS muestra/oculta
 *  el apropiado mediante media queries.
 *
 *  Comunicacion:
 *    Escucha → CustomEvent 'route-changed' (emitido por el Router)
 *    Emite   → cambios de hash via window.location.hash
 * ============================================================
 */

class AppNav extends HTMLElement {
  constructor() {
    super();

    // Configuracion de los elementos de navegacion
    this._items = [
      { hash: '#dashboard',   icon: 'ph-chart-line-up',   label: 'Dashboard'  },
      { hash: '#exercises',   icon: 'ph-barbell',         label: 'Ejercicios' },
      { hash: '#routines',    icon: 'ph-clipboard-text',  label: 'Rutinas'    },
      { hash: '#sessions',    icon: 'ph-calendar-check',  label: 'Sesiones'   },
      { hash: '#session/new', icon: 'ph-play-circle',     label: 'Entrenar'   },
    ];

    // Construye el DOM en el constructor (requisito del proyecto)
    this.innerHTML = this._buildHTML();

    // Delegacion de eventos: maneja todos los clics en items de nav
    this.addEventListener('click', (e) => {
      const link = e.target.closest('[data-route]');
      if (link) {
        e.preventDefault();
        window.location.hash = link.dataset.route;
      }
    });

    // Escucha cambios de ruta para actualizar el estado activo
    document.addEventListener('route-changed', (e) => {
      this._highlightActive(e.detail.hash);
    });
  }

  // ════════════════════════════════════════════
  //  CONSTRUCCION DEL DOM
  // ════════════════════════════════════════════

  /**
   * Genera el HTML completo para sidebar + bottom nav.
   * @returns {string} Cadena HTML
   */
  _buildHTML() {
    // Construye lista de items — reutilizada en sidebar y bottom nav
    const sidebarItems = this._items.map(item => `
      <a class="nav-item" data-route="${item.hash}" href="${item.hash}" aria-label="${item.label}">
        <i class="ph-bold ${item.icon}"></i>
        <span class="nav-label">${item.label}</span>
      </a>
    `).join('');

    const bottomItems = this._items.map(item => `
      <a class="nav-item" data-route="${item.hash}" href="${item.hash}" aria-label="${item.label}">
        <i class="ph-bold ${item.icon}"></i>
        <span class="nav-label">${item.label}</span>
      </a>
    `).join('');

    return `
      <!-- Sidebar (visible en desktop >= 768px) -->
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
          <a class="sidebar-logo" data-route="#dashboard" href="#dashboard" aria-label="Ir al Dashboard">
            <div class="sidebar-logo-icon">
              <i class="ph-fill ph-barbell"></i>
            </div>
            <span class="sidebar-logo-text">Gym<span class="logo-accent">init</span></span>
          </a>
        </div>
        <div class="sidebar-divider"></div>
        <nav class="sidebar-menu">
          ${sidebarItems}
        </nav>
        <!-- Espaciador para empujar el footer al fondo -->
        <div style="flex:1;"></div>
        <div class="sidebar-footer">
          <div class="sidebar-divider"></div>
          <p class="sidebar-footer-text">
            <i class="ph ph-code"></i> Gym Init v1.0
          </p>
        </div>
      </aside>

      <!-- Bottom Nav (visible en movil < 768px) -->
      <nav class="bottom-nav" id="bottom-nav">
        ${bottomItems}
      </nav>
    `;
  }

  // ════════════════════════════════════════════
  //  GESTION DEL ESTADO ACTIVO
  // ════════════════════════════════════════════

  /**
   * Resalta el item de nav que coincide con el hash de ruta actual.
   * Maneja casos especiales para rutas parametrizadas:
   *   #session/abc123 → resalta "Sesiones"
   *   #routine/abc123 → resalta "Rutinas"
   *
   * @param {string} hash — Hash de location actual
   */
  _highlightActive(hash) {
    this.querySelectorAll('.nav-item').forEach(item => {
      const route = item.dataset.route;
      let isActive = (hash === route);

      // #session/<id> (vista detalle) → resalta tab "Sesiones"
      if (!isActive && route === '#sessions' && /^#session\/(?!new)[^/]+$/.test(hash)) {
        isActive = true;
      }

      // #routine/<id> (vista detalle) → resalta tab "Rutinas"
      if (!isActive && route === '#routines' && /^#routine\/[^/]+$/.test(hash)) {
        isActive = true;
      }

      item.classList.toggle('active', isActive);
    });
  }
}

// Registro del Custom Element
customElements.define('app-nav', AppNav);
