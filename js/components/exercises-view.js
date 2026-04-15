/**
 * ============================================================
 *  <exercises-view> — Vista del Catalogo de Ejercicios (#exercises)
 *
 *  Muestra todos los ejercicios como glass cards con busqueda y filtro.
 *  Soporta operaciones CRUD via modales y dialogos de confirmacion.
 *  Cada tarjeta permite subir una imagen inline.
 *
 *  DOM construido en constructor, datos cargados via loadData().
 * ============================================================
 */

class ExercisesView extends HTMLElement {
  constructor() {
    super();

    /** @type {Array} Lista completa de ejercicios desde IndexedDB */
    this._exercises = [];

    // Construye el shell estatico
    this.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Catalogo de Ejercicios</h1>
        <button class="btn btn-primary" id="btn-add-exercise">
          <i class="ph-bold ph-plus"></i>
          Anadir Ejercicio
        </button>
      </div>
      <div class="view-content">
        <!-- Barra de busqueda y filtro -->
        <div class="search-bar">
          <i class="ph ph-magnifying-glass" style="padding-left:16px; color:var(--text-muted); font-size:18px;"></i>
          <input type="text" placeholder="Buscar ejercicio..." id="exercise-search">
          <div class="divider"></div>
          <select id="exercise-filter">
            <option value="">Todos los musculos</option>
            ${MUSCLE_GROUPS.map(m => `<option value="${m}">${m}</option>`).join('')}
          </select>
        </div>

        <!-- Cuadricula de tarjetas de ejercicios -->
        <div class="card-grid" id="exercise-grid">
          <loading-state></loading-state>
        </div>
      </div>
    `;

    // Boton para agregar ejercicio
    this.querySelector('#btn-add-exercise').addEventListener('click', () => {
      this._openModal(null);
    });

    // Input de busqueda (filtrado en vivo)
    this.querySelector('#exercise-search').addEventListener('input', () => {
      this._filterAndRender();
    });

    // Dropdown de filtro por grupo muscular
    this.querySelector('#exercise-filter').addEventListener('change', () => {
      this._filterAndRender();
    });

    // Delegacion de eventos para acciones en tarjetas (editar, eliminar, subir imagen)
    this.querySelector('#exercise-grid').addEventListener('click', (e) => {
      const editBtn   = e.target.closest('[data-edit]');
      const deleteBtn = e.target.closest('[data-delete]');
      const cameraBtn = e.target.closest('[data-camera]');

      if (editBtn) {
        const ex = this._exercises.find(x => x.id === editBtn.dataset.edit);
        if (ex) this._openModal(ex);
      }
      if (deleteBtn) {
        this._deleteExercise(deleteBtn.dataset.delete);
      }
      if (cameraBtn) {
        // Dispara el input de archivo oculto de esta tarjeta
        const fileInput = this.querySelector(`#img-input-${cameraBtn.dataset.camera}`);
        if (fileInput) fileInput.click();
      }
    });

    // Manejador de cambio en input de imagen (delegacion)
    this.querySelector('#exercise-grid').addEventListener('change', async (e) => {
      if (e.target.matches('.card-image-input')) {
        const file = e.target.files[0];
        const exerciseId = e.target.dataset.exerciseId;
        if (file && exerciseId) {
          await this._updateImage(exerciseId, file);
        }
      }
    });
  }

  // ════════════════════════════════════════════
  //  CARGA DE DATOS (llamado por el Router tras montar)
  // ════════════════════════════════════════════

  /**
   * Carga los ejercicios desde IndexedDB y renderiza las tarjetas.
   */
  async loadData() {
    try {
      this._exercises = await GymDB.exercises.getAll();
      this._filterAndRender();
    } catch (err) {
      console.error('Error al cargar ejercicios:', err);
      this.querySelector('#exercise-grid').innerHTML = `
        <div style="grid-column:1/-1;">
          <error-state></error-state>
        </div>
      `;
    }
  }

  // ════════════════════════════════════════════
  //  RENDERIZADO
  // ════════════════════════════════════════════

  /**
   * Filtra los ejercicios segun busqueda/filtro actuales y renderiza.
   */
  _filterAndRender() {
    const searchTerm   = this.querySelector('#exercise-search').value.toLowerCase().trim();
    const muscleFilter = this.querySelector('#exercise-filter').value;

    let filtered = this._exercises;

    // Filtra por grupo muscular
    if (muscleFilter) {
      filtered = filtered.filter(ex => ex.muscleGroup === muscleFilter);
    }

    // Filtra por termino de busqueda (nombre, musculo o descripcion)
    if (searchTerm) {
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(searchTerm) ||
        ex.muscleGroup.toLowerCase().includes(searchTerm) ||
        (ex.description || '').toLowerCase().includes(searchTerm)
      );
    }

    this._renderCards(filtered);
  }

  /**
   * Renderiza las tarjetas de ejercicio en la cuadricula.
   * @param {Array} exercises
   */
  _renderCards(exercises) {
    const grid = this.querySelector('#exercise-grid');

    if (exercises.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <i class="ph-bold ph-barbell icon"></i>
          <p>No se encontraron ejercicios</p>
          <button class="btn btn-primary" onclick="this.closest('exercises-view').querySelector('#btn-add-exercise').click()">
            <i class="ph-bold ph-plus"></i> Anadir tu primer ejercicio
          </button>
        </div>
      `;
      return;
    }

    grid.innerHTML = exercises.map(ex => this._cardHTML(ex)).join('');
  }

  /**
   * Genera el HTML para una sola tarjeta de ejercicio.
   * @param {Object} ex — Objeto ejercicio
   * @returns {string} Cadena HTML
   */
  _cardHTML(ex) {
    const color = getMuscleColor(ex.muscleGroup);
    const desc = fallback(ex.description, 'Sin descripcion');
    // Trunca la descripcion a ~100 caracteres
    const shortDesc = desc.length > 100 ? desc.slice(0, 100) + '…' : desc;

    const imageArea = ex.image
      ? `<img src="${ex.image}" alt="${ex.name}" class="exercise-card-img">`
      : `<div class="exercise-card-img-placeholder">
           <i class="ph-bold ph-barbell" style="font-size:32px; color:${color}; opacity:0.4;"></i>
         </div>`;

    return `
      <div class="glass-card exercise-card hover-lift">
        <!-- Area de imagen con boton de camara -->
        <div class="exercise-card-image-wrap">
          ${imageArea}
          <button class="exercise-card-camera" data-camera="${ex.id}" title="Cambiar imagen">
            <i class="ph-bold ph-camera"></i>
          </button>
          <input type="file" accept="image/*" class="card-image-input"
                 id="img-input-${ex.id}" data-exercise-id="${ex.id}" style="display:none;">
        </div>

        <!-- Contenido -->
        <div class="exercise-card-content">
          <div class="exercise-card-header">
            <h3 class="exercise-card-title">${ex.name}</h3>
            ${muscleBadge(ex.muscleGroup)}
          </div>
          <div class="exercise-card-meta">
            <span class="badge badge-slate">
              <i class="ph ph-tag" style="font-size:12px;"></i> ${ex.type}
            </span>
          </div>
          <p class="exercise-card-desc">${shortDesc}</p>
        </div>

        <!-- Acciones -->
        <div class="exercise-card-divider"></div>
        <div class="exercise-card-actions">
          <button class="btn btn-ghost exercise-card-edit" data-edit="${ex.id}">
            <i class="ph-bold ph-pencil-simple"></i> Editar
          </button>
          <button class="btn btn-danger btn-icon" data-delete="${ex.id}" title="Eliminar">
            <i class="ph-bold ph-trash"></i>
          </button>
        </div>
      </div>
    `;
  }

  // ════════════════════════════════════════════
  //  ACCIONES
  // ════════════════════════════════════════════

  /**
   * Abre el modal de ejercicio para crear o editar.
   * @param {Object|null} exercise
   */
  _openModal(exercise) {
    const modal = document.createElement('exercise-modal');
    modal.open(exercise, () => this.loadData());
  }

  /**
   * Elimina un ejercicio con confirmacion.
   * Verifica si el ejercicio esta en alguna rutina y advierte.
   * @param {string} id
   */
  async _deleteExercise(id) {
    const exercise = this._exercises.find(ex => ex.id === id);
    if (!exercise) return;

    // Verifica si el ejercicio esta en alguna rutina
    const routinesUsing = await GymDB.exercises.findInRoutines(id);
    let impact = '';
    if (routinesUsing.length > 0) {
      const names = routinesUsing.map(r => r.name).join(', ');
      impact = `Este ejercicio se usa en ${routinesUsing.length} rutina(s): ${names}. Se eliminara de todas ellas.`;
    }

    const dialog = document.createElement('confirm-dialog');
    const confirmed = await dialog.show({
      title: `Eliminar "${exercise.name}"?`,
      message: 'Esta accion eliminara permanentemente el ejercicio.',
      impact: impact || undefined,
      confirmText: 'Si, eliminar'
    });

    if (confirmed) {
      try {
        await GymDB.exercises.delete(id);

        // Tambien lo elimina de cualquier rutina que lo referencie
        if (routinesUsing.length > 0) {
          for (const routine of routinesUsing) {
            routine.exercises = routine.exercises.filter(e => e.exerciseId !== id);
            await GymDB.routines.update(routine);
          }
        }

        // Refresca la lista
        await this.loadData();
      } catch (err) {
        console.error('Error al eliminar ejercicio:', err);
      }
    }
  }

  /**
   * Actualiza la imagen de un ejercicio desde el boton de camara de la tarjeta.
   * @param {string} exerciseId
   * @param {File} file
   */
  async _updateImage(exerciseId, file) {
    try {
      const base64 = await fileToBase64(file);
      await GymDB.exercises.update({ id: exerciseId, image: base64 });
      await this.loadData();
    } catch (err) {
      console.error('Error al actualizar imagen:', err);
    }
  }
}

// Registro del Custom Element
customElements.define('exercises-view', ExercisesView);
