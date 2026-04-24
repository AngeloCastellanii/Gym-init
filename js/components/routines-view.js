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
        e.preventDefault();
        const rid = e.currentTarget.dataset.start;
        const routine = this._routines.find(r => r.id === rid);
        if (!routine) return;

        // Limpiar cualquier sesion previa
        sessionStorage.removeItem('gym-active-session');

        // Cargar historial de pesos para sugerir pesos previos
        let lastWeights = {};
        try {
          const sessions = await GymDB.sessions.getAll();
          sessions.sort((a, b) => new Date(b.date) - new Date(a.date));
          for (const sess of sessions) {
            if (!sess.logs) continue;
            for (const log of sess.logs) {
              if (lastWeights[log.exerciseId]) continue;
              const done = (log.sets || []).filter(s => s.done !== false);
              if (done.length > 0) {
                const last = done[done.length - 1];
                lastWeights[log.exerciseId] = { weight: last.weight, reps: last.reps };
              }
            }
          }
        } catch (err) { console.warn('No se pudo cargar historial:', err); }

        // Construir logs con pesos sugeridos
        const logs = (routine.exercises || []).map(re => {
          const exInfo = this._exercises.find(x => x.id === re.exerciseId);
          const lastData = lastWeights[re.exerciseId];
          return {
            exerciseId:    re.exerciseId,
            exerciseName:  exInfo ? exInfo.name : 'Ejercicio',
            muscleGroup:   exInfo ? exInfo.muscleGroup : 'Varios',
            exerciseImage: exInfo ? (exInfo.image || '') : '',
            lastData,
            sets: Array.from({ length: re.sets || 3 }, () => ({
              weight: lastData ? lastData.weight : 0,
              reps:   lastData ? lastData.reps   : (re.reps || 10),
              done:   false
            }))
          };
        });

        // Guardar estado con el formato que espera active-session-view
        const sessionState = {
          phase:             'active-routine',
          mode:              'routine',
          startTime:         Date.now(),
          logs,
          selectedRoutineId: rid,
          freeSessionName:   '',
          freeNotes:         ''
        };

        try {
          sessionStorage.setItem('gym-active-session', JSON.stringify(sessionState));
          window.location.hash = '#session/new';
        } catch (err) {
          console.error('Error al iniciar rutina:', err);
        }
      };
    });

    grid.querySelectorAll('[data-edit]').forEach(btn => {
      btn.onclick = (e) => this._openModal(this._routines.find(r => r.id === e.currentTarget.dataset.edit));
    });

    grid.querySelectorAll('[data-delete]').forEach(btn => {
      btn.onclick = (e) => this._deleteRoutine(e.currentTarget.dataset.delete);
    });

    // Listener para cambiar portada (Fase 1.2)
    grid.querySelectorAll('[data-cover]').forEach(btn => {
      btn.onclick = (e) => this._changeCover(e.currentTarget.dataset.cover);
    });
  }

  async _changeCover(id) {
    const input = document.createElement('input');
    input.type = 'file'; // Corregido: antes decía 'accept'
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target.result;
        try {
          const routine = this._routines.find(r => r.id === id);
          if (routine) {
            routine.image = base64;
            await GymDB.routines.update(routine);
            this.loadData(); // Recargar vista
          }
        } catch (err) {
          console.error('Error al guardar portada:', err);
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
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

    // Icono o Imagen de fondo representativo (Fase 1.2 - Covers)
    const iconColor = primaryColor;
    const coverArea = routine.image 
      ? `<div class="exercise-media-container"><img src="${routine.image}" alt="${routine.name}" style="object-fit:cover;"></div>`
      : `<div style="height:140px; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.2);">
           <i class="ph-fill ph-clipboard-text" style="font-size:64px; color:${iconColor}; opacity:0.15;"></i>
         </div>`;

    return `
      <div class="glass-card hover-lift" style="display:flex; flex-direction:column; overflow:hidden; padding:0;">

        <!-- Area superior (imagen/icono) -->
        <div style="height:140px; overflow:hidden; position:relative; flex-shrink:0;">
          ${coverArea}
          
          <!-- Boton para cambiar portada (Fase 1.2) -->
          <button data-cover="${routine.id}" title="Cambiar portada"
            style="position:absolute; bottom:8px; right:8px; width:32px; height:32px; border-radius:8px; background:rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.15); color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(8px); z-index:10;">
            <i class="ph-bold ph-camera" style="font-size:14px;"></i>
          </button>

          <!-- Badge grupo muscular -->
          <div style="position:absolute; top:10px; right:10px; z-index:5;">
            <span class="badge" style="color:${primaryColor}; border-color:${primaryColor}33; background:${primaryColor}1a; font-size:10px; font-weight:800; text-transform:uppercase;">
              ${primaryMuscle}
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
