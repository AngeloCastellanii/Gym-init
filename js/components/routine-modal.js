/**
 * 
 *  <routine-modal> — Modal para Crear / Editar Rutinas
 * 
 */

class RoutineModal extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
    this._routine = null;
    this._onSave = null;
    this._allExercises = [];
    this._selected = [];
  }

  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    this.innerHTML = `
      <div class="modal-overlay" id="rt-modal-overlay">
        <div class="modal-box" style="max-width:620px; background: #0F172A; border: 1px solid rgba(255,255,255,0.1);">
          <div class="modal-header">
            <h3 class="modal-title" id="rt-modal-title" style="color: #FFFFFF;">Nueva Rutina</h3>
            <button class="modal-close" id="rt-modal-close">&times;</button>
          </div>
          <div class="modal-body" style="gap: 24px;">
            <div class="form-group">
              <label class="form-label">Nombre de la Rutina</label>
              <input class="form-input" id="rt-name" placeholder="Ej: Empuje (P / H / T)" style="background: #1E293B; color: #FFFFFF; font-weight:600;">
            </div>
            
            <div class="form-group">
              <label class="form-label">Ejercicios disponibles</label>
              <div class="search-bar" style="margin-bottom:12px; background: #1E293B; border-radius:10px;">
                <i class="ph ph-magnifying-glass" style="padding-left:14px; color:var(--text-secondary);"></i>
                <input type="text" placeholder="Buscar ejercicio..." id="rt-exercise-search" style="color: #FFFFFF;">
              </div>
              <div class="picker-list" id="rt-exercise-list" style="max-height:150px; overflow-y:auto; display:flex; flex-wrap:wrap; gap:8px; padding:6px;"></div>
            </div>

            <div class="form-group" id="rt-selected-group" style="display:none; margin-top:8px;">
              <label class="form-label" style="margin-bottom:14px; display:flex; justify-content:space-between; align-items:center;">
                <span style="display:flex; align-items:center; gap:8px;"><i class="ph-bold ph-list-numbers" style="color:var(--accent-light);"></i> Plan de Entrenamiento</span>
                <span id="rt-selected-count" class="badge badge-slate" style="font-size:10px;"></span>
              </label>
              <div id="rt-selected-list" style="display:flex; flex-direction:column; gap:10px;"></div>
            </div>
          </div>
          <div class="modal-footer" style="padding-top:24px; border-top:1px solid rgba(255,255,255,0.05);">
            <button class="btn btn-primary" id="rt-save" style="width:100%; justify-content:center; padding:18px; font-size:16px; font-weight:800; letter-spacing:0.5px;">
              <i class="ph-bold ph-floppy-disk"></i> GUARDAR RUTINA
            </button>
          </div>
        </div>
      </div>
    `;

    this.querySelector('#rt-modal-close').addEventListener('click', () => this._close());
    this.querySelector('#rt-modal-overlay').addEventListener('click', (e) => {
      if(e.target.id === 'rt-modal-overlay') this._close();
    });
    this.querySelector('#rt-save').addEventListener('click', () => this._save());
    this.querySelector('#rt-exercise-search').addEventListener('input', () => this._renderExercisePicker());
  }

  async open(routine = null, onSave = null) {
    this._routine = routine;
    this._onSave = onSave;
    this._allExercises = await GymDB.exercises.getAll();
    this._selected = routine ? JSON.parse(JSON.stringify(routine.exercises || [])) : [];
    
    document.body.appendChild(this);
    this._applyOpen();
  }

  _applyOpen() {
    if (this._routine) {
      this.querySelector('#rt-modal-title').textContent = 'Editar Rutina';
      this.querySelector('#rt-name').value = this._routine.name;
    }
    this._renderExercisePicker();
    this._renderSelectedList();
  }

  _renderExercisePicker() {
    const search = this.querySelector('#rt-exercise-search').value.toLowerCase();
    const list = this.querySelector('#rt-exercise-list');
    const filtered = this._allExercises.filter(ex => ex.name.toLowerCase().includes(search));

    list.innerHTML = filtered.map(ex => {
      const isChecked = this._selected.some(s => s.exerciseId === ex.id);
      return `
        <label class="badge ${isChecked ? 'badge-blue' : 'badge-slate'}" style="cursor:pointer; padding:8px 14px; font-size:11px; transition:all 0.2s; border-width:2px;">
          <input type="checkbox" style="display:none;" onchange="this.closest('routine-modal')._toggleExercise('${ex.id}', this.checked)" ${isChecked ? 'checked' : ''}>
          ${ex.name}
        </label>
      `;
    }).join('');
  }

  _toggleExercise(id, checked) {
    if (checked) {
      if (!this._selected.some(s => s.exerciseId === id)) {
        this._selected.push({ exerciseId: id, sets: 3, reps: 10 });
      }
    } else {
      this._selected = this._selected.filter(s => s.exerciseId !== id);
    }
    this._renderSelectedList();
    this._renderExercisePicker();
  }

  _renderSelectedList() {
    const container = this.querySelector('#rt-selected-list');
    const group = this.querySelector('#rt-selected-group');
    const countEl = this.querySelector('#rt-selected-count');
    
    group.style.display = this._selected.length ? 'block' : 'none';
    if(countEl) countEl.textContent = `${this._selected.length} ejercicios`;

    container.innerHTML = this._selected.map((sel, i) => {
      const ex = this._allExercises.find(e => e.id === sel.exerciseId);
      return `
        <div class="glass-card" style="padding:14px 18px; display:flex; align-items:center; justify-content:space-between; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);">
          <div style="display:flex; align-items:center; gap:16px;">
            <!-- Order Controls stack -->
            <div style="display:flex; flex-direction:column; align-items:center; background:rgba(0,0,0,0.2); padding:4px; border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
               <button class="order-btn" style="border:none; background:none; color:var(--text-muted); cursor:pointer; padding:0; height:12px;" onclick="this.closest('routine-modal')._move(${i}, -1)">
                 <i class="ph-bold ph-caret-up" style="font-size:12px;"></i>
               </button>
               <span style="font-weight:900; color:var(--accent-light); font-size:12px; margin:2px 0;">${i+1}</span>
               <button class="order-btn" style="border:none; background:none; color:var(--text-muted); cursor:pointer; padding:0; height:12px;" onclick="this.closest('routine-modal')._move(${i}, 1)">
                 <i class="ph-bold ph-caret-down" style="font-size:12px;"></i>
               </button>
            </div>
            <span style="font-weight:700; font-size:14px; color:#FFFFFF; letter-spacing:-0.01em;">${ex ? ex.name : '?'}</span>
          </div>
          
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="display:flex; align-items:center; gap:6px;">
              <input type="number" value="${sel.sets}" min="1" 
                     style="width:54px; height:36px; text-align:center; background:#111827; border:1px solid var(--border); color:#FFFFFF; border-radius:8px; font-weight:700;"
                     oninput="this.closest('routine-modal')._updateVal(${i}, 'sets', this.value)">
              <span style="font-size:11px; color:var(--text-secondary); font-weight:600;">set</span>
            </div>
            <span style="color:var(--text-muted); font-weight:bold; font-size:12px;">x</span>
            <div style="display:flex; align-items:center; gap:6px;">
              <input type="number" value="${sel.reps}" min="1" 
                     style="width:54px; height:36px; text-align:center; background:#111827; border:1px solid var(--border); color:#FFFFFF; border-radius:8px; font-weight:700;"
                     oninput="this.closest('routine-modal')._updateVal(${i}, 'reps', this.value)">
              <span style="font-size:11px; color:var(--text-secondary); font-weight:600;">rep</span>
            </div>
            <button class="btn btn-icon btn-danger" style="width:36px; height:36px; margin-left:8px; border-radius:10px;" onclick="this.closest('routine-modal')._toggleExercise('${sel.exerciseId}', false)">
              <i class="ph-bold ph-trash-simple" style="font-size:16px;"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  _move(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= this._selected.length) return;
    const temp = this._selected[index];
    this._selected[index] = this._selected[newIndex];
    this._selected[newIndex] = temp;
    this._renderSelectedList();
  }

  _updateVal(index, field, val) {
    this._selected[index][field] = parseInt(val) || 0;
  }

  async _save() {
    const name = this.querySelector('#rt-name').value.trim();
    if (!name || !this._selected.length) return alert("Nombre y ejercicios requeridos.");
    const data = { name, exercises: this._selected };
    if (this._routine) data.id = this._routine.id;
    await GymDB.routines.add(data);
    if (this._onSave) this._onSave();
    this._close();
  }

  _close() { this.remove(); }
}

customElements.define('routine-modal', RoutineModal);
