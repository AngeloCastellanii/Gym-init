class AppShell extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
      <div class="app-shell">
        <aside class="sidebar">
          <div class="brand" aria-label="Gym init">
            <div class="brand-mark">🏋️</div>
            <div class="brand-text">
              <strong>Gym init</strong>
              <span>Dale Gym push</span>
            </div>
          </div>

          <nav class="nav-list" aria-label="Navegación principal">
            <a class="nav-link" href="#dashboard" data-route="#dashboard">
              <span class="nav-icon">⌂</span>
              <span class="nav-copy">Dashboard</span>
            </a>
            <a class="nav-link" href="#exercises" data-route="#exercises">
              <span class="nav-icon">⊕</span>
              <span class="nav-copy">Ejercicios</span>
            </a>
            <a class="nav-link" href="#routines" data-route="#routines">
              <span class="nav-icon">≡</span>
              <span class="nav-copy">Rutinas</span>
            </a>
            <a class="nav-link" href="#sessions" data-route="#sessions">
              <span class="nav-icon">◷</span>
              <span class="nav-copy">Sesiones</span>
            </a>
          </nav>
        </aside>

        <main class="main">
          <div class="main-inner">
            <div data-outlet></div>
          </div>
        </main>
      </div>
    `;
  }

  connectedCallback() {
    this.updateActiveLink(window.location.hash || '#dashboard');
  }
  setActiveRoute(route) {
    this.updateActiveLink(route);
  }
  updateActiveLink(route) {
    const links = this.querySelectorAll('[data-route]');
    links.forEach((link) => {
      const isActive = link.getAttribute('data-route') === route;
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }
}
customElements.define('app-shell', AppShell);
