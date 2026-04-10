class DashboardView extends HTMLElement {
  constructor() {
    super();

    this.innerHTML = `
      <section class="page-shell">
        <header class="page-header">
          <div>
            <h1 class="page-title">Panel de Control</h1>
            <p class="page-subtitle">Base inicial de la aplicación. Aquí irá el resumen de entrenamiento, métricas y gráficos.</p>
          </div>
          <div class="pill">Estado: Prototipo</div>
        </header>

        <div class="grid-cards grid-4">
          <article class="card card-pad stats">
            <span class="card-muted">Sesiones del mes</span>
            <strong class="accent-primary">--</strong>
            <p class="card-muted">Indicador listo para conectar con IndexedDB.</p>
          </article>
          <article class="card card-pad stats">
            <span class="card-muted">Racha actual</span>
            <strong class="accent-success">--</strong>
            <p class="card-muted">Se completará cuando exista historial real.</p>
          </article>
          <article class="card card-pad stats">
            <span class="card-muted">Volumen total</span>
            <strong class="accent-warning">--</strong>
            <p class="card-muted">Futuro cálculo a partir de series registradas.</p>
          </article>
          <article class="card card-pad stats">
            <span class="card-muted">Unidad global</span>
            <strong class="accent-danger">Kg</strong>
            <p class="card-muted">La preferencia vivirá en LocalStorage.</p>
          </article>
        </div>

        <div class="section-grid columns-2">
          <section class="card card-pad">
            <h2 class="card-title">Progreso inicial</h2>
            <div class="placeholder">Espacio reservado para el gráfico principal del dashboard.</div>
          </section>
          <section class="card card-pad">
            <h2 class="card-title">Sesiones recientes</h2>
            <div class="empty-state">Todavía no hay datos cargados. Esta vista se completará en fases posteriores.</div>
          </section>
        </div>
      </section>
    `;
  }
}

customElements.define('dashboard-view', DashboardView);
