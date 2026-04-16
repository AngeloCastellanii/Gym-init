/**
 * ============================================================
 *  <active-session-view> — Tracker de Entrenamiento
 *
 *  Vista para registrar sesiones de entrenamiento en tiempo real.
 *  Maneja la seleccion de rutina, el cronometro y el log de series.
 * ============================================================
 */

class ActiveSessionView extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
    this._routines = [];
    this._selectedRoutine = null;
    this._isActive = false;
    this._startTime = 0;
    this._timerInterval = null;
    this._logs = [];
  }

  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    // Pantalla inicial de seleccion
    this._renderSetup();
  }

  disconnectedCallback() {
    if (this._timerInterval) {
      clearInterval(this._timerInterval);
    }
  }

  /** Carga rutinas desde la DB */
  async loadData() {
    try {
      this._routines = await GymDB.routines.getAll();
      this._populateRoutineSelector();
    } catch (err) {
      console.error('Error al cargar rutinas:', err);
    }
  }

  // ════════════════════════════════════════════
  //  VISTA: SETUP (Seleccion de Rutina)
  // ════════════════════════════════════════════

  _renderSetup() {
    this.innerHTML = `
      <div class="view-content" style="display:flex; align-items:center; justify-content:center; min-height:80vh;">
        <div class="glass-card view-enter" style="padding:48px 40px; text-align:center; max-width:440px; width:100%;">
          <div style="width:80px; height:80px; border-radius:var(--radius-lg); background:linear-gradient(135deg, var(--accent), var(--accent-light)); display:flex; align-items:center; justify-content:center; margin:0 auto 24px; box-shadow: 0 8px 32px var(--accent-glow);">
            <i class="ph-fill ph-barbell" style="font-size:42px; color:#fff;"></i>
          </div>
          <h2 style="font-size:26px; font-weight:800; margin-bottom:8px; letter-spacing:-0.5px; color:#FFFFFF;">Modo Entrenamiento</h2>
          <p style="color:var(--text-secondary); margin-bottom:32px; font-size:14px;">Selecciona una rutina para comenzar su seguimiento</p>
          
          <div class="form-group" style="margin-bottom:24px;">
            <select class="form-select" id="session-routine-select" style="text-align:center; height:50px; font-size:15px; font-weight:600;">
              <option value="">— Seleccionar rutina —</option>
            </select>
          </div>

          <button class="btn btn-success" id="btn-start-session" style="width:100%; justify-content:center; padding:18px; font-size:16px; font-weight:700; letter-spacing:0.5px; text-transform:uppercase;">
            <i class="ph-bold ph-play"></i>
            INICIAR SESION
          </button>
        </div>
      </div>
    `;

    this.querySelector('#btn-start-session').addEventListener('click', () => this._startSession());
  }

  _populateRoutineSelector() {
    const select = this.querySelector('#session-routine-select');
    if (!select) return;

    select.innerHTML = '<option value="">— Seleccionar rutina —</option>';
    this._routines.forEach(rt => {
      const option = document.createElement('option');
      option.value = rt.id;
      option.textContent = `${rt.name} (${rt.exercises.length} ej.)`;
      select.appendChild(option);
    });
  }

  // ════════════════════════════════════════════
  //  ACCION: INICIAR SESION
  // ════════════════════════════════════════════

  async _startSession() {
    const routineId = this.querySelector('#session-routine-select').value;
    if (!routineId) return;

    try {
      this._selectedRoutine = await GymDB.routines.getWithExercises(routineId);
      if (!this._selectedRoutine || this._selectedRoutine.exercises.length === 0) {
        alert('Esta rutina no tiene ejercicios asignados.');
        return;
      }

      // Prepara los logs (vacio al inicio o con objetivos de la rutina)
      this._logs = this._selectedRoutine.exercises.map(entry => ({
        exerciseId: entry.exerciseId,
        exerciseName: entry.exercise.name,
        muscleGroup: entry.exercise.muscleGroup,
        sets: Array.from({ length: entry.sets || 3 }, () => ({
          weight: 0,
          reps: entry.reps || 10,
          done: false
        }))
      }));

      this._isActive = true;
      this._startTime = Date.now();
      
      this._renderActive();
      this._startTimer();

    } catch (err) {
      console.error('Error al iniciar sesion:', err);
    }
  }

  // ════════════════════════════════════════════
  //  VISTA: TRACKER ACTIVO
  // ════════════════════════════════════════════

  _renderActive() {
    this.innerHTML = `
      <div class="page-header" style="align-items: flex-start; margin-bottom: 24px;">
        <div style="flex:1;">
          <h1 class="page-title" style="font-size: 24px; color: #FFFFFF;">${this._selectedRoutine.name}</h1>
          <p class="page-subtitle">Sesion en curso • <span id="session-progress">0 / 0 series</span></p>
        </div>
        <div style="text-align: right;">
          <div class="chrono-display" id="session-timer" style="font-size: 28px; line-height: 1;">00:00</div>
          <p style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-top: 6px; letter-spacing: 0.1em;">Tiempo total</p>
        </div>
      </div>

      <div class="view-content" id="tracker-list">
        ${this._logs.map((log, exIdx) => this._renderExerciseCard(log, exIdx)).join('')}

        <div style="display:flex; gap:16px; margin-top:24px;">
          <button class="btn btn-ghost" id="btn-cancel-session" style="flex:1; justify-content:center;">
            <i class="ph-bold ph-trash"></i> Cancelar
          </button>
          <button class="btn btn-success" id="btn-finish-session" style="flex:2; justify-content:center; padding:18px; font-size:16px;">
            <i class="ph-bold ph-flag-checkered"></i> FINALIZAR SESION
          </button>
        </div>
      </div>
    `;

    this._updateProgress();
    this._attachEventListeners();
  }

  _renderExerciseCard(log, exIdx) {
    return `
      <div class="glass-card" style="padding: 0; overflow: hidden; margin-bottom: 20px;">
        <div style="padding: 16px 20px; background: rgba(255,255,255,0.02); display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-subtle);">
          <div style="display: flex; align-items: center; gap: 12px;">
             <span style="font-size: 12px; font-weight: 800; color: var(--accent-light); background: var(--accent-glow); width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid var(--accent-light);">
               ${exIdx + 1}
             </span>
             <h3 style="font-size: 16px; font-weight: 700;">${log.exerciseName}</h3>
          </div>
          ${muscleBadge(log.muscleGroup)}
        </div>
        
        <div style="padding: 8px 16px;">
          <!-- Headers de tabla -->
          <div style="display: grid; grid-template-columns: 40px 1fr 1fr 48px; gap: 8px; padding: 10px 0; border-bottom: 1px solid var(--border-subtle); margin-bottom: 8px;">
            <span style="font-size:10px; font-weight:800; color:var(--text-muted); text-transform:uppercase; text-align:center;">SET</span>
            <span style="font-size:10px; font-weight:800; color:var(--text-muted); text-transform:uppercase; text-align:center;">PESO (${unitLabel()})</span>
            <span style="font-size:10px; font-weight:800; color:var(--text-muted); text-transform:uppercase; text-align:center;">REPS</span>
            <span style="font-size:10px; font-weight:800; color:var(--text-muted); text-transform:uppercase; text-align:center;">OK</span>
          </div>

          <!-- Series -->
          <div id="exercise-${exIdx}-sets">
            ${log.sets.map((s, sIdx) => this._renderSetRow(exIdx, sIdx, s)).join('')}
          </div>

          <button class="btn btn-ghost" style="width: 100%; margin: 12px 0; font-size: 12px; height: 36px; justify-content: center;"
                  onclick="this.closest('active-session-view')._addSet(${exIdx})">
            <i class="ph ph-plus"></i> Agregar Serie
          </button>
        </div>
      </div>
    `;
  }

  _renderSetRow(exIdx, sIdx, s) {
    return `
      <div class="set-row ${s.done ? 'done' : ''}" data-ex="${exIdx}" data-set="${sIdx}">
        <div style="text-align:center; font-weight:800; color:var(--text-muted); font-size:14px;">${sIdx + 1}</div>
        <input type="number" class="set-weight" value="${s.weight}" step="0.5" data-ex="${exIdx}" data-set="${sIdx}" ${s.done ? 'disabled' : ''}>
        <input type="number" class="set-reps" value="${s.reps}" step="1" data-ex="${exIdx}" data-set="${sIdx}" ${s.done ? 'disabled' : ''}>
        <button class="check-btn" onclick="this.closest('active-session-view')._toggleSet(${exIdx}, ${sIdx})">
          <i class="ph-bold ${s.done ? 'ph-check' : 'ph-circle'}"></i>
        </button>
      </div>
    `;
  }

  // ════════════════════════════════════════════
  //  LOGICA DE NEGOCIO
  // ════════════════════════════════════════════

  _startTimer() {
    const timerDisplay = this.querySelector('#session-timer');
    this._timerInterval = setInterval(() => {
      const elapsed = Date.now() - this._startTime;
      timerDisplay.textContent = formatDuration(elapsed);
    }, 1000);
  }

  _toggleSet(exIdx, sIdx) {
    const log = this._logs[exIdx];
    const set = log.sets[sIdx];
    
    // Obtener valores actuales de los inputs antes de bloquear
    const row = this.querySelector(`.set-row[data-ex="${exIdx}"][data-set="${sIdx}"]`);
    if (!set.done) {
      set.weight = parseFloat(row.querySelector('.set-weight').value) || 0;
      set.reps = parseInt(row.querySelector('.set-reps').value) || 0;
    }

    set.done = !set.done;
    
    // Re-renderizar solo la fila
    row.outerHTML = this._renderSetRow(exIdx, sIdx, set);
    this._updateProgress();
  }

  _addSet(exIdx) {
    const log = this._logs[exIdx];
    const lastSet = log.sets[log.sets.length - 1];
    log.sets.push({
      weight: lastSet ? lastSet.weight : 0,
      reps: lastSet ? lastSet.reps : 10,
      done: false
    });
    this.querySelector(`#exercise-${exIdx}-sets`).innerHTML = log.sets.map((s, sIdx) => this._renderSetRow(exIdx, sIdx, s)).join('');
    this._updateProgress();
  }

  _updateProgress() {
    const total = this._logs.reduce((acc, log) => acc + log.sets.length, 0);
    const done = this._logs.reduce((acc, log) => acc + log.sets.filter(s => s.done).length, 0);
    const el = this.querySelector('#session-progress');
    if (el) el.textContent = `${done} / ${total} series completadas`;
  }

  _attachEventListeners() {
    this.querySelector('#btn-cancel-session').addEventListener('click', () => {
       const confirm = window.confirm("¿Seguro que quieres cancelar? Se perderán los datos.");
       if (confirm) window.location.hash = '#dashboard';
    });

    this.querySelector('#btn-finish-session').addEventListener('click', () => this._finishSession());

    // Manejar cambios en inputs de peso/reps manualmente para que se guarden en el estado
    this.addEventListener('input', (e) => {
      if (e.target.matches('.set-weight') || e.target.matches('.set-reps')) {
        const exIdx = parseInt(e.target.dataset.ex);
        const sIdx = parseInt(e.target.dataset.set);
        const log = this._logs[exIdx];
        const set = log.sets[sIdx];
        if (e.target.matches('.set-weight')) set.weight = parseFloat(e.target.value) || 0;
        else set.reps = parseInt(e.target.value) || 0;
      }
    });
  }

  async _finishSession() {
    const doneCount = this._logs.reduce((acc, log) => acc + log.sets.filter(s => s.done).length, 0);
    
    if (doneCount === 0) {
      alert("No has completado ninguna serie.");
      return;
    }

    const duration = Date.now() - this._startTime;
    const finalLogs = this._logs.map(log => ({
      exerciseId: log.exerciseId,
      sets: log.sets.filter(s => s.done).map(s => ({ weight: s.weight, reps: s.reps, done: true }))
    })).filter(log => log.sets.length > 0);

    try {
      await GymDB.sessions.add({
        routineId: this._selectedRoutine.id,
        duration: duration,
        logs: finalLogs
      });
      window.location.hash = '#sessions';
    } catch (err) {
      alert("Error al guardar la sesion: " + err.message);
    }
  }
}

customElements.define('active-session-view', ActiveSessionView);
