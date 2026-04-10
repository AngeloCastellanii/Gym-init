class ExercisesView extends HTMLElement {
  constructor() {
    super();

    this.innerHTML = `
      <section class="page-shell">
        <header class="page-header">
          <div>
            <h1 class="page-title">Catálogo de Ejercicios</h1>
            <p class="page-subtitle">Estructura inicial para el CRUD de ejercicios personalizados.</p>
          </div>
          <div class="pill">+ Añadir Ejercicio</div>
        </header>

        <div class="card card-pad">
          <h2 class="card-title">Vista en progreso</h2>
          <div class="placeholder">Aquí se colocará el buscador, filtros y las tarjetas de ejercicios.</div>
        </div>
      </section>
    `;
  }
}
customElements.define('exercises-view', ExercisesView);
