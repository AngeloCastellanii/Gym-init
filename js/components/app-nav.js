/**
 * ============================================================
 *  <app-nav> — Componente principal de navegacion
 * ============================================================
 */

class AppNav extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
    this._items = [
      { hash: '#dashboard', icon: 'ph-chart-line-up', label: 'Dashboard' },
      { hash: '#exercises', icon: 'ph-barbell', label: 'Ejercicios' },
      { hash: '#routines', icon: 'ph-clipboard-text', label: 'Rutinas' },
      { hash: '#sessions', icon: 'ph-calendar-check', label: 'Sesiones' },
      { hash: '#session/new', icon: 'ph-play-circle', label: 'Entrenar' },
    ];
  }

  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    this.innerHTML = this._buildHTML();

    this.addEventListener('click', (e) => {
      const link = e.target.closest('[data-route]');
      if (link) {
        e.preventDefault();
        window.location.hash = link.dataset.route;
      }
    });

    document.addEventListener('route-changed', (e) => {
      this._highlightActive(e.detail.hash);
    });
  }

  _buildHTML() {
    const navItemsHTML = this._items.map(item => `
      <a class="nav-item" data-route="${item.hash}" href="${item.hash}" aria-label="${item.label}">
        <i class="ph-bold ${item.icon}"></i>
        <span class="nav-label">${item.label}</span>
      </a>
    `).join('');

    return `
      <!-- Sidebar (Desktop) -->
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
          <a class="sidebar-logo" data-route="#dashboard" href="#dashboard">
            <div class="sidebar-logo-icon">
              <i class="ph-fill ph-barbell"></i>
            </div>
            <div style="display:flex; flex-direction:column;">
              <span class="sidebar-logo-text">Gym Init</span>
              <span style="font-size:8px; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em;">Dale Push a tu entrenamiento</span>
            </div>
          </a>
        </div>
        <div class="sidebar-divider"></div>
        <nav class="sidebar-menu">${navItemsHTML}</nav>
        <div style="flex:1;"></div>
        <div class="sidebar-footer">
          <p class="sidebar-footer-text"><i class="ph ph-code"></i> Gym Init v1.0</p>
        </div>
      </aside>

      <!-- Bottom Nav (Movil) -->
      <nav class="bottom-nav" id="bottom-nav">${navItemsHTML}</nav>
    `;
  }

  _highlightActive(hash) {
    this.querySelectorAll('.nav-item').forEach(item => {
      const route = item.dataset.route;
      let isActive = (hash === route);
      if (!isActive && route === '#sessions' && /^#session\/(?!new)[^/]+$/.test(hash)) isActive = true;
      if (!isActive && route === '#routines' && /^#routine\/[^/]+$/.test(hash)) isActive = true;
      item.classList.toggle('active', isActive);
    });
  }
}

customElements.define('app-nav', AppNav);
