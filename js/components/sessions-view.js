/**
 * ============================================================
 *  <sessions-view> — Historial de Sesiones
 *
 *  Muestra la lista de entrenamientos pasados con estadisticas.
 * ============================================================
 */

class SessionsView extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
    this._sessions = [];
    this._routines = [];
    this._exercises = [];
  }

  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    this.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Historial de Sesiones</h1>
      </div>
      <div class="view-content">
        <div id="sessions-list">
          <loading-state></loading-state>
        </div>
      </div>
    `;
  }

  /** Carga datos de la DB */
  async loadData() {
    try {
      this._sessions = await GymDB.sessions.getAll();
      this._routines = await GymDB.routines.getAll();
      this._exercises = await GymDB.exercises.getAll();
      this._renderSessions();
    } catch (err) {
      console.error('Error al cargar sesiones:', err);
      this.querySelector('#sessions-list').innerHTML = `<error-state></error-state>`;
    }
  }

  _renderSessions() {
    const container = this.querySelector('#sessions-list');

    if (this._sessions.length === 0) {
      container.innerHTML = `
        <div class="glass-card" style="padding:24px;">
          <div class="empty-state">
            <i class="ph-bold ph-calendar-check icon"></i>
            <p>Aun no tienes sesiones registradas</p>
            <button class="btn btn-primary" style="margin-top:10px;" onclick="window.location.hash='#session/new'">
              <i class="ph-bold ph-play"></i> Iniciar Entrenamiento
            </button>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = this._sessions.map(session => {
      const routine = this._routines.find(r => r.id === session.routineId);
      const routineName = routine ? routine.name : 'Rutina eliminada';
      const date = formatDate(session.date);
      const duration = formatDuration(session.duration);
      
      const totalSets = session.logs.reduce((acc, log) => acc + log.sets.length, 0);
      const totalVolume = calcTotalVolume(session.logs);

      return `
        <div class="glass-card hover-lift" style="padding:20px; margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
            <div>
              <h3 style="font-size:17px; font-weight:700; color:#FFFFFF;">${routineName}</h3>
              <p style="font-size:12px; color:var(--text-secondary);">${date}</p>
            </div>
            <div class="chrono-display" style="font-size:14px; color:var(--accent-light);">${duration}</div>
          </div>
          
          <div style="display:flex; gap:20px;">
            <div style="display:flex; align-items:center; gap:6px;">
              <i class="ph-bold ph-list-numbers" style="color:var(--accent-light);"></i>
              <span style="font-size:13px; font-weight:600;">${totalSets} series</span>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              <i class="ph-bold ph-barbell" style="color:var(--success-light);"></i>
              <span style="font-size:13px; font-weight:600;">${displayWeight(totalVolume)} ${unitLabel()}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}

customElements.define('sessions-view', SessionsView);
