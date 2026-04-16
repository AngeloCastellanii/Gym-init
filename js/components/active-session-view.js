/**
 * ============================================================
 *  <active-session-view> — Tracker de Entrenamiento
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
    this._renderSetup();
  }

  disconnectedCallback() {
    if (this._timerInterval) clearInterval(this._timerInterval);
  }

  async loadData() {
    try {
      this._routines = await GymDB.routines.getAll();
      this._populateRoutineSelector();
    } catch (err) { console.error('Error loadData:', err); }
  }

  _renderSetup() {
    this.innerHTML = `
      <div class="view-content" style="display:flex; align-items:center; justify-content:center; min-height:80vh;">
        <div class="glass-card view-enter" style="padding:48px 40px; text-align:center; max-width:440px; width:100%;">
          <div style="width:80px; height:80px; border-radius:var(--radius-lg); background:linear-gradient(135deg, var(--accent), var(--accent-light)); display:flex; align-items:center; justify-content:center; margin:0 auto 24px; box-shadow: 0 8px 32px var(--accent-glow);">
            <i class="ph-fill ph-barbell" style="font-size:42px; color:#fff;"></i>
          </div>
          <h2 style="font-size:26px; font-weight:800; margin-bottom:8px; color:#FFFFFF;">Modo Entrenamiento</h2>
          <p style="color:var(--text-secondary); margin-bottom:32px; font-size:14px;">Selecciona una rutina para comenzar</p>
          <select class="form-select" id="session-routine-select" style="text-align:center; margin-bottom:24px; font-weight:600; background: #1E293B;">
            <option value="">— Seleccionar rutina —</option>
          </select>
          <button class="btn btn-success" id="btn-start-session" style="width:100%; justify-content:center; padding:18px; font-size:16px; font-weight:800;">
            <i class="ph-bold ph-play"></i> INICIAR SESIÓN
          </button>
        </div>
      </div>
    `;
    this.querySelector('#btn-start-session').addEventListener('click', () => this._startSession());
  }

  _populateRoutineSelector() {
    const select = this.querySelector('#session-routine-select');
    if (!select) return;
    this._routines.forEach(rt => {
      const opt = document.createElement('option');
      opt.value = rt.id;
      opt.textContent = rt.name;
      select.appendChild(opt);
    });
  }

  async _startSession() {
    const id = this.querySelector('#session-routine-select').value;
    if (!id) return;
    
    this._selectedRoutine = await GymDB.routines.getWithExercises(id);
    if (!this._selectedRoutine) return;

    this._logs = this._selectedRoutine.exercises.map(entry => ({
      exerciseId: entry.exerciseId,
      exerciseName: entry.exercise.name,
      muscleGroup: entry.exercise.muscleGroup,
      sets: Array.from({ length: entry.sets || 3 }, () => ({ weight: 0, reps: entry.reps || 10, done: false }))
    }));

    this._isActive = true;
    this._startTime = Date.now();
    this._renderActive();
    this._startTimer();
  }

  _renderActive() {
    this.innerHTML = `
      <div class="page-header" style="align-items: flex-start; margin-bottom: 24px;">
        <div style="flex:1;">
          <h1 class="page-title" style="font-size: 24px; color: #FFFFFF;">${this._selectedRoutine.name}</h1>
          <p class="page-subtitle">Entrenando ahora • <span id="session-progress" style="color:var(--accent-light); font-weight:700;">0 series completadas</span></p>
        </div>
        <div style="text-align: right; background: rgba(255,255,255,0.03); padding: 10px 16px; border-radius: 12px; border: 1px solid var(--border);">
          <div class="chrono-display" id="session-timer" style="font-size: 26px; color:#FFFFFF;">00:00</div>
          <p style="font-size: 9px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-top:2px;">Tiempo Transcurrido</p>
        </div>
      </div>

      <div class="view-content" id="active-tracker-list">
        ${this._logs.map((log, i) => this._renderExCard(log, i)).join('')}
        
        <div style="display:flex; gap:16px; margin-top:32px;">
          <button class="btn btn-ghost" onclick="if(confirm('¿Cancelar sesión?')) window.location.hash='#dashboard'" style="flex:1; justify-content:center; border-color:transparent;">Cancelar</button>
          <button class="btn btn-success" id="btn-finish" style="flex:2; justify-content:center; padding:18px; font-size:16px; letter-spacing:1px;">
            <i class="ph-bold ph-flag-checkered"></i> FINALIZAR Y GUARDAR
          </button>
        </div>
      </div>
    `;
    this.querySelector('#btn-finish').addEventListener('click', () => this._finish());
    this._updateProgress();
  }

  _renderExCard(log, i) {
    return `
      <div class="glass-card view-enter" style="padding: 0; overflow: hidden; margin-bottom: 20px; border-color: rgba(255,255,255,0.06);">
        <div style="padding: 16px 20px; background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-subtle);">
          <div style="display: flex; align-items: center; gap:16px;">
             <!-- Control de Orden Estético -->
             <div class="order-control-stack" style="display:flex; flex-direction:column; align-items:center; background: rgba(0,0,0,0.2); border-radius: 8px; padding: 4px; border: 1px solid rgba(255,255,255,0.05);">
               <button class="order-btn" style="border:none; background:none; color:var(--text-muted); cursor:pointer; padding:0; line-height:1; transition:color 0.2s;" onclick="this.closest('active-session-view')._moveEx(${i}, -1)">
                 <i class="ph-bold ph-caret-up" style="font-size:12px;"></i>
               </button>
               <span style="font-weight:900; color:var(--text-primary); font-size:12px; margin: 2px 0;">${i+1}</span>
               <button class="order-btn" style="border:none; background:none; color:var(--text-muted); cursor:pointer; padding:0; line-height:1; transition:color 0.2s;" onclick="this.closest('active-session-view')._moveEx(${i}, 1)">
                 <i class="ph-bold ph-caret-down" style="font-size:12px;"></i>
               </button>
             </div>
             <h3 style="font-size:17px; font-weight:700; color:#FFFFFF; letter-spacing:-0.02em;">${log.exerciseName}</h3>
          </div>
          <span class="badge badge-blue" style="opacity:0.8;">${log.muscleGroup}</span>
        </div>
        
        <div style="padding: 12px 20px;">
          <div id="ex-${i}-sets">
            ${log.sets.map((s, si) => this._renderSetRow(i, si, s)).join('')}
          </div>
          <button class="btn btn-ghost" style="width:100%; margin-top:16px; height:40px; justify-content:center; border: 1px dashed rgba(255,255,255,0.1); background:rgba(255,255,255,0.01);" onclick="this.closest('active-session-view')._addSet(${i})">
            <i class="ph-bold ph-plus-circle"></i> Agregar Serie
          </button>
        </div>
      </div>
    `;
  }

  _renderSetRow(exIdx, setIdx, s) {
    return `
      <div class="set-row ${s.done ? 'done' : ''}" style="display:grid; grid-template-columns: 35px 1fr 1fr 44px 44px; gap:12px; align-items:center; padding:8px 0; border-bottom: 1px solid rgba(255,255,255,0.02);">
        <span style="text-align:center; font-weight:800; color:var(--text-muted); font-size:12px;">${setIdx+1}</span>
        
        <div style="position:relative;">
          <input type="number" value="${s.weight}" class="form-input" style="height:40px; text-align:center; background:#0B0E14; border:1px solid #1F2937; color:#FFF; font-weight:700; border-radius:8px;" oninput="this.closest('active-session-view')._updVal(${exIdx}, ${setIdx}, 'weight', this.value)" ${s.done ? 'disabled' : ''}>
          <span style="position:absolute; right:10px; top:50%; transform:translateY(-50%); font-size:9px; font-weight:800; color:var(--text-muted); pointer-events:none;">${unitLabel()}</span>
        </div>

        <div style="position:relative;">
          <input type="number" value="${s.reps}" class="form-input" style="height:40px; text-align:center; background:#0B0E14; border:1px solid #1F2937; color:#FFF; font-weight:700; border-radius:8px;" oninput="this.closest('active-session-view')._updVal(${exIdx}, ${setIdx}, 'reps', this.value)" ${s.done ? 'disabled' : ''}>
          <span style="position:absolute; right:10px; top:50%; transform:translateY(-50%); font-size:9px; font-weight:800; color:var(--text-muted); pointer-events:none;">REPS</span>
        </div>

        <button class="check-btn" style="width:40px; height:40px; border-radius:10px;" onclick="this.closest('active-session-view')._toggleSet(${exIdx}, ${setIdx})">
          <i class="ph-bold ${s.done ? 'ph-check' : 'ph-circle'}"></i>
        </button>

        <button class="btn btn-icon btn-danger" style="width:40px; height:40px; border-radius:10px; background:rgba(239, 68, 68, 0.05); border:1px solid rgba(239, 68, 68, 0.1); visibility: ${s.done ? 'hidden' : 'visible'};" onclick="this.closest('active-session-view')._delSet(${exIdx}, ${setIdx})">
          <i class="ph-bold ph-trash-simple" style="font-size:16px;"></i>
        </button>
      </div>
    `;
  }

  _moveEx(idx, dir) {
    const nIdx = idx + dir;
    if(nIdx < 0 || nIdx >= this._logs.length) return;
    const tmp = this._logs[idx];
    this._logs[idx] = this._logs[nIdx];
    this._logs[nIdx] = tmp;
    this._renderActive();
  }

  _updVal(ei, si, f, v) { this._logs[ei].sets[si][f] = parseFloat(v) || 0; }

  _toggleSet(ei, si) {
    this._logs[ei].sets[si].done = !this._logs[ei].sets[si].done;
    this._renderActive();
  }

  _addSet(ei) {
    const last = this._logs[ei].sets[this._logs[ei].sets.length-1];
    this._logs[ei].sets.push({ weight: last ? last.weight : 0, reps: last ? last.reps : 10, done: false });
    this._renderActive();
  }

  _delSet(ei, si) {
    this._logs[ei].sets.splice(si, 1);
    this._renderActive();
  }

  _updateProgress() {
    const total = this._logs.reduce((a,l) => a + l.sets.length, 0);
    const done = this._logs.reduce((a,l) => a + l.sets.filter(s => s.done).length, 0);
    const el = this.querySelector('#session-progress');
    if(el) el.textContent = `${done} / ${total} series completadas`;
  }

  _startTimer() {
    this._timerInterval = setInterval(() => {
      const elap = Date.now() - this._startTime;
      const el = this.querySelector('#session-timer');
      if(el) el.textContent = formatDuration(elap);
    }, 1000);
  }

  async _finish() {
    const dur = Date.now() - this._startTime;
    const finalLogs = this._logs.map(l => ({ exerciseId: l.exerciseId, sets: l.sets.filter(s => s.done) })).filter(l => l.sets.length > 0);
    if(!finalLogs.length) return alert("Completa al menos una serie.");
    await GymDB.sessions.add({ routineId: this._selectedRoutine.id, duration: dur, logs: finalLogs });
    window.location.hash = '#sessions';
  }
}

customElements.define('active-session-view', ActiveSessionView);
