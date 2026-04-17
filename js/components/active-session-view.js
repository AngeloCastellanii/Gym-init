/**
 * ============================================================
 *  <active-session-view> — Tracker de Entrenamiento
 *  Soporta: Modo Rutina, Modo Libre, Persistencia entre vistas
 *  y sugerencias de peso basadas en historial.
 * ============================================================
 */

// Clave en sessionStorage para persistir el estado
const SESSION_STATE_KEY = 'gym-active-session';

class ActiveSessionView extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
    this._routines = [];
    this._selectedRoutine = null;
    this._mode = 'routine'; // 'routine' | 'free'
    this._startTime = 0;
    this._timerInterval = null;
    this._logs = [];
    this._lastWeights = {}; // { exerciseId: { weight, reps } }
    this._freeSessionName = '';
    this._freeNotes = '';
    this._phase = 'setup'; // 'setup' | 'active-routine' | 'active-free'
  }

  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    // Intentar restaurar sesion activa guardada
    const saved = this._loadState();
    if (saved && saved.phase && saved.phase !== 'setup') {
      this._restoreFromState(saved);
    } else {
      this._renderSetup();
    }
  }

  disconnectedCallback() {
    // NO limpiar el timer ni el estado — solo pausamos la visualizacion
    // El timer real se recalcula desde _startTime al restaurar
    if (this._timerInterval) {
      clearInterval(this._timerInterval);
      this._timerInterval = null;
    }
  }

  // ======================================================
  //  PERSISTENCIA (sessionStorage)
  // ======================================================
  _saveState() {
    const state = {
      phase:             this._phase,
      mode:              this._mode,
      startTime:         this._startTime,
      logs:              this._logs,
      freeSessionName:   this._freeSessionName,
      freeNotes:         this._freeNotes,
      selectedRoutineId: this._selectedRoutine ? this._selectedRoutine.id : null
    };
    sessionStorage.setItem(SESSION_STATE_KEY, JSON.stringify(state));
  }

  _loadState() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_STATE_KEY) || 'null');
    } catch { return null; }
  }

  _clearState() {
    sessionStorage.removeItem(SESSION_STATE_KEY);
  }

  async _restoreFromState(state) {
    this._phase     = state.phase;
    this._mode      = state.mode;
    this._startTime = state.startTime;
    this._logs      = state.logs || [];
    this._freeSessionName = state.freeSessionName || '';
    this._freeNotes       = state.freeNotes || '';

    if (state.phase === 'active-routine' && state.selectedRoutineId) {
      try {
        this._selectedRoutine = await GymDB.routines.getWithExercises(state.selectedRoutineId);
      } catch { /* si falla, setup */ }
      this._renderActive();
      this._startTimer('session-timer');
    } else if (state.phase === 'active-free') {
      this._renderFreeActive();
      this._startTimer('free-timer');
    } else {
      this._renderSetup();
    }
  }

  // ======================================================
  //  HISTORIAL DE PESOS (sugerencias)
  // ======================================================
  async _buildLastWeightsMap() {
    try {
      const sessions = await GymDB.sessions.getAll();
      // Ordenar de más reciente a más antigua
      sessions.sort((a, b) => new Date(b.date) - new Date(a.date));
      const map = {};
      for (const sess of sessions) {
        if (!sess.logs) continue;
        for (const log of sess.logs) {
          if (map[log.exerciseId]) continue; // ya tenemos el más reciente
          const doneSets = (log.sets || []).filter(s => s.done !== false);
          if (doneSets.length > 0) {
            const lastSet = doneSets[doneSets.length - 1];
            map[log.exerciseId] = { weight: lastSet.weight, reps: lastSet.reps };
          }
        }
      }
      this._lastWeights = map;
    } catch { this._lastWeights = {}; }
  }

  // ======================================================
  //  SETUP
  // ======================================================
  async loadData() {
    try {
      this._routines = await GymDB.routines.getAll();
      this._populateRoutineSelector();
    } catch (err) { console.error('Error loadData:', err); }
  }

  _renderSetup() {
    this._phase = 'setup';
    this.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Iniciar Entrenamiento</h1>
      </div>
      <div class="view-content" style="max-width:520px; margin:0 auto;">

        <!-- Selector de modo -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:32px;">
          <div class="glass-card mode-card active-mode" id="mode-routine" style="padding:24px; text-align:center; cursor:pointer; border:2px solid var(--accent); transition:all 0.2s;">
            <i class="ph-fill ph-barbell" style="font-size:36px; color:var(--accent-light); margin-bottom:10px;"></i>
            <h3 style="font-size:15px; font-weight:800; color:#FFF;">Con Rutina</h3>
            <p style="font-size:12px; color:var(--text-secondary); margin-top:4px;">Series, pesos y repeticiones</p>
          </div>
          <div class="glass-card mode-card" id="mode-free" style="padding:24px; text-align:center; cursor:pointer; border:2px solid transparent; transition:all 0.2s;">
            <i class="ph-fill ph-timer" style="font-size:36px; color:var(--text-muted); margin-bottom:10px;"></i>
            <h3 style="font-size:15px; font-weight:800; color:var(--text-secondary);">Sesion Libre</h3>
            <p style="font-size:12px; color:var(--text-muted); margin-top:4px;">Cardio, deporte o actividad libre</p>
          </div>
        </div>

        <!-- Panel Rutina -->
        <div id="panel-routine">
          <label class="form-label">Seleccionar Rutina</label>
          <select class="form-select" id="session-routine-select" style="margin-top:8px; margin-bottom:24px; font-weight:600; background:#1E293B;">
            <option value="">— Elegir rutina —</option>
          </select>
        </div>

        <!-- Panel Libre -->
        <div id="panel-free" style="display:none;">
          <div class="form-group">
            <label class="form-label">Nombre de la actividad</label>
            <input class="form-input" id="free-name" placeholder="Ej: Correr 5km, Futbol, HIIT..." style="background:#1E293B; color:#FFF; margin-top:8px;">
          </div>
          <div class="form-group" style="margin-top:16px;">
            <label class="form-label">Notas (opcional)</label>
            <textarea class="form-textarea" id="free-notes" placeholder="Distancia, intensidad, como te sentiste..." style="background:#1E293B; color:#FFF; min-height:80px; margin-top:8px;"></textarea>
          </div>
        </div>

        <button class="btn btn-success" id="btn-start-session" style="width:100%; justify-content:center; padding:20px; font-size:17px; font-weight:800; margin-top:8px;">
          <i class="ph-bold ph-play"></i> INICIAR SESION
        </button>
      </div>
    `;

    this.querySelector('#mode-routine').addEventListener('click', () => this._setMode('routine'));
    this.querySelector('#mode-free').addEventListener('click',    () => this._setMode('free'));
    this.querySelector('#btn-start-session').addEventListener('click', () => this._startSession());
    this._populateRoutineSelector();
  }

  _populateRoutineSelector() {
    const select = this.querySelector('#session-routine-select');
    if (!select || !this._routines.length) return;
    select.innerHTML = '<option value="">— Elegir rutina —</option>';
    this._routines.forEach(rt => {
      const opt = document.createElement('option');
      opt.value = rt.id;
      opt.textContent = rt.name;
      select.appendChild(opt);
    });
  }

  _setMode(mode) {
    this._mode = mode;
    const routineCard  = this.querySelector('#mode-routine');
    const freeCard     = this.querySelector('#mode-free');
    const panelRoutine = this.querySelector('#panel-routine');
    const panelFree    = this.querySelector('#panel-free');

    if (mode === 'routine') {
      routineCard.style.borderColor = 'var(--accent)';
      routineCard.querySelector('i').style.color = 'var(--accent-light)';
      routineCard.querySelector('h3').style.color = '#FFF';
      freeCard.style.borderColor = 'transparent';
      freeCard.querySelector('i').style.color = 'var(--text-muted)';
      freeCard.querySelector('h3').style.color = 'var(--text-secondary)';
      panelRoutine.style.display = 'block';
      panelFree.style.display = 'none';
    } else {
      freeCard.style.borderColor = 'var(--accent)';
      freeCard.querySelector('i').style.color = 'var(--accent-light)';
      freeCard.querySelector('h3').style.color = '#FFF';
      routineCard.style.borderColor = 'transparent';
      routineCard.querySelector('i').style.color = 'var(--text-muted)';
      routineCard.querySelector('h3').style.color = 'var(--text-secondary)';
      panelRoutine.style.display = 'none';
      panelFree.style.display = 'block';
    }
  }

  async _startSession() {
    if (this._mode === 'free') {
      const name = this.querySelector('#free-name').value.trim();
      if (!name) return alert('Ponle un nombre a tu actividad.');
      this._freeSessionName = name;
      this._freeNotes = this.querySelector('#free-notes').value.trim();
      this._startTime = Date.now();
      this._phase = 'active-free';
      this._saveState();
      this._renderFreeActive();
      this._startTimer('free-timer');
    } else {
      const id = this.querySelector('#session-routine-select').value;
      if (!id) return alert('Selecciona una rutina.');
      this._selectedRoutine = await GymDB.routines.getWithExercises(id);
      if (!this._selectedRoutine) return;

      // Cargar historial de pesos antes de construir los logs
      await this._buildLastWeightsMap();

      this._logs = this._selectedRoutine.exercises.map(entry => {
        const lastData = this._lastWeights[entry.exerciseId];
        const suggestedWeight = lastData ? lastData.weight : 0;
        const suggestedReps   = lastData ? lastData.reps   : (entry.reps || 10);
        return {
          exerciseId:   entry.exerciseId,
          exerciseName: entry.exercise ? entry.exercise.name : 'Ejercicio',
          muscleGroup:  entry.exercise ? entry.exercise.muscleGroup : '',
          lastData,
          sets: Array.from({ length: entry.sets || 3 }, () => ({
            weight: suggestedWeight,
            reps:   suggestedReps,
            done:   false
          }))
        };
      });

      this._startTime = Date.now();
      this._phase = 'active-routine';
      this._saveState();
      this._renderActive();
      this._startTimer('session-timer');
    }
  }

  // ======================================================
  //  MODO LIBRE
  // ======================================================
  _renderFreeActive() {
    this.innerHTML = `
      <div class="page-header" style="align-items:flex-start;">
        <div style="flex:1;">
          <h1 class="page-title" style="color:#FFFFFF;">${this._freeSessionName}</h1>
          <p class="page-subtitle">Sesion libre en curso</p>
          ${this._freeNotes ? `<p style="font-size:13px; color:var(--text-muted); margin-top:6px; font-style:italic;">${this._freeNotes}</p>` : ''}
        </div>
        <div style="text-align:right; background:rgba(255,255,255,0.03); padding:12px 20px; border-radius:14px; border:1px solid var(--border);">
          <div class="chrono-display" id="free-timer" style="font-size:38px; letter-spacing:3px; color:#FFFFFF;">00:00</div>
          <p style="font-size:9px; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em; margin-top:4px;">Tiempo Activo</p>
        </div>
      </div>

      <div class="view-content" style="max-width:520px; margin:0 auto;">
        <div class="glass-card" style="padding:40px; text-align:center; margin-bottom:24px;">
          <div style="width:80px; height:80px; border-radius:50%; border:3px solid var(--accent-light); display:flex; align-items:center; justify-content:center; margin:0 auto 20px;">
            <i class="ph-fill ph-timer" style="font-size:40px; color:var(--accent-light);"></i>
          </div>
          <p style="font-size:15px; color:var(--text-secondary);">El tiempo corre. Dale todo.</p>
          <div id="free-extra-notes" style="margin-top:24px;">
            <label class="form-label">Notas finales (opcional)</label>
            <textarea id="free-final-notes" class="form-textarea" placeholder="Como te fue, distancia recorrida, etc..." style="background:#0B0E14; color:#FFF; margin-top:8px; min-height:80px;"></textarea>
          </div>
        </div>

        <div style="display:flex; gap:12px;">
          <button class="btn btn-ghost" id="btn-cancel-free" style="flex:1; justify-content:center;">Cancelar</button>
          <button class="btn btn-success" id="btn-finish-free" style="flex:2; justify-content:center; padding:18px; font-size:16px; font-weight:800;">
            <i class="ph-bold ph-flag-checkered"></i> FINALIZAR
          </button>
        </div>
      </div>
    `;
    this.querySelector('#btn-cancel-free').addEventListener('click', () => {
      if (confirm('Cancelar sesion? El progreso se perdera.')) {
        this._clearState();
        if (this._timerInterval) clearInterval(this._timerInterval);
        window.location.hash = '#dashboard';
      }
    });
    this.querySelector('#btn-finish-free').addEventListener('click', () => this._finishFree());
    // Actualizar timer inmediatamente con tiempo transcurrido real
    const timerEl = this.querySelector('#free-timer');
    if (timerEl) timerEl.textContent = formatDuration(Date.now() - this._startTime);
  }

  async _finishFree() {
    const dur = Date.now() - this._startTime;
    const notesEl = this.querySelector('#free-final-notes');
    const finalNotes = notesEl ? notesEl.value.trim() : '';
    try {
      await GymDB.sessions.add({
        type:     'free',
        name:     this._freeSessionName,
        notes:    finalNotes || this._freeNotes,
        duration: dur,
        logs:     []
      });
      this._clearState();
      if (this._timerInterval) clearInterval(this._timerInterval);
      window.location.hash = '#sessions';
    } catch (err) {
      console.error('Error al guardar sesion libre:', err);
      alert('Error al guardar la sesion: ' + err.message);
    }
  }

  // ======================================================
  //  MODO RUTINA
  // ======================================================
  _renderActive() {
    this.innerHTML = `
      <div class="page-header" style="align-items:flex-start; margin-bottom:24px;">
        <div style="flex:1;">
          <h1 class="page-title" style="font-size:22px; color:#FFFFFF;">${this._selectedRoutine ? this._selectedRoutine.name : 'Entrenamiento'}</h1>
          <p class="page-subtitle">Entrenando • <span id="session-progress" style="color:var(--accent-light); font-weight:700;">0 series completadas</span></p>
        </div>
        <div style="text-align:right; background:rgba(255,255,255,0.03); padding:10px 16px; border-radius:12px; border:1px solid var(--border);">
          <div class="chrono-display" id="session-timer" style="font-size:26px; color:#FFFFFF;">00:00</div>
          <p style="font-size:9px; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em; margin-top:2px;">Tiempo Total</p>
        </div>
      </div>

      <div class="view-content" id="active-tracker-list">
        ${this._logs.map((log, i) => this._renderExCard(log, i)).join('')}
        <div style="display:flex; gap:16px; margin-top:24px;">
          <button class="btn btn-ghost" id="btn-cancel-routine" style="flex:1; justify-content:center;">Cancelar</button>
          <button class="btn btn-success" id="btn-finish" style="flex:2; justify-content:center; padding:18px; font-size:16px; font-weight:800;">
            <i class="ph-bold ph-flag-checkered"></i> FINALIZAR Y GUARDAR
          </button>
        </div>
      </div>
    `;
    this.querySelector('#btn-cancel-routine').addEventListener('click', () => {
      if (confirm('Cancelar sesion? El progreso se perdera.')) {
        this._clearState();
        if (this._timerInterval) clearInterval(this._timerInterval);
        window.location.hash = '#dashboard';
      }
    });
    this.querySelector('#btn-finish').addEventListener('click', () => this._finish());
    // Actualizar timer con tiempo real transcurrido
    const timerEl = this.querySelector('#session-timer');
    if (timerEl) timerEl.textContent = formatDuration(Date.now() - this._startTime);
    this._updateProgress();
  }

  _renderExCard(log, i) {
    const lastData = log.lastData;
    const lastHint = lastData
      ? `<span style="font-size:11px; color:var(--accent-light); font-weight:600; display:flex; align-items:center; gap:4px; margin-top:2px;">
           <i class="ph-bold ph-clock-counter-clockwise" style="font-size:10px;"></i>
           Última vez: ${lastData.weight} ${unitLabel()} × ${lastData.reps} reps
         </span>`
      : `<span style="font-size:11px; color:var(--text-muted); margin-top:2px;">Sin historial aún</span>`;

    return `
      <div class="glass-card view-enter" style="padding:0; overflow:hidden; margin-bottom:20px; border-color:rgba(255,255,255,0.06);">
        <div style="padding:14px 20px; background:rgba(255,255,255,0.02); display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--border-subtle);">
          <div style="display:flex; align-items:center; gap:14px;">
            <div style="display:flex; flex-direction:column; align-items:center; background:rgba(0,0,0,0.2); border-radius:8px; padding:4px; border:1px solid rgba(255,255,255,0.05);">
              <button class="order-btn" style="border:none; background:none; color:var(--text-muted); cursor:pointer; padding:0; height:14px;" onclick="this.closest('active-session-view')._moveEx(${i}, -1)">
                <i class="ph-bold ph-caret-up" style="font-size:12px;"></i>
              </button>
              <span style="font-weight:900; color:var(--accent-light); font-size:12px; margin:2px 0;">${i+1}</span>
              <button class="order-btn" style="border:none; background:none; color:var(--text-muted); cursor:pointer; padding:0; height:14px;" onclick="this.closest('active-session-view')._moveEx(${i}, 1)">
                <i class="ph-bold ph-caret-down" style="font-size:12px;"></i>
              </button>
            </div>
            <div>
              <h3 style="font-size:16px; font-weight:700; color:#FFFFFF;">${log.exerciseName}</h3>
              ${lastHint}
            </div>
          </div>
          <span class="badge badge-slate" style="opacity:0.8;">${log.muscleGroup}</span>
        </div>
        <div style="padding:12px 20px;">
          <div id="ex-${i}-sets">
            ${log.sets.map((s, si) => this._renderSetRow(i, si, s)).join('')}
          </div>
          <button class="btn btn-ghost" style="width:100%; margin-top:12px; height:40px; justify-content:center; border:1px dashed rgba(255,255,255,0.1);" onclick="this.closest('active-session-view')._addSet(${i})">
            <i class="ph-bold ph-plus-circle"></i> Agregar Serie
          </button>
        </div>
      </div>
    `;
  }

  _renderSetRow(exIdx, setIdx, s) {
    return `
      <div class="set-row ${s.done ? 'done' : ''}" style="display:grid; grid-template-columns:35px 1fr 1fr 44px 44px; gap:12px; align-items:center; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.02);">
        <span style="text-align:center; font-weight:800; color:var(--text-muted); font-size:12px;">${setIdx+1}</span>
        <div style="position:relative;">
          <input type="number" value="${s.weight}" class="form-input" style="height:40px; text-align:center; background:#0B0E14; border:1px solid #1F2937; color:#FFF; font-weight:700; border-radius:8px;" oninput="this.closest('active-session-view')._updVal(${exIdx},${setIdx},'weight',this.value)" ${s.done?'disabled':''}>
          <span style="position:absolute; right:8px; top:50%; transform:translateY(-50%); font-size:9px; font-weight:800; color:var(--text-muted); pointer-events:none;">${unitLabel()}</span>
        </div>
        <div style="position:relative;">
          <input type="number" value="${s.reps}" class="form-input" style="height:40px; text-align:center; background:#0B0E14; border:1px solid #1F2937; color:#FFF; font-weight:700; border-radius:8px;" oninput="this.closest('active-session-view')._updVal(${exIdx},${setIdx},'reps',this.value)" ${s.done?'disabled':''}>
          <span style="position:absolute; right:8px; top:50%; transform:translateY(-50%); font-size:9px; font-weight:800; color:var(--text-muted); pointer-events:none;">REPS</span>
        </div>
        <button class="check-btn" style="width:40px; height:40px; border-radius:10px;" onclick="this.closest('active-session-view')._toggleSet(${exIdx},${setIdx})">
          <i class="ph-bold ${s.done?'ph-check':'ph-circle'}"></i>
        </button>
        <button class="btn btn-icon btn-danger" style="width:40px; height:40px; border-radius:10px; background:rgba(239,68,68,0.05); border:1px solid rgba(239,68,68,0.1); visibility:${s.done?'hidden':'visible'};" onclick="this.closest('active-session-view')._delSet(${exIdx},${setIdx})">
          <i class="ph-bold ph-trash-simple" style="font-size:15px;"></i>
        </button>
      </div>
    `;
  }

  _moveEx(idx, dir) {
    const nIdx = idx + dir;
    if (nIdx < 0 || nIdx >= this._logs.length) return;
    [this._logs[idx], this._logs[nIdx]] = [this._logs[nIdx], this._logs[idx]];
    this._saveState();
    this._renderActive();
    this._startTimer('session-timer');
  }

  _updVal(ei, si, f, v) {
    this._logs[ei].sets[si][f] = parseFloat(v) || 0;
    this._saveState();
  }

  _toggleSet(ei, si) {
    this._logs[ei].sets[si].done = !this._logs[ei].sets[si].done;
    this._saveState();
    this._renderActive();
    this._startTimer('session-timer');
  }

  _addSet(ei) {
    const last = this._logs[ei].sets.slice(-1)[0];
    this._logs[ei].sets.push({ weight: last ? last.weight : 0, reps: last ? last.reps : 10, done: false });
    this._saveState();
    this._renderActive();
    this._startTimer('session-timer');
  }

  _delSet(ei, si) {
    this._logs[ei].sets.splice(si, 1);
    this._saveState();
    this._renderActive();
    this._startTimer('session-timer');
  }

  _updateProgress() {
    const total = this._logs.reduce((a, l) => a + l.sets.length, 0);
    const done  = this._logs.reduce((a, l) => a + l.sets.filter(s => s.done).length, 0);
    const el = this.querySelector('#session-progress');
    if (el) el.textContent = `${done} / ${total} series completadas`;
  }

  _startTimer(elId) {
    if (this._timerInterval) clearInterval(this._timerInterval);
    this._timerInterval = setInterval(() => {
      const el = this.querySelector('#' + elId);
      if (el) el.textContent = formatDuration(Date.now() - this._startTime);
    }, 1000);
  }

  async _finish() {
    const dur = Date.now() - this._startTime;
    const finalLogs = this._logs
      .map(l => ({ exerciseId: l.exerciseId, sets: l.sets.filter(s => s.done) }))
      .filter(l => l.sets.length > 0);

    if (!finalLogs.length) {
      alert('Marca al menos una serie como completada (boton de check) antes de finalizar.');
      return;
    }

    try {
      await GymDB.sessions.add({
        type:      'routine',
        routineId: this._selectedRoutine.id,
        duration:  dur,
        logs:      finalLogs
      });
      this._clearState();
      if (this._timerInterval) clearInterval(this._timerInterval);
      window.location.hash = '#sessions';
    } catch (err) {
      console.error('Error al guardar sesion:', err);
      alert('Error al guardar la sesion: ' + err.message);
    }
  }
}

customElements.define('active-session-view', ActiveSessionView);
