/**
 * ============================================================
 *  <exercises-view> — Catalogo de Ejercicios
 * ============================================================
 */

class ExercisesView extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
    this._exercises = [];
  }

  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    this.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Catalogo de Ejercicios</h1>
        <button class="btn btn-primary" id="btn-add-exercise">
          <i class="ph-bold ph-plus"></i> Anadir Ejercicio
        </button>
      </div>
      <div class="view-content">
        <div class="search-bar">
          <i class="ph ph-magnifying-glass" style="padding-left:16px; color:var(--text-muted); font-size:18px;"></i>
          <input type="text" placeholder="Buscar ejercicio..." id="exercise-search">
          <div class="divider"></div>
          <select id="exercise-filter">
            <option value="">Todos los musculos</option>
            ${MUSCLE_GROUPS.map(m => `<option value="${m}">${m}</option>`).join('')}
          </select>
        </div>
        <div class="card-grid" id="exercise-grid">
          <loading-state></loading-state>
        </div>
      </div>
    `;

    this.querySelector('#btn-add-exercise').addEventListener('click', () => this._openModal(null));
    this.querySelector('#exercise-search').addEventListener('input', () => this._filterAndRender());
    this.querySelector('#exercise-filter').addEventListener('change', () => this._filterAndRender());

    this.querySelector('#exercise-grid').addEventListener('click', (e) => {
      const editBtn   = e.target.closest('[data-edit]');
      const deleteBtn = e.target.closest('[data-delete]');
      const cameraBtn = e.target.closest('[data-camera]');

      if (editBtn) {
        const ex = this._exercises.find(x => x.id === editBtn.dataset.edit);
        if (ex) this._openModal(ex);
      }
      if (deleteBtn) this._deleteExercise(deleteBtn.dataset.delete);
      if (cameraBtn) {
        const fileInput = this.querySelector(`#img-input-${cameraBtn.dataset.camera}`);
        if (fileInput) fileInput.click();
      }
    });

    this.querySelector('#exercise-grid').addEventListener('change', async (e) => {
      if (e.target.matches('.card-image-input')) {
        const file = e.target.files[0];
        const exerciseId = e.target.dataset.exerciseId;
        if (file && exerciseId) await this._updateImage(exerciseId, file);
      }
    });
  }

  async loadData() {
    try {
      this._exercises = await GymDB.exercises.getAll();
      this._filterAndRender();
    } catch (err) {
      console.error('Error al cargar ejercicios:', err);
      this.querySelector('#exercise-grid').innerHTML = `
        <div style="grid-column:1/-1;"><error-state></error-state></div>
      `;
    }
  }

  _filterAndRender() {
    const searchTerm   = this.querySelector('#exercise-search').value.toLowerCase().trim();
    const muscleFilter = this.querySelector('#exercise-filter').value;

    let filtered = this._exercises;
    if (muscleFilter) filtered = filtered.filter(ex => ex.muscleGroup === muscleFilter);
    if (searchTerm)   filtered = filtered.filter(ex =>
      ex.name.toLowerCase().includes(searchTerm) ||
      ex.muscleGroup.toLowerCase().includes(searchTerm) ||
      (ex.description || '').toLowerCase().includes(searchTerm)
    );
    this._renderCards(filtered);
  }

  _renderCards(exercises) {
    const grid = this.querySelector('#exercise-grid');
    if (exercises.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <i class="ph-bold ph-barbell icon"></i>
          <p>No se encontraron ejercicios</p>
          <button class="btn btn-primary" onclick="this.closest('exercises-view').querySelector('#btn-add-exercise').click()">
            <i class="ph-bold ph-plus"></i> Anadir primer ejercicio
          </button>
        </div>
      `;
      return;
    }
    grid.innerHTML = exercises.map(ex => this._cardHTML(ex)).join('');
  }

  _cardHTML(ex) {
    const color = getMuscleColor(ex.muscleGroup);
    // Descripcion limpia sin simbolos corruptos
    const rawDesc = (ex.description || 'Sin descripcion').replace(/[^\x00-\x7F\u00C0-\u024F\u00A0-\u00FF]/g, '');
    const shortDesc = rawDesc.length > 110 ? rawDesc.slice(0, 110) + '...' : rawDesc;

    const imageArea = ex.image
      ? `<img src="${ex.image}" alt="${ex.name}" style="width:100%; height:100%; object-fit:cover; display:block;">`
      : `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center;">
           <i class="ph-bold ph-barbell" style="font-size:36px; color:${color}; opacity:0.35;"></i>
         </div>`;

    return `
      <div class="glass-card exercise-card hover-lift" style="display:flex; flex-direction:column; overflow:hidden;">
        <!-- Imagen con altura fija y contenedor de control -->
        <div style="height:140px; overflow:hidden; position:relative; background:rgba(0,0,0,0.2); flex-shrink:0;">
          ${imageArea}
          <button data-camera="${ex.id}" title="Cambiar imagen"
            style="position:absolute; bottom:8px; right:8px; width:32px; height:32px; border-radius:8px; background:rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.15); color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(8px);">
            <i class="ph-bold ph-camera" style="font-size:14px;"></i>
          </button>
          <input type="file" accept="image/*" class="card-image-input"
                 id="img-input-${ex.id}" data-exercise-id="${ex.id}" style="display:none;">
        </div>

        <!-- Contenido -->
        <div style="padding:16px; flex:1; display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:8px;">
            <h3 style="font-size:16px; font-weight:700; color:#FFFFFF; line-height:1.3;">${ex.name}</h3>
            ${muscleBadge(ex.muscleGroup)}
          </div>
          <span class="badge badge-slate" style="align-self:flex-start;">
            <i class="ph ph-tag" style="font-size:11px;"></i> ${ex.type || 'Peso Libre'}
          </span>
          <p style="font-size:13px; color:var(--text-secondary); line-height:1.6; flex:1;">${shortDesc}</p>
        </div>

        <!-- Acciones -->
        <div style="padding:12px 16px; border-top:1px solid rgba(255,255,255,0.04); display:flex; gap:8px;">
          <button class="btn btn-ghost" data-edit="${ex.id}" style="flex:1; justify-content:center; height:36px; font-size:13px;">
            <i class="ph-bold ph-pencil-simple"></i> Editar
          </button>
          <button class="btn btn-icon btn-danger" data-delete="${ex.id}" style="width:36px; height:36px; border-radius:8px;" title="Eliminar">
            <i class="ph-bold ph-trash"></i>
          </button>
        </div>
      </div>
    `;
  }

  _openModal(exercise) {
    const modal = document.createElement('exercise-modal');
    modal.open(exercise, () => this.loadData());
  }

  async _deleteExercise(id) {
    const exercise = this._exercises.find(ex => ex.id === id);
    if (!exercise) return;

    const routinesUsing = await GymDB.exercises.findInRoutines(id);
    let impact = '';
    if (routinesUsing.length > 0) {
      impact = `Usado en ${routinesUsing.length} rutina(s): ${routinesUsing.map(r => r.name).join(', ')}.`;
    }

    const dialog = document.createElement('confirm-dialog');
    const confirmed = await dialog.show({
      title: `Eliminar "${exercise.name}"?`,
      message: 'Esta accion es permanente.',
      impact: impact || undefined,
      confirmText: 'Si, eliminar'
    });

    if (confirmed) {
      await GymDB.exercises.delete(id);
      if (routinesUsing.length > 0) {
        for (const routine of routinesUsing) {
          routine.exercises = routine.exercises.filter(e => e.exerciseId !== id);
          await GymDB.routines.update(routine);
        }
      }
      await this.loadData();
    }
  }

  async _updateImage(exerciseId, file) {
    try {
      const base64 = await fileToBase64(file);
      const ex = this._exercises.find(e => e.id === exerciseId);
      if (ex) {
        ex.image = base64;
        await GymDB.exercises.update(ex);
        await this.loadData();
      }
    } catch (err) { console.error('Error al actualizar imagen:', err); }
  }
}

customElements.define('exercises-view', ExercisesView);
