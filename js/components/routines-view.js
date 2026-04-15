/**
 * ============================================================
 *  <routines-view> — Vista de Gestion de Rutinas (#routines)
 *
 *  Muestra todas las rutinas como glass cards con una decoracion
 *  de cuarto de circulo. Cada tarjeta muestra el conteo de ejercicios,
 *  sus nombres, y tiene acciones de Iniciar, Editar y Eliminar.
 *
 *  DOM construido en constructor, datos cargados via loadData().
 * ============================================================
 */

class RoutinesView extends HTMLElement {
  constructor() {
    super();

    /** @type {Array} Todas las rutinas */
    this._routines = [];
    /** @type {Array} Todos los ejercicios (para busqueda de nombres) */
    this._exercises = [];

    // Construye el shell estatico
    this.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Mis Rutinas</h1>
        <button class="btn btn-primary" id="btn-add-routine">
          <i class="ph-bold ph-plus"></i>
          Nueva Rutina
        </button>
      </div>
      <div class="view-content">
        <div class="card-grid" id="routine-grid">
          <loading-state></loading-state>
        </div>
      </div>
    `;

    // Boton para agregar rutina
    this.querySelector('#btn-add-routine').addEventListener('click', () => {
      this._openModal(null);
    });

    // Delegacion de eventos en tarjetas
    this.querySelector('#routine-grid').addEventListener('click', (e) => {
      const startBtn  = e.target.closest('[data-start]');
      const editBtn   = e.target.closest('[data-edit-rt]');
      const deleteBtn = e.target.closest('[data-delete-rt]');

      if (startBtn) {
        // Navega a sesion activa con la rutina preseleccionada
        window.location.hash = '#session/new?routine=' + startBtn.dataset.start;
      }
      if (editBtn) {
        const rt = this._routines.find(r => r.id === editBtn.dataset.editRt);
        if (rt) this._openModal(rt);
      }
      if (deleteBtn) {
        this._deleteRoutine(deleteBtn.dataset.deleteRt);
      }
    });
  }

  // ════════════════════════════════════════════
  //  CARGA DE DATOS
  // ════════════════════════════════════════════

  async loadData() {
    try {
      this._routines  = await GymDB.routines.getAll();
      this._exercises = await GymDB.exercises.getAll();
      this._renderCards();
    } catch (err) {
      console.error('Error al cargar rutinas:', err);
      this.querySelector('#routine-grid').innerHTML = `
        <div style="grid-column:1/-1;"><error-state></error-state></div>
      `;
    }
  }

  // ════════════════════════════════════════════
  //  RENDERIZADO
  // ════════════════════════════════════════════

  _renderCards() {
    const grid = this.querySelector('#routine-grid');

    if (this._routines.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <i class="ph-bold ph-clipboard-text icon"></i>
          <p>Aun no tienes rutinas creadas</p>
          <button class="btn btn-primary" onclick="this.closest('routines-view').querySelector('#btn-add-routine').click()">
            <i class="ph-bold ph-plus"></i> Crear tu primera rutina
          </button>
        </div>
      `;
      return;
    }

    grid.innerHTML = this._routines.map(rt => this._cardHTML(rt)).join('');
  }

  /**
   * Genera el HTML para una tarjeta de rutina.
   * @param {Object} rt — Objeto rutina
   * @returns {string}
   */
  _cardHTML(rt) {
    const exerciseCount = (rt.exercises || []).length;

    // Obtiene los nombres de ejercicios para mostrar
    const exerciseNames = (rt.exercises || []).map(entry => {
      const ex = this._exercises.find(e => e.id === entry.exerciseId);
      return ex ? ex.name : 'Desconocido';
    });
    const namesPreview = exerciseNames.slice(0, 3).join(', ')
      + (exerciseNames.length > 3 ? ` +${exerciseNames.length - 3} mas` : '');

    const desc = fallback(rt.description, 'Sin descripcion');

    return `
      <div class="glass-card routine-card hover-lift">
        <!-- Decoracion de cuarto de circulo -->
        <div class="routine-card-decoration"></div>

        <div class="routine-card-content">
          <h3 class="routine-card-title">${rt.name}</h3>
          <p class="routine-card-desc">${desc}</p>
          <div class="routine-card-exercises">
            <i class="ph-bold ph-list-checks" style="color:var(--accent-light); flex-shrink:0;"></i>
            <span>${exerciseCount} ejercicio${exerciseCount !== 1 ? 's' : ''}: ${namesPreview}</span>
          </div>
        </div>

        <div class="routine-card-divider"></div>

        <div class="routine-card-actions">
          <button class="btn btn-success routine-card-start" data-start="${rt.id}">
            <i class="ph-bold ph-play"></i> Iniciar
          </button>
          <button class="btn btn-ghost btn-icon" data-edit-rt="${rt.id}" title="Editar">
            <i class="ph-bold ph-pencil-simple"></i>
          </button>
          <button class="btn btn-danger btn-icon" data-delete-rt="${rt.id}" title="Eliminar">
            <i class="ph-bold ph-trash"></i>
          </button>
        </div>
      </div>
    `;
  }

  // ════════════════════════════════════════════
  //  ACCIONES
  // ════════════════════════════════════════════

  _openModal(routine) {
    const modal = document.createElement('routine-modal');
    modal.open(routine, () => this.loadData());
  }

  async _deleteRoutine(id) {
    const routine = this._routines.find(r => r.id === id);
    if (!routine) return;

    const dialog = document.createElement('confirm-dialog');
    const confirmed = await dialog.show({
      title: `Eliminar "${routine.name}"?`,
      message: 'Se eliminara la rutina. Las sesiones historicas asociadas se conservaran.',
      confirmText: 'Si, eliminar'
    });

    if (confirmed) {
      try {
        await GymDB.routines.delete(id);
        await this.loadData();
      } catch (err) {
        console.error('Error al eliminar rutina:', err);
      }
    }
  }
}

// Registro del Custom Element
customElements.define('routines-view', RoutinesView);
