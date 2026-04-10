class RoutinesView extends HTMLElement {
  constructor() {
    super();

    this.innerHTML = `
      <section class="page-shell">
        <header class="page-header">
          <div>
            <h1 class="page-title">Rutinas</h1>
            <p class="page-subtitle">Aquí construiremos rutinas con ejercicios, series y repeticiones objetivo.</p>
          </div>
          <div class="pill">+ Crear Rutina</div>
        </header>

        <div class="card card-pad">
          <h2 class="card-title">Vista en progreso</h2>
          <div class="placeholder">Espacio reservado para tarjetas de rutinas y acciones rápidas.</div>
        </div>
      </section>
    `;
  }
}

customElements.define('routines-view', RoutinesView);
