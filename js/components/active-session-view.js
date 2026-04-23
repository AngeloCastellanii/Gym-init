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
    // Duracion del descanso (en segundos), cargada desde localStorage
    try {
      this._restDuration = parseInt(localStorage.getItem('gym-rest-duration') || '90', 10) || 90;
    } catch { this._restDuration = 90; }
    this._currentExIdx = 0;
  }

  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    // Intentar restaurar sesion activa guardada
    const saved = this._loadState();
    if (saved && saved.phase && saved.phase !== 'setup') {
      this._restoreFromState(saved);
      return;
    }

    // Verificar si viene desde rutinas con una rutina pre-seleccionada
    const pendingRoutineId = localStorage.getItem('pending-routine');
    if (pendingRoutineId) {
      localStorage.removeItem('pending-routine');
      this._renderSetup();
      this._autoStartRoutine(pendingRoutineId);
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

  // Inicia rutina directamente desde routines-view
  async _autoStartRoutine(routineId) {
    try {
      this._routines = await GymDB.routines.getAll();
      this._populateRoutineSelector();
      const select = this.querySelector('#session-routine-select');
      if (select) select.value = routineId;
      await this._startRoutineById(routineId);
    } catch (err) {
      console.error('Error al auto-iniciar rutina:', err);
    }
  }

  async _startRoutineById(id) {
    this._selectedRoutine = await GymDB.routines.getWithExercises(id);
    if (!this._selectedRoutine) return;
    await this._buildLastWeightsMap();
    this._logs = this._selectedRoutine.exercises.map(entry => {
      const lastData = this._lastWeights[entry.exerciseId];
      const suggestedWeight = lastData ? lastData.weight : 0;
      const suggestedReps   = lastData ? lastData.reps   : (entry.reps || 10);
      return {
        exerciseId:    entry.exerciseId,
        exerciseName:  entry.exercise ? entry.exercise.name : 'Ejercicio',
        muscleGroup:   entry.exercise ? entry.exercise.muscleGroup : '',
        exerciseImage: entry.exercise ? (entry.exercise.image || '') : '',
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
    this._startSessionTimer();
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
      this._startFreeTimer();
    } else {
      const id = this.querySelector('#session-routine-select').value;
      if (!id) return alert('Selecciona una rutina.');
      await this._startRoutineById(id);
    }
  }

  // ======================================================
  //  MODO LIBRE
  // ======================================================
  _renderFreeActive() {
    this.innerHTML = `
      <div class="page-header" style="align-items:flex-start;">
        <div style="flex:1;">
          <h1 class="page-title">${this._freeSessionName}</h1>
          <p class="page-subtitle">Sesion libre en curso</p>
          ${this._freeNotes ? `<p style="font-size:13px; color:var(--text-muted); margin-top:6px; font-style:italic;">${this._freeNotes}</p>` : ''}
        </div>
        <div style="text-align:right; background:rgba(128,128,128,0.08); padding:12px 20px; border-radius:14px; border:1px solid var(--border);">
          <div class="chrono-display" id="free-timer" style="font-size:38px; letter-spacing:3px; color:var(--text-primary);">00:00</div>
          <p style="font-size:9px; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em; margin-top:4px;">Tiempo Activo</p>
        </div>
      </div>

      <div class="view-content" style="max-width:520px; margin:0 auto;">
        <div class="glass-card" style="padding:48px 40px; text-align:center; margin-bottom:24px;">
          <div style="width:88px; height:88px; border-radius:50%; border:3px solid var(--accent-light); display:flex; align-items:center; justify-content:center; margin:0 auto 20px;">
            <i class="ph-fill ph-timer" style="font-size:44px; color:var(--accent-light);"></i>
          </div>
          <p style="font-size:17px; font-weight:800; color:var(--text-primary); margin-bottom:6px;">Dale todo!</p>
          <p style="font-size:13px; color:var(--text-secondary);">Al finalizar podras agregar distancia, intensidad y notas.</p>
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
    this.querySelector('#btn-finish-free').addEventListener('click', () => this._finishFreeFlow());
    // Mostrar tiempo real inmediatamente
    const timerEl = this.querySelector('#free-timer');
    if (timerEl) timerEl.textContent = formatDuration(Date.now() - this._startTime);
  }

  _startFreeTimer() {
    if (this._timerInterval) clearInterval(this._timerInterval);
    this._timerInterval = setInterval(() => {
      const el = this.querySelector('#free-timer');
      if (el) el.textContent = formatDuration(Date.now() - this._startTime);
    }, 1000);
  }

  _finishFreeFlow() {
    const dur = Date.now() - this._startTime;
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:999;display:flex;align-items:flex-end;justify-content:center;padding:0 16px;';
    overlay.innerHTML = `
      <div style="background:var(--bg-panel);border-radius:24px 24px 0 0;padding:28px 24px;width:100%;max-width:600px;max-height:85vh;overflow-y:auto;">
        <h3 style="font-size:20px;font-weight:900;color:var(--text-primary);margin-bottom:4px;">Sesion finalizada! 🏁</h3>
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:20px;">Agrega los detalles de tu actividad</p>
        <div style="display:grid; gap:14px;">
          <div>
            <label style="font-size:11px;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;display:block;margin-bottom:6px;">Como te fue</label>
            <textarea id="free-journal" class="form-textarea" placeholder="Buena carrera, mejore mi tiempo, me senti con energia..." style="background:var(--bg-card);color:var(--text-primary);min-height:80px;width:100%;border:1px solid var(--border);border-radius:12px;padding:12px;font-size:13px;"></textarea>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-size:11px;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;display:block;margin-bottom:6px;">Metrica / Resultado</label>
              <input id="free-metric" type="text" class="form-input" placeholder="Ej: 5 km, 2 horas, 500 kcal" style="background:var(--bg-card);color:var(--text-primary);border:1px solid var(--border);">
            </div>
            <div>
              <label style="font-size:11px;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;display:block;margin-bottom:6px;">Intensidad</label>
              <select id="free-intensity" class="form-select" style="background:var(--bg-card);color:var(--text-primary);border:1px solid var(--border);">
                <option value="">— Seleccionar —</option>
                <option>Baja</option><option>Media</option><option>Alta</option><option>Maxima</option>
              </select>
            </div>
          </div>
          <div>
            <label style="font-size:11px;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;display:block;margin-bottom:6px;">Detalle adicional</label>
            <input id="free-extra" type="text" class="form-input" placeholder="Ritmo, parciales, nivel completado..." style="background:var(--bg-card);color:var(--text-primary);border:1px solid var(--border);">
          </div>
        </div>
        <div style="display:flex;gap:12px;margin-top:20px;">
          <button id="cancel-free-finish" class="btn btn-ghost" style="flex:1;justify-content:center;">Seguir</button>
          <button id="confirm-free-finish" class="btn btn-success" style="flex:2;justify-content:center;padding:16px;font-size:15px;font-weight:800;"><i class="ph-bold ph-flag-checkered"></i> GUARDAR</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#cancel-free-finish').onclick = () => overlay.remove();
    overlay.querySelector('#confirm-free-finish').onclick = () => {
      const journal   = overlay.querySelector('#free-journal').value.trim();
      const metric    = overlay.querySelector('#free-metric').value.trim();
      const intensity = overlay.querySelector('#free-intensity').value;
      const extra     = overlay.querySelector('#free-extra').value.trim();
      overlay.remove();
      this._finishFree(dur, journal, metric, intensity, extra);
    };
  }

  async _finishFree(dur, journal = '', metric = '', intensity = '', extra = '') {
    const parts = [
      this._freeNotes,
      metric ? `Resultado: ${metric}` : '',
      intensity ? `Intensidad: ${intensity}` : '',
      extra ? `Info Extra: ${extra}` : ''
    ].filter(Boolean);
    
    // Guardamos el array como JSON string para mantener la estructura y poder mostrarlo en forma de tags despues.
    const notes = JSON.stringify(parts);
    
    try {
      await GymDB.sessions.add({
        type:     'free',
        name:     this._freeSessionName,
        notes,
        journal,
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
  //  MODO RUTINA — FLASHCARD (Fase 5)
  // ======================================================
  _renderActive() {
    this._currentExIdx = this._currentExIdx ?? 0;
    const log = this._logs[this._currentExIdx];
    if (!log) return;

    const total = this._logs.length;
    const doneExs = this._logs.filter(l => l.sets.every(s => s.done) && l.sets.length > 0).length;
    const totalSets = this._logs.reduce((a, l) => a + l.sets.length, 0);
    const doneSets  = this._logs.reduce((a, l) => a + l.sets.filter(s => s.done).length, 0);
    const pct = totalSets ? Math.round(doneSets / totalSets * 100) : 0;

    // Sugerencia de Sobrecarga
    let overloadBadge = '';
    if (log.lastData && log.lastData.weight > 0) {
      const sug = Math.ceil(log.lastData.weight * 1.025 * 2) / 2;
      overloadBadge = `
        <div style="display:inline-flex; align-items:center; gap:6px; padding:6px 12px; background:var(--accent)18; border:1px dashed var(--accent-light)55; border-radius:20px; margin-top:8px;">
          <i class="ph-bold ph-lightning" style="color:var(--accent-light); font-size:12px;"></i>
          <span style="font-size:11px; color:var(--accent-light); font-weight:700;">Sugerido: ${sug} ${unitLabel()} (+2.5%)</span>
        </div>`;
    }

    this.innerHTML = `
      <!-- ─── BARRA SUPERIOR ─── -->
      <div style="position:sticky; top:0; z-index:50; background:var(--bg-base); border-bottom:1px solid var(--border); padding:12px 20px; display:flex; align-items:center; gap:12px;">
        <div style="flex:1;">
          <p style="font-size:11px; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.08em;">${this._selectedRoutine ? this._selectedRoutine.name : 'Entrenamiento'}</p>
          <div style="display:flex; align-items:center; gap:8px; margin-top:4px;">
            <div style="flex:1; height:4px; background:var(--border); border-radius:99px; overflow:hidden;">
              <div style="width:${pct}%; height:100%; background:var(--success); border-radius:99px; transition:width 0.4s ease;"></div>
            </div>
            <span style="font-size:10px; font-weight:800; color:var(--success);">${pct}%</span>
          </div>
        </div>
        <!-- Timer Global -->
        <div style="text-align:center; background:var(--bg-card); border:1px solid var(--border); border-radius:10px; padding:6px 14px;">
          <div id="session-timer" class="chrono-display" style="font-size:18px; font-weight:900; color:var(--text-primary); letter-spacing:2px;">00:00</div>
          <p style="font-size:8px; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em; margin-top:1px;">Sesion</p>
        </div>
        <!-- Configurar Descanso (siempre visible) -->
        <div style="position:relative;">
          <button onclick="this.closest('active-session-view')._openPreSessionRestConfig()" style="display:flex; flex-direction:column; align-items:center; gap:1px; background:var(--bg-card); border:1px solid var(--border); border-radius:10px; padding:6px 10px; cursor:pointer; color:var(--text-muted);" title="Configurar tiempo de descanso">
            <i class="ph-bold ph-timer" style="font-size:14px; color:var(--text-secondary);"></i>
            <span style="font-size:8px; font-weight:800; text-transform:uppercase; letter-spacing:0.06em; color:var(--text-muted);">${Math.floor(this._restDuration/60)}:${(this._restDuration%60).toString().padStart(2,'0')}</span>
          </button>
          <!-- Panel config pre-sesion -->
          <div id="pre-rest-config-panel" style="display:none; position:absolute; top:calc(100% + 6px); right:0; background:var(--bg-panel); border:1px solid var(--border); border-radius:12px; padding:12px; z-index:200; min-width:220px; box-shadow:0 8px 24px rgba(0,0,0,0.3);">
            <p style="font-size:10px; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:8px;">Tiempo de Descanso</p>
            <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px;">
              ${[30, 60, 90, 120, 180, 300].map(s => `
                <button onclick="this.closest('active-session-view')._setRestDuration(${s}); this.closest('#pre-rest-config-panel').style.display='none';" style="padding:5px 10px; border-radius:20px; border:1px solid ${this._restDuration === s ? 'var(--accent-light)' : 'var(--border)'}; background:${this._restDuration === s ? 'var(--accent)22' : 'transparent'}; color:${this._restDuration === s ? 'var(--accent-light)' : 'var(--text-secondary)'}; font-size:11px; font-weight:700; cursor:pointer;">
                  ${s < 60 ? s + 's' : s === 60 ? '1 min' : s === 90 ? '1:30' : s === 120 ? '2 min' : s === 180 ? '3 min' : '5 min'}
                </button>
              `).join('')}
            </div>
            <div style="display:flex; gap:6px; align-items:center;">
              <input type="number" id="pre-rest-custom-input" min="10" max="600" value="${this._restDuration}" placeholder="Seg" class="form-input" style="height:32px; font-size:12px; text-align:center; flex:1; background:var(--bg-card); border:1px solid var(--border); color:var(--text-primary);">
              <button onclick="this.closest('active-session-view')._setRestDuration(parseInt(this.closest('[id=pre-rest-config-panel]').querySelector('#pre-rest-custom-input').value)||90); this.closest('#pre-rest-config-panel').style.display='none';" style="padding:6px 12px; border-radius:8px; background:var(--accent); color:#fff; border:none; font-size:11px; font-weight:800; cursor:pointer;">OK</button>
            </div>
          </div>
        </div>
        <!-- Timer Descanso -->
        <div id="rest-timer-wrap" style="display:none; position:relative;">
          <div style="text-align:center; background:#10B98118; border:1px solid #10B98155; border-radius:10px; padding:6px 10px; display:flex; align-items:center; gap:8px;">
            <div onclick="this.closest('active-session-view')._cancelRestTimer()" style="cursor:pointer; flex:1; text-align:center;">
              <div id="rest-timer" style="font-size:18px; font-weight:900; color:var(--success); letter-spacing:2px;">1:30</div>
              <p style="font-size:8px; font-weight:800; color:var(--success); text-transform:uppercase; letter-spacing:0.1em; margin-top:1px;">Descanso ✕</p>
            </div>
            <button onclick="this.closest('active-session-view')._openRestConfig()" style="background:none; border:none; color:var(--success); cursor:pointer; padding:4px; opacity:0.7;" title="Cambiar duracion">
              <i class="ph-bold ph-gear" style="font-size:14px;"></i>
            </button>
          </div>
          <!-- Panel de configuracion del descanso (oculto por defecto) -->
          <div id="rest-config-panel" style="display:none; position:absolute; top:calc(100% + 6px); right:0; background:var(--bg-panel); border:1px solid var(--border); border-radius:12px; padding:12px; z-index:200; min-width:220px; box-shadow:0 8px 24px rgba(0,0,0,0.3);">
            <p style="font-size:10px; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:8px;">Tiempo de Descanso</p>
            <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px;">
              ${[30, 60, 90, 120, 180, 300].map(s => `
                <button onclick="this.closest('active-session-view')._setRestDuration(${s})" style="padding:5px 10px; border-radius:20px; border:1px solid ${this._restDuration === s ? 'var(--success)' : 'var(--border)'}; background:${this._restDuration === s ? 'var(--success)22' : 'transparent'}; color:${this._restDuration === s ? 'var(--success)' : 'var(--text-secondary)'}; font-size:11px; font-weight:700; cursor:pointer;">
                  ${s < 60 ? s + 's' : s === 60 ? '1 min' : s === 90 ? '1:30' : s === 120 ? '2 min' : s === 180 ? '3 min' : '5 min'}
                </button>
              `).join('')}
            </div>
            <div style="display:flex; gap:6px; align-items:center;">
              <input type="number" id="rest-custom-input" min="10" max="600" value="${this._restDuration}" placeholder="Seg" class="form-input" style="height:32px; font-size:12px; text-align:center; flex:1; background:var(--bg-card); border:1px solid var(--border); color:var(--text-primary);">
              <button onclick="this.closest('active-session-view')._setRestDuration(parseInt(this.closest('[id=rest-config-panel]').querySelector('#rest-custom-input').value)||90)" style="padding:6px 12px; border-radius:8px; background:var(--accent); color:#fff; border:none; font-size:11px; font-weight:800; cursor:pointer;">OK</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── NAVEGACION EJERCICIOS ─── -->
      <div style="display:flex; gap:6px; padding:12px 20px; overflow-x:auto; -webkit-overflow-scrolling:touch; scrollbar-width:none;">
        ${this._logs.map((l, i) => {
          const allDone = l.sets.length > 0 && l.sets.every(s => s.done);
          const partial = l.sets.some(s => s.done) && !allDone;
          const bg = allDone ? 'var(--success)' : partial ? 'var(--warning,#F59E0B)' : 'var(--border)';
          const active = i === this._currentExIdx;
          return `<button onclick="this.closest('active-session-view')._goToEx(${i})"
            style="flex-shrink:0; width:32px; height:32px; border-radius:50%; border:2px solid ${active ? 'var(--accent-light)' : bg}; background:${active ? 'var(--accent)' : allDone ? 'var(--success)' : 'transparent'}; color:${active || allDone ? '#fff' : 'var(--text-muted)'}; font-size:11px; font-weight:800; cursor:pointer; transition:all 0.2s;">
            ${allDone ? '<i class="ph-bold ph-check" style="font-size:10px;"></i>' : i + 1}
          </button>`;
        }).join('')}
      </div>

      <!-- ─── FLASHCARD PRINCIPAL ─── -->
      <div class="view-content" style="max-width:600px; margin:0 auto; padding-bottom:120px;">
        <div id="flashcard-wrap">
          ${this._renderFlashcard(log, this._currentExIdx)}
        </div>

        <!-- NAVEGACION PREV / NEXT -->
        <div style="display:flex; gap:12px; margin-top:20px;">
          <button id="btn-prev-ex" class="btn btn-ghost" style="flex:1; justify-content:center; height:50px;"
            onclick="this.closest('active-session-view')._goToEx(${this._currentExIdx - 1})"
            ${this._currentExIdx === 0 ? 'disabled style="opacity:0.3; flex:1; justify-content:center; height:50px;"' : ''}>
            <i class="ph-bold ph-arrow-left"></i> Anterior
          </button>
          ${this._currentExIdx < total - 1 ? `
            <button class="btn btn-primary" style="flex:2; justify-content:center; height:50px; font-weight:800;"
              onclick="this.closest('active-session-view')._goToEx(${this._currentExIdx + 1})">
              Siguiente <i class="ph-bold ph-arrow-right"></i>
            </button>
          ` : `
            <button class="btn btn-success" style="flex:2; justify-content:center; height:50px; font-weight:800; font-size:15px;"
              onclick="this.closest('active-session-view')._finishFlow()">
              <i class="ph-bold ph-flag-checkered"></i> FINALIZAR
            </button>
          `}
        </div>

        <!-- BOTON CANCELAR -->
        <button class="btn btn-ghost" style="width:100%; justify-content:center; margin-top:12px; color:var(--danger-light); opacity:0.7;"
          onclick="if(confirm('Cancelar sesion? El progreso se perdera.')) { this.closest('active-session-view')._cancelSession(); }">
          <i class="ph-bold ph-x-circle"></i> Cancelar Sesion
        </button>
      </div>
    `;

    // Aplicar tiempo real al timer
    const timerEl = this.querySelector('#session-timer');
    if (timerEl) timerEl.textContent = formatDuration(Date.now() - this._startTime);

    // Arrancar timers
    this._startSessionTimer();
    if (this._restEndTime && Date.now() < this._restEndTime) {
      this._resumeRestTimer();
    }

    // Scroll al ejercicio activo en la barra de navegacion
    setTimeout(() => {
      const navBtns = this.querySelectorAll('[onclick*="_goToEx"]');
      if (navBtns[this._currentExIdx]) {
        navBtns[this._currentExIdx].scrollIntoView({ behavior:'smooth', block:'nearest', inline:'center' });
      }
    }, 100);
  }

  _renderFlashcard(log, exIdx) {
    const lastHint = log.lastData
      ? `<span style="font-size:12px; color:var(--accent-light); font-weight:600;"><i class="ph-bold ph-clock-counter-clockwise" style="font-size:10px;"></i> Ultima vez: ${log.lastData.weight} ${unitLabel()} × ${log.lastData.reps} reps</span>`
      : `<span style="font-size:12px; color:var(--text-muted);">Sin historial aun</span>`;

    let overloadBadge = '';
    if (log.lastData && log.lastData.weight > 0) {
      const sug = Math.ceil(log.lastData.weight * 1.025 * 2) / 2;
      overloadBadge = `
        <div style="display:inline-flex; align-items:center; gap:6px; padding:5px 10px; background:var(--accent)18; border:1px dashed var(--accent-light)55; border-radius:20px;">
          <i class="ph-bold ph-lightning" style="color:var(--accent-light); font-size:11px;"></i>
          <span style="font-size:11px; color:var(--accent-light); font-weight:700;">Sugerido hoy: ${sug} ${unitLabel()}</span>
        </div>`;
    }

    const allDone = log.sets.length > 0 && log.sets.every(s => s.done);

    return `
      <div class="glass-card view-enter" style="padding:0; overflow:hidden; border:${allDone ? '2px solid var(--success)' : '1px solid var(--border)'}; transition:border-color 0.3s;">
        <!-- Imagen del Ejercicio -->
        ${log.exerciseImage ? `
          <div style="width:100%; aspect-ratio:16/9; background:#000; overflow:hidden; max-height:220px;">
            <img src="${log.exerciseImage}" alt="${log.exerciseName}"
              style="width:100%; height:100%; object-fit:contain; display:block;">
          </div>
        ` : ''}

        <!-- Cabecera Ejercicio -->
        <div style="padding:20px 24px 16px; background:rgba(255,255,255,0.02);">
          <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:12px;">
            <div style="flex:1;">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                <span style="background:var(--accent); color:#fff; font-size:10px; font-weight:800; padding:2px 8px; border-radius:20px;">EJERCICIO ${exIdx + 1} / ${this._logs.length}</span>
                ${allDone ? '<span style="background:var(--success); color:#000; font-size:10px; font-weight:800; padding:2px 8px; border-radius:20px;">✓ COMPLETADO</span>' : ''}
              </div>
              <h2 style="font-size:22px; font-weight:900; color:var(--text-primary); line-height:1.2; margin-top:6px;">${log.exerciseName}</h2>
              <div style="display:flex; align-items:center; gap:10px; margin-top:6px; flex-wrap:wrap;">
                <span class="badge badge-slate">${log.muscleGroup}</span>
                ${lastHint}
              </div>
              ${overloadBadge ? `<div style="margin-top:10px;">${overloadBadge}</div>` : ''}
            </div>
          </div>
        </div>

        <!-- Sets -->
        <div style="padding:0 24px 12px;">
          <!-- Cabecera columnas -->
          <div style="display:grid; grid-template-columns:28px 1fr 1fr 52px 44px 44px; gap:8px; padding:10px 0 6px; border-bottom:1px solid var(--border);">
            <span style="font-size:9px; font-weight:800; color:var(--text-muted); text-transform:uppercase; text-align:center;">#</span>
            <span style="font-size:9px; font-weight:800; color:var(--text-muted); text-transform:uppercase; text-align:center;">${unitLabel()}</span>
            <span style="font-size:9px; font-weight:800; color:var(--text-muted); text-transform:uppercase; text-align:center;">REPS</span>
            <span style="font-size:9px; font-weight:800; color:var(--text-muted); text-transform:uppercase; text-align:center;">RPE</span>
            <span style="font-size:9px; font-weight:800; color:var(--text-muted); text-transform:uppercase; text-align:center;">✓</span>
            <span></span>
          </div>
          <div id="ex-${exIdx}-sets">
            ${log.sets.map((s, si) => this._renderSetRow(exIdx, si, s)).join('')}
          </div>
          <button class="btn btn-ghost" style="width:100%; margin-top:10px; height:38px; justify-content:center; border:1px dashed var(--border); font-size:12px;"
            onclick="this.closest('active-session-view')._addSet(${exIdx})">
            <i class="ph-bold ph-plus-circle"></i> Agregar Serie
          </button>
        </div>
      </div>
    `;
  }

  _renderSetRow(exIdx, setIdx, s) {
    const isDone = s.done;
    const inputStyle = `height:42px; text-align:center; background:var(--bg-card); border:1px solid var(--border); color:var(--text-primary); font-weight:700; border-radius:8px; font-size:14px; width:100%;`;
    return `
      <div class="set-row ${isDone ? 'done' : ''}" style="display:grid; grid-template-columns:28px 1fr 1fr 52px 44px 44px; gap:8px; align-items:center; padding:8px 0; border-bottom:1px solid var(--border-subtle);">
        <span style="text-align:center; font-weight:800; color:${isDone ? 'var(--success)' : 'var(--text-muted)'}; font-size:13px;">${setIdx + 1}</span>
        <input type="number" inputmode="decimal" value="${s.weight}" class="form-input input-numeric"
          style="${inputStyle} ${isDone ? 'opacity:0.5;' : ''}"
          onchange="this.closest('active-session-view')._updVal(${exIdx},${setIdx},'weight',this.value)"
          onkeydown="if(event.key==='Enter') this.blur()"
          ${isDone ? 'disabled' : ''}>
        <input type="number" inputmode="decimal" value="${s.reps}" class="form-input input-numeric"
          style="${inputStyle} ${isDone ? 'opacity:0.5;' : ''}"
          onchange="this.closest('active-session-view')._updVal(${exIdx},${setIdx},'reps',this.value)"
          onkeydown="if(event.key==='Enter') this.blur()"
          ${isDone ? 'disabled' : ''}>
        <select class="form-select" style="height:42px; font-size:11px; padding:0 4px; text-align:center; background:var(--bg-card); border:1px solid var(--border); color:var(--accent-light); font-weight:800; border-radius:8px;"
          onchange="this.closest('active-session-view')._updVal(${exIdx},${setIdx},'rpe',this.value)"
          ${isDone ? 'disabled' : ''}>
          <option value="">-</option>
          ${[10,9.5,9,8.5,8,7,6].map(v => `<option value="${v}" ${s.rpe == v ? 'selected' : ''}>${v}</option>`).join('')}
        </select>
        <button class="check-btn" style="width:42px; height:42px; border-radius:10px; background:${isDone ? 'var(--success)' : 'rgba(128,128,128,0.08)'}; border:1px solid ${isDone ? 'var(--success)' : 'var(--border)'}; color:${isDone ? '#000' : 'var(--text-muted)'}; cursor:pointer; transition:all 0.2s; font-size:16px;"
          onclick="this.closest('active-session-view')._toggleSet(${exIdx},${setIdx})">
          <i class="ph-bold ${isDone ? 'ph-check' : 'ph-circle'}"></i>
        </button>
        <button style="width:42px; height:42px; border-radius:10px; background:transparent; border:1px solid transparent; color:var(--danger-light); cursor:pointer; opacity:0.5; visibility:${isDone ? 'hidden' : 'visible'};"
          onclick="this.closest('active-session-view')._delSet(${exIdx},${setIdx})">
          <i class="ph-bold ph-trash-simple" style="font-size:14px;"></i>
        </button>
      </div>
    `;
  }

  _goToEx(idx) {
    if (idx < 0 || idx >= this._logs.length) return;
    this._currentExIdx = idx;
    this._renderActive();
  }

  _updVal(ei, si, f, v) {
    const val = f === 'rpe' ? (parseFloat(v) || '') : (parseFloat(v) || 0);
    this._logs[ei].sets[si][f] = val;
    if (si === 0 && f !== 'rpe') {
      this._logs[ei].sets.forEach((set, idx) => {
        if (idx > 0 && !set.done) set[f] = val;
      });
    }
    this._saveState();
    // Re-render solo los sets sin refrescar toda la vista
    const container = this.querySelector(`#ex-${ei}-sets`);
    if (container) container.innerHTML = this._logs[ei].sets.map((s, sIdx) => this._renderSetRow(ei, sIdx, s)).join('');
  }

  _toggleSet(ei, si) {
    const wasAllDone = this._logs[ei].sets.every(s => s.done);
    this._logs[ei].sets[si].done = !this._logs[ei].sets[si].done;
    const nowAllDone = this._logs[ei].sets.every(s => s.done) && this._logs[ei].sets.length > 0;

    this._saveState();

    // Si se acaba de completar el ultimo set, iniciar descanso y auto-avanzar
    if (!wasAllDone && nowAllDone) {
      this._startRestTimer(this._restDuration); // duracion configurada por el usuario
      // Mostrar notificacion visual
      this._renderActive();
      setTimeout(() => {
        if (this._currentExIdx < this._logs.length - 1) {
          // Solo avanzar si el usuario no ha cambiado ya
          if (this._logs[this._currentExIdx].sets.every(s => s.done)) {
            this._goToEx(this._currentExIdx + 1);
          }
        }
      }, 2500);
    } else {
      // Re-render parcial: solo la flashcard y la barra de progreso
      const setsContainer = this.querySelector(`#ex-${ei}-sets`);
      if (setsContainer) setsContainer.innerHTML = this._logs[ei].sets.map((s, sIdx) => this._renderSetRow(ei, sIdx, s)).join('');
      this._updateProgressBar();
    }
  }

  _updateProgressBar() {
    const totalSets = this._logs.reduce((a, l) => a + l.sets.length, 0);
    const doneSets  = this._logs.reduce((a, l) => a + l.sets.filter(s => s.done).length, 0);
    const pct = totalSets ? Math.round(doneSets / totalSets * 100) : 0;
    const bar = this.querySelector('[style*="background:var(--success)"][style*="border-radius:99px"]');
    if (bar) bar.style.width = pct + '%';
    const pctLabel = this.querySelector('[style*="color:var(--success)"][style*="font-size:10px; font-weight:800"]');
    if (pctLabel) pctLabel.textContent = pct + '%';
  }

  _addSet(ei) {
    const last = this._logs[ei].sets.slice(-1)[0];
    this._logs[ei].sets.push({ weight: last ? last.weight : 0, reps: last ? last.reps : 10, done: false });
    this._saveState();
    const container = this.querySelector(`#ex-${ei}-sets`);
    if (container) container.innerHTML = this._logs[ei].sets.map((s, sIdx) => this._renderSetRow(ei, sIdx, s)).join('');
  }

  _delSet(ei, si) {
    this._logs[ei].sets.splice(si, 1);
    this._saveState();
    const container = this.querySelector(`#ex-${ei}-sets`);
    if (container) container.innerHTML = this._logs[ei].sets.map((s, sIdx) => this._renderSetRow(ei, sIdx, s)).join('');
  }

  // ── TIMERS ──────────────────────────────────────────────

  _startSessionTimer() {
    if (this._timerInterval) clearInterval(this._timerInterval);
    this._timerInterval = setInterval(() => {
      const el = this.querySelector('#session-timer');
      if (el) el.textContent = formatDuration(Date.now() - this._startTime);
    }, 1000);
  }

  _startTimer(elId) {
    if (elId === 'free-timer') {
      this._startFreeTimer();
    } else {
      this._startSessionTimer();
    }
  }

  _startRestTimer(seconds) {
    const dur = seconds ?? this._restDuration;
    this._restEndTime = Date.now() + dur * 1000;
    this._resumeRestTimer();
  }

  _resumeRestTimer() {
    if (this._restInterval) clearInterval(this._restInterval);
    const wrap = this.querySelector('#rest-timer-wrap');
    const el   = this.querySelector('#rest-timer');
    if (wrap) wrap.style.display = 'block';

    this._restInterval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((this._restEndTime - Date.now()) / 1000));
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      const el2 = this.querySelector('#rest-timer');
      if (el2) el2.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
      if (remaining <= 0) {
        clearInterval(this._restInterval);
        this._restEndTime = null;
        const w = this.querySelector('#rest-timer-wrap');
        if (w) {
          w.style.background = 'var(--success)';
          w.querySelector('div').textContent = '¡Listo!';
          setTimeout(() => { if (w) w.style.display = 'none'; }, 1500);
        }
      }
    }, 500);
  }

  _cancelRestTimer() {
    if (this._restInterval) clearInterval(this._restInterval);
    this._restEndTime = null;
    const wrap = this.querySelector('#rest-timer-wrap');
    if (wrap) wrap.style.display = 'none';
  }

  _openRestConfig() {
    const panel = this.querySelector('#rest-config-panel');
    if (!panel) return;
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    // Cerrar al hacer click fuera
    if (panel.style.display === 'block') {
      setTimeout(() => {
        const close = (e) => {
          if (!panel.contains(e.target)) {
            panel.style.display = 'none';
            document.removeEventListener('click', close);
          }
        };
        document.addEventListener('click', close);
      }, 100);
    }
  }

  _setRestDuration(secs) {
    const val = Math.max(10, Math.min(600, parseInt(secs) || 90));
    this._restDuration = val;
    try { localStorage.setItem('gym-rest-duration', String(val)); } catch {}
    // Cerrar el panel
    const panel = this.querySelector('#rest-config-panel');
    if (panel) panel.style.display = 'none';
    // Si el timer esta corriendo, reiniciarlo con la nueva duracion
    if (this._restEndTime) {
      this._startRestTimer(val);
    }
    // Refrescar los botones del panel si sigue abierto (por si re-renderizan)
    const mins = Math.floor(val / 60);
    const scs  = val % 60;
    const restEl = this.querySelector('#rest-timer');
    if (restEl && !this._restEndTime) {
      restEl.textContent = `${mins}:${scs.toString().padStart(2, '0')}`;
    }
  }

  _openPreSessionRestConfig() {
    const panel = this.querySelector('#pre-rest-config-panel');
    if (!panel) return;
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    if (panel.style.display === 'block') {
      setTimeout(() => {
        const close = (e) => {
          if (!panel.contains(e.target)) {
            panel.style.display = 'none';
            document.removeEventListener('click', close);
          }
        };
        document.addEventListener('click', close);
      }, 100);
    }
  }

  _cancelSession() {
    this._clearState();
    if (this._timerInterval) clearInterval(this._timerInterval);
    if (this._restInterval)  clearInterval(this._restInterval);
    window.location.hash = '#dashboard';
  }

  _finishFlow() {
    // Mostrar modal de confirmacion con diario post-entrenamiento
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:999;display:flex;align-items:flex-end;justify-content:center;';
    overlay.innerHTML = `
      <div style="background:var(--bg-panel);border-radius:24px 24px 0 0;padding:28px 24px;width:100%;max-width:600px;max-height:80vh;overflow-y:auto;">
        <h3 style="font-size:20px;font-weight:900;color:var(--text-primary);margin-bottom:6px;">¿Finalizar Sesion? 🏁</h3>
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:20px;">Deja una nota sobre como te sentiste (opcional)</p>
        <textarea id="post-journal" class="form-textarea" placeholder="Buena sesion, mucho energia, pero el hombro un poco cargado..." style="background:var(--bg-card);color:var(--text-primary);min-height:90px;width:100%;border:1px solid var(--border);border-radius:12px;padding:12px;font-size:13px;"></textarea>
        <div style="display:flex;gap:12px;margin-top:16px;">
          <button id="cancel-finish" class="btn btn-ghost" style="flex:1;justify-content:center;">Seguir</button>
          <button id="confirm-finish" class="btn btn-success" style="flex:2;justify-content:center;padding:16px;font-size:15px;font-weight:800;"><i class="ph-bold ph-flag-checkered"></i> GUARDAR SESION</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#cancel-finish').onclick = () => overlay.remove();
    overlay.querySelector('#confirm-finish').onclick = () => {
      const journal = overlay.querySelector('#post-journal').value.trim();
      overlay.remove();
      this._finish(journal);
    };
  }

  async _finish(journal = '') {
    const dur = Date.now() - this._startTime;
    const finalLogs = this._logs
      .map(l => ({ exerciseId: l.exerciseId, sets: l.sets.filter(s => s.done) }))
      .filter(l => l.sets.length > 0);

    if (!finalLogs.length) {
      alert('Marca al menos una serie como completada antes de finalizar.');
      return;
    }

    try {
      await GymDB.sessions.add({
        type:      'routine',
        routineId: this._selectedRoutine.id,
        duration:  dur,
        logs:      finalLogs,
        journal
      });
      this._clearState();
      if (this._timerInterval) clearInterval(this._timerInterval);
      if (this._restInterval)  clearInterval(this._restInterval);
      window.location.hash = '#sessions';
    } catch (err) {
      console.error('Error al guardar sesion:', err);
      alert('Error al guardar la sesion: ' + err.message);
    }
  }
}

customElements.define('active-session-view', ActiveSessionView);
