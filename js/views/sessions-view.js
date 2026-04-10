class SessionsView extends HTMLElement {
  constructor() {
    super();

    this.innerHTML = `
      <section class="page-shell">
        <header class="page-header">
          <div>
            <h1 class="page-title">Sesiones</h1>
            <p class="page-subtitle">Historial básico para futuras sesiones registradas localmente.</p>
          </div>
          <div class="pill">#session/new</div>
        </header>

        <div class="card card-pad">
          <h2 class="card-title">Vista en progreso</h2>
          <div class="placeholder">Aquí irá el historial y más adelante el tracker activo.</div>
        </div>
      </section>
    `;
  }
}

customElements.define('sessions-view', SessionsView);
