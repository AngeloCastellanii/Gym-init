/**
 * ============================================================
 *  <routine-modal> â€” Modal para Crear / Editar Rutinas
 *
 *  Modal con campos de formulario y un selector interactivo de ejercicios.
 *  Para cada ejercicio seleccionado, el usuario configura series y reps objetivo.
 *
 *  Uso:
 *    const modal = document.createElement('routine-modal');
 *    modal.open(null, () => refreshList());      // Crear
 *    modal.open(routine, () => refreshList());   // Editar
 * ============================================================
 */

class RoutineModal extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;

    /** @type {Object|null} Rutina siendo editada */
    this._routine = null;
    /** @type {Function|null} Callback tras guardar */
    this._onSave = null;
    /** @type {Array} Todos los ejercicios de la DB */
    this._allExercises = [];
    /** @type {Array} Ejercicios actualmente seleccionados con sets/reps */
    this._selected = [];
  }

  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    // Construye el DOM del modal
    this.innerHTML = `
      <div class="modal-overlay" id="rt-modal-overlay">
        <div class="modal-box" style="max-width:580px;">
          <div class="modal-header">
            <h3 class="modal-title" id="rt-modal-title">Nueva Rutina</h3>
            <button class="modal-close" id="rt-modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <!-- Nombre -->
            <div class="form-group">
              <label class="form-label" for="rt-name">Nombre de la Rutina</label>
              <input class="form-input" id="rt-name" placeholder="Ej: Dia de Pecho y Triceps">
            </div>

            <!-- Descripcion -->
            <div class="form-group">
              <label class="form-label" for="rt-desc">Descripcion (opcional)</label>
              <textarea class="form-textarea" id="rt-desc" placeholder="Descripcion general..." style="min-height:60px;"></textarea>
            </div>

            <!-- Selector de ejercicios -->
            <div class="form-group">
              <label class="form-label">Ejercicios</label>
              <div class="search-bar" style="margin-bottom:8px;">
                <i class="ph ph-magnifying-glass" style="padding-left:12px; color:var(--text-muted);"></i>
                <input type="text" placeholder="Buscar ejercicio..." id="rt-exercise-search" style="font-size:13px;">
              </div>
              <div class="picker-list" id="rt-exercise-list">
                <!-- Poblado dinamicamente -->
              </div>
            </div>

            <!-- Ejercicios seleccionados con inputs de Sets/Reps -->
            <div class="form-group" id="rt-selected-group" style="display:none;">
              <label class="form-label" style="display:flex; align-items:center; gap:6px;">
                <i class="ph-bold ph-list-checks" style="font-size:14px;"></i>
                Ejercicios Seleccionados
              </label>
              <div id="rt-selected-list" class="selected-exercises-list">
                <!-- Poblado dinamicamente -->
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" id="rt-save" style="width:100%;">
              <i class="ph-bold ph-floppy-disk"></i> Guardar Rutina
            </button>
          </div>
        </div>
      </div>
    `;

    // Manejadores de eventos
    this.querySelector('#rt-modal-close').addEventListener('click', () => this._close());
    this.querySelector('#rt-modal-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'rt-modal-overlay') this._close();
    });
    this.querySelector('#rt-save').addEventListener('click', () => this._save());

    // Filtrado de busqueda de ejercicios
    this.querySelector('#rt-exercise-search').addEventListener('input', () => {
      this._renderExercisePicker();
    });

    // Checkboxes del selector (delegacion de eventos)
    this.querySelector('#rt-exercise-list').addEventListener('change', (e) => {
      if (e.target.matches('.picker-checkbox')) {
        this._toggleExercise(e.target.value, e.target.checked);
      }
    });

    // Cambios en Sets/Reps de la lista seleccionada (delegacion)
    this.querySelector('#rt-selected-list').addEventListener('input', (e) => {
      if (e.target.matches('.sel-sets') || e.target.matches('.sel-reps')) {
        const id    = e.target.dataset.id;
        const field = e.target.matches('.sel-sets') ? 'sets' : 'reps';
        const val   = parseInt(e.target.value) || 1;
        const item  = this._selected.find(s => s.exerciseId === id);
        if (item) item[field] = val;
      }
    });

    // Remover de la lista seleccionada
    this.querySelector('#rt-selected-list').addEventListener('click', (e) => {
      const removeBtn = e.target.closest('[data-remove]');
      if (removeBtn) {
        this._toggleExercise(removeBtn.dataset.remove, false);
      }
    });

    // Aplica la configuracion pendiente si open() se llamo antes de montar
    if (this._pendingOpen) {
      this._applyOpen(this._pendingOpen.routine, this._pendingOpen.onSave);
      this._pendingOpen = null;
    }
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  //  API PUBLICA
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  /**
   * Abre el modal.
   * @param {Object|null} routine â€” Rutina existente a editar, o null para nueva
   * @param {Function} onSave â€” Callback tras guardar
   */
  async open(routine = null, onSave = null) {
    this._routine  = routine;
    this._onSave   = onSave;
    this._selected = [];

    // Carga todos los ejercicios para el selector
    this._allExercises = await GymDB.exercises.getAll();

    if (routine) {
      // Pre-selecciona los ejercicios existentes
      this._selected = (routine.exercises || []).map(e => ({
        exerciseId: e.exerciseId,
        order: e.order,
        sets: e.sets || 3,
        reps: e.reps || 10
      }));
    }

    this._pendingOpen = { routine, onSave };

    // Monta en el DOM (esto dispara connectedCallback)
    document.body.appendChild(this);
  }

  /** Aplica la configuracion del modal tras el montaje */
  _applyOpen(routine, onSave) {
    this._routine = routine;
    this._onSave  = onSave;

    if (routine) {
      // Modo edicion
      this.querySelector('#rt-modal-title').textContent = 'Editar Rutina';
      this.querySelector('#rt-name').value = routine.name || '';
      this.querySelector('#rt-desc').value = routine.description || '';
      this.querySelector('#rt-save').innerHTML =
        '<i class="ph-bold ph-floppy-disk"></i> Actualizar Rutina';
    } else {
      // Modo creacion
      this.querySelector('#rt-modal-title').textContent = 'Nueva Rutina';
      this.querySelector('#rt-name').value = '';
      this.querySelector('#rt-desc').value = '';
    }

    this._renderExercisePicker();
    this._renderSelectedList();

    setTimeout(() => this.querySelector('#rt-name').focus(), 100);
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  //  RENDERIZADO
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  /** Renderiza el listado de checkboxes del selector de ejercicios */
  _renderExercisePicker() {
    const searchTerm = this.querySelector('#rt-exercise-search').value.toLowerCase().trim();
    const list = this.querySelector('#rt-exercise-list');

    let exercises = this._allExercises;
    if (searchTerm) {
      exercises = exercises.filter(ex =>
        ex.name.toLowerCase().includes(searchTerm) ||
        ex.muscleGroup.toLowerCase().includes(searchTerm)
      );
    }

    if (exercises.length === 0) {
      list.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:16px; font-size:13px;">
        No se encontraron ejercicios</p>`;
      return;
    }

    list.innerHTML = exercises.map(ex => {
      const isChecked = this._selected.some(s => s.exerciseId === ex.id);
      const color = getMuscleColor(ex.muscleGroup);
      return `
        <label class="picker-item ${isChecked ? 'picker-item--checked' : ''}">
          <input type="checkbox" class="picker-checkbox" value="${ex.id}" ${isChecked ? 'checked' : ''}>
          <span class="picker-name">${ex.name}</span>
          <span class="badge" style="color:${color}; border-color:${color}33; background:${color}1a; font-size:9px; padding:2px 6px;">
            ${ex.muscleGroup}
          </span>
        </label>
      `;
    }).join('');
  }

  /** Renderiza la lista de ejercicios seleccionados con inputs de sets/reps */
  _renderSelectedList() {
    const container = this.querySelector('#rt-selected-list');
    const group     = this.querySelector('#rt-selected-group');

    if (this._selected.length === 0) {
      group.style.display = 'none';
      return;
    }

    group.style.display = 'flex';
    container.innerHTML = this._selected.map((sel, index) => {
      const ex    = this._allExercises.find(e => e.id === sel.exerciseId);
      const name  = ex ? ex.name : 'Ejercicio desconocido';
      const color = ex ? getMuscleColor(ex.muscleGroup) : '#94a3b8';

      return `
        <div class="selected-exercise-item">
          <span class="selected-exercise-order">${index + 1}</span>
          <div class="selected-exercise-info">
            <span class="selected-exercise-name">${name}</span>
          </div>
          <div class="selected-exercise-config">
            <div class="config-field">
              <input type="number" class="form-input sel-sets" data-id="${sel.exerciseId}"
                     value="${sel.sets}" min="1" max="20" style="width:52px; padding:6px; text-align:center; font-size:13px;">
              <span class="config-label">series</span>
            </div>
            <span style="color:var(--text-muted);">Ã—</span>
            <div class="config-field">
              <input type="number" class="form-input sel-reps" data-id="${sel.exerciseId}"
                     value="${sel.reps}" min="1" max="100" style="width:52px; padding:6px; text-align:center; font-size:13px;">
              <span class="config-label">reps</span>
            </div>
          </div>
          <button class="btn btn-icon btn-danger" data-remove="${sel.exerciseId}"
                  style="width:28px; height:28px; padding:4px; flex-shrink:0;" title="Quitar">
            <i class="ph-bold ph-x" style="font-size:12px;"></i>
          </button>
        </div>
      `;
    }).join('');
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  //  LOGICA
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  /**
   * Agrega o quita un ejercicio de la lista seleccionada.
   * @param {string} exerciseId
   * @param {boolean} checked
   */
  _toggleExercise(exerciseId, checked) {
    if (checked) {
      if (!this._selected.some(s => s.exerciseId === exerciseId)) {
        this._selected.push({
          exerciseId: exerciseId,
          order: this._selected.length + 1,
          sets: 3,
          reps: 10
        });
      }
    } else {
      this._selected = this._selected.filter(s => s.exerciseId !== exerciseId);
      // Reordena
      this._selected.forEach((s, i) => s.order = i + 1);
    }

    this._renderExercisePicker();
    this._renderSelectedList();
  }

  /** Valida y guarda en IndexedDB */
  async _save() {
    const name        = this.querySelector('#rt-name').value.trim();
    const description = this.querySelector('#rt-desc').value.trim();

    if (!name) {
      this.querySelector('#rt-name').style.borderColor = 'var(--danger)';
      this.querySelector('#rt-name').focus();
      return;
    }

    if (this._selected.length === 0) {
      alert('Selecciona al menos un ejercicio para la rutina.');
      return;
    }

    const data = {
      name,
      description,
      exercises: this._selected.map((s, i) => ({
        exerciseId: s.exerciseId,
        order: i + 1,
        sets: s.sets,
        reps: s.reps
      }))
    };

    try {
      if (this._routine) {
        data.id        = this._routine.id;
        data.createdAt = this._routine.createdAt;
        await GymDB.routines.update(data);
      } else {
        await GymDB.routines.add(data);
      }

      if (this._onSave) this._onSave();
      this._close();
    } catch (err) {
      console.error('Error al guardar rutina:', err);
      alert('Error al guardar: ' + err.message);
    }
  }

  _close() {
    this.remove();
  }
}

// Registro del Custom Element
customElements.define('routine-modal', RoutineModal);
