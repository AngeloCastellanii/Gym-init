/**
 * ============================================================
 *  <routines-view> — Mis Rutinas
 * ============================================================
 */

class RoutinesView extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
    this._routines = [];
    this._exercises = [];
  }

  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    this.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Mis Rutinas</h1>
          <p class="page-subtitle" id="routines-subtitle">Cargando...</p>
        </div>
        <button class="btn btn-primary" id="btn-add-routine">
          <i class="ph-bold ph-plus"></i> Nueva Rutina
        </button>
      </div>
      <div class="view-content">
        <div class="card-grid" id="routines-grid">
          <loading-state></loading-state>
        </div>
      </div>
    `;

    this.querySelector('#btn-add-routine').addEventListener('click', () => this._openModal(null));

    this.querySelector('#routines-grid').addEventListener('click', (e) => {
      const editBtn   = e.target.closest('[data-edit]');
      const deleteBtn = e.target.closest('[data-delete]');
      const startBtn  = e.target.closest('[data-start]');

      if (editBtn)   this._openModal(this._routines.find(r => r.id === editBtn.dataset.edit));
      if (deleteBtn) this._deleteRoutine(deleteBtn.dataset.delete);
      if (startBtn) {
        localStorage.setItem('pending-routine', startBtn.dataset.start);
        window.location.hash = '#session/new';
      }
    });
  }

  async loadData() {
    try {
      [this._routines, this._exercises] = await Promise.all([
        GymDB.routines.getAll(),
        GymDB.exercises.getAll()
      ]);
      this._render();
    } catch (err) {
      console.error('Error loadData Routines:', err);
    }
  }

  _render() {
    const subtitle = this.querySelector('#routines-subtitle');
    if (subtitle) subtitle.textContent = `${this._routines.length} rutina${this._routines.length !== 1 ? 's' : ''} configuradas`;

    const grid = this.querySelector('#routines-grid');
    if (!this._routines.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <i class="ph-bold ph-clipboard-text icon"></i>
          <p>Aun no tienes rutinas creadas.</p>
          <button class="btn btn-primary" onclick="this.closest('routines-view').querySelector('#btn-add-routine').click()">
            <i class="ph-bold ph-plus"></i> Crear primera rutina
          </button>
        </div>
      `;
      return;
    }
    grid.innerHTML = this._routines.map(r => this._cardHTML(r)).join('');

    // Listeners de acciones (Fase 1 Roadmap)
    grid.querySelectorAll('[data-start]').forEach(btn => {
      btn.onclick = async (e) => {
        e.preventDefault(); // Evitar comportamientos extraños
        const rid = e.currentTarget.dataset.start;
        const routine = this._routines.find(r => r.id === rid);
        if (!routine) return;

        // Limpiar sesión previa por seguridad
        sessionStorage.removeItem('gym-active-session');

        // Cargar info de ejercicios completa para la sesión
        const logs = (routine.exercises || []).map(re => {
          const exInfo = this._exercises.find(x => x.id === re.exerciseId);
          return {
            exerciseId: re.exerciseId,
            exerciseName: exInfo ? exInfo.name : 'Ejercicio',
            muscleGroup: exInfo ? exInfo.muscleGroup : 'Varios',
            sets: Array.from({ length: re.sets || 3 }, () => ({ 
              weight: 0, 
              reps: re.reps || 10, 
              done: false 
            }))
          };
        });

        const sessionData = {
          type: 'routine',
          routineId: rid,
          name: routine.name,
          startTime: Date.now(),
          logs: logs
        };

        try {
          sessionStorage.setItem('gym-active-session', JSON.stringify(sessionData));
          // Navegación forzada para evitar conflictos con el router
          window.location.hash = '#train/active';
        } catch (err) {
          console.error('Error al iniciar rutina directa:', err);
        }
      };
    });

    grid.querySelectorAll('[data-edit]').forEach(btn => {
      btn.onclick = (e) => this._openEdit(e.currentTarget.dataset.edit);
    });

    grid.querySelectorAll('[data-delete]').forEach(btn => {
      btn.onclick = (e) => this._delete(e.currentTarget.dataset.delete);
    });
  }

  _cardHTML(routine) {
    const exList = routine.exercises || [];

    // Obtener info real de ejercicios
    const resolvedEx = exList.map(e => {
      const found = this._exercises.find(x => x.id === e.exerciseId);
      return found ? { ...found, sets: e.sets, reps: e.reps } : null;
    }).filter(Boolean);

    // Grupos musculares únicos para el badge de cabecera
    const muscles = [...new Set(resolvedEx.map(e => e.muscleGroup))].slice(0, 2);
    const primaryMuscle = muscles[0] || 'General';
    const primaryColor  = getMuscleColor(primaryMuscle);

    // Tags de los primeros 3 ejercicios
    const maxShow = 3;
    const shownEx = resolvedEx.slice(0, maxShow);
    const extra   = resolvedEx.length - maxShow;

    const exTags = shownEx.map(e => {
      const c = getMuscleColor(e.muscleGroup);
      return `<span class="badge" style="font-size:10px; padding:3px 8px; color:${c}; border-color:${c}33; background:${c}1a;">${e.name}</span>`;
    }).join('');

    const extraTag = extra > 0
      ? `<span class="badge badge-slate" style="font-size:10px; padding:3px 8px;">+${extra} mas</span>`
      : '';

    // Icono de fondo representativo
    const iconColor = primaryColor;

    return `
      <div class="glass-card hover-lift" style="display:flex; flex-direction:column; overflow:hidden; padding:0;">

        <!-- Area superior (imagen/icono) -->
        <div style="height:140px; overflow:hidden; position:relative; background:rgba(0,0,0,0.25); flex-shrink:0; display:flex; align-items:center; justify-content:center;">
          <i class="ph-fill ph-clipboard-text" style="font-size:64px; color:${iconColor}; opacity:0.15;"></i>
          <!-- Badge grupo muscular -->
          <div style="position:absolute; top:10px; right:10px;">
            <span class="badge" style="color:${primaryColor}; border-color:${primaryColor}33; background:${primaryColor}1a; font-size:10px; font-weight:800; text-transform:uppercase;">
              ${primaryMuscle}
            </span>
          </div>
          <!-- Numero de ejercicios -->
          <div style="position:absolute; bottom:10px; left:12px;">
            <span style="font-size:12px; color:rgba(255,255,255,0.5); font-weight:700; display:flex; align-items:center; gap:5px;">
              <i class="ph ph-list-checks"></i> ${exList.length} ejercicio${exList.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <!-- Contenido -->
        <div style="padding:16px; flex:1; display:flex; flex-direction:column; gap:10px;">
          <h3 style="font-size:16px; font-weight:800; color:#FFFFFF; line-height:1.3;">${routine.name}</h3>
          ${routine.description
            ? `<p style="font-size:12px; color:var(--text-secondary); line-height:1.5;">${routine.description.slice(0, 72)}${routine.description.length > 72 ? '...' : ''}</p>`
            : '<p style="font-size:12px; color:var(--text-muted);">Sin descripcion</p>'
          }
          <div style="display:flex; flex-wrap:wrap; gap:5px; margin-top:4px;">
            ${exTags}${extraTag}
          </div>
        </div>

        <!-- Divisor -->
        <div style="height:1px; background:rgba(255,255,255,0.04); margin:0 16px;"></div>

        <!-- Acciones -->
        <div style="padding:12px 16px; display:flex; gap:8px;">
          <button class="btn btn-success" data-start="${routine.id}" style="flex:1; justify-content:center; height:38px; font-size:13px; font-weight:700;">
            <i class="ph-bold ph-play"></i> Iniciar
          </button>
          <button class="btn btn-ghost" data-edit="${routine.id}" style="width:38px; height:38px; padding:0; justify-content:center;" title="Editar">
            <i class="ph-bold ph-pencil-simple"></i>
          </button>
          <button class="btn btn-icon btn-danger" data-delete="${routine.id}" style="width:38px; height:38px; border-radius:8px;" title="Eliminar">
            <i class="ph-bold ph-trash"></i>
          </button>
        </div>
      </div>
    `;
  }

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
      message: 'Se eliminara permanentemente. Tus sesiones anteriores no se veran afectadas.',
      confirmText: 'Si, eliminar'
    });
    if (confirmed) {
      await GymDB.routines.delete(id);
      await this.loadData();
    }
  }
}

customElements.define('routines-view', RoutinesView);
