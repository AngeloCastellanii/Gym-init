/**
 * 
 *  <session-detail-view> — Detalle de una Sesion Pasada
 * 
 */

class SessionDetailView extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
    this._sessionId = null;
    this._session = null;
  }

  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;
    this._renderLoading();
  }

  /**
   * Carga los datos de la sesion desde la DB.
   * @param {string} id
   */
  async loadData(id) {
    this._sessionId = id;
    try {
      this._session = await GymDB.sessions.get(id);
      if (!this._session) {
        this._renderError('Sesión no encontrada');
        return;
      }
      // Necesitamos los nombres de los ejercicios
      const exercises = await GymDB.exercises.getAll();
      this._renderDetail(exercises);
    } catch (err) {
      console.error('Error loadData SessionDetail:', err);
      this._renderError('Error al cargar la sesión');
    }
  }

  _renderLoading() {
    this.innerHTML = `<div class="view-content"><loading-state></loading-state></div>`;
  }

  _renderError(msg) {
    this.innerHTML = `
      <div class="view-content" style="text-align:center; padding:100px 20px;">
        <i class="ph-bold ph-warning-circle" style="font-size:48px; color:var(--danger); opacity:0.5;"></i>
        <h2 style="margin-top:16px;">${msg}</h2>
        <button class="btn btn-primary" onclick="window.location.hash='#sessions'" style="margin-top:24px;">Volver al historial</button>
      </div>
    `;
  }

  _renderDetail(exercises) {
    const totalVolume = calcTotalVolume(this._session.logs, exercises);
    
    // Verificamos si TODA la sesion fue de deportes
    const isOnlyDeporte = this._session.logs.every(log => {
      const ex = exercises.find(e => e.id === log.exerciseId);
      return (ex && ex.muscleGroup === 'Cardio / Deportes') || log.muscleGroup === 'Cardio / Deportes';
    });
    
    this.innerHTML = `
      <div class="page-header" style="align-items: flex-start;">
        <div>
          <button class="btn btn-ghost" onclick="window.location.hash='#sessions'" style="padding:0; margin-bottom:8px; height:auto;">
            <i class="ph-bold ph-arrow-left"></i> Volver al historial
          </button>
          <h1 class="page-title" style="font-size:28px;">Detalle de Entrenamiento</h1>
          <p class="page-subtitle">${formatDate(this._session.date)} • Finalizado</p>
        </div>
        <div style="text-align:right;">
           <span class="badge badge-success" style="padding:8px 16px; font-size:12px;">SESIÓN COMPLETADA</span>
        </div>
      </div>

      <div class="view-content">
        <!-- Resumen de sesion -->
        ${this._session.type === 'free' ? (() => {
          let notesList = [];
          if (this._session.notes) {
            try {
              notesList = JSON.parse(this._session.notes);
            } catch (e) {
              notesList = this._session.notes.split('|').map(s => s.trim()).filter(Boolean);
            }
          }
          return `
          <div class="kpi-grid" style="margin-bottom:32px;">
            <div class="glass-card" style="padding:24px; display:flex; flex-direction:column; gap:8px;">
              <span style="font-size:11px; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em;">Tiempo Total</span>
              <div style="display:flex; align-items:baseline; gap:8px;">
                 <span style="font-size:32px; font-weight:900; color:var(--text-primary);">${formatDuration(this._session.duration)}</span>
              </div>
            </div>
            <div class="glass-card" style="padding:24px; display:flex; flex-direction:column; gap:8px; grid-column:1/-1;">
              <span style="font-size:11px; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em;">Detalles y Métricas</span>
              <div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:8px;">
                 ${notesList.length > 0 ? notesList.map(note => `
                   <div style="background:var(--bg-panel); border:1px solid var(--border); padding:8px 12px; border-radius:8px; font-size:13px; font-weight:600; color:var(--text-primary);">
                     ${note}
                   </div>
                 `).join('') : '<span style="font-size:14px; color:var(--text-muted);">Sin detalles extra</span>'}
              </div>
            </div>
          </div>
        `})() : `
          <div class="kpi-grid" style="margin-bottom:32px;">
            ${isOnlyDeporte ? '' : `
            <div class="glass-card" style="padding:24px; display:flex; flex-direction:column; gap:8px;">
              <span style="font-size:11px; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em;">Volumen Levantado</span>
              <div style="display:flex; align-items:baseline; gap:8px;">
                 <span style="font-size:32px; font-weight:900; color:var(--accent-light);">${displayWeight(totalVolume)}</span>
                 <span style="font-size:16px; font-weight:700; color:var(--text-muted);">${unitLabel()}</span>
              </div>
            </div>
            `}
            <div class="glass-card" style="padding:24px; display:flex; flex-direction:column; gap:8px;">
              <span style="font-size:11px; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em;">Tiempo Total</span>
              <div style="display:flex; align-items:baseline; gap:8px;">
                 <span style="font-size:32px; font-weight:900; color:var(--text-primary);">${formatDuration(this._session.duration)}</span>
              </div>
            </div>
            <div class="glass-card" style="padding:24px; display:flex; flex-direction:column; gap:8px;">
               <span style="font-size:11px; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em;">Ejercicios</span>
               <span style="font-size:32px; font-weight:900; color:var(--text-primary);">${this._session.logs.length}</span>
            </div>
          </div>
        `}

        <!-- Diario Post-Sesion -->
        ${this._session.journal ? `
          <div class="glass-card" style="padding:20px; margin-bottom:28px; border-left:3px solid var(--accent-light); display:flex; gap:14px; align-items:flex-start;">
            <div style="width:36px; height:36px; border-radius:10px; background:var(--accent)22; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              <i class="ph-bold ph-note-pencil" style="color:var(--accent-light); font-size:18px;"></i>
            </div>
            <div style="flex:1;">
              <p style="font-size:10px; font-weight:800; color:var(--accent-light); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:6px;">Diario de Sesion</p>
              <p style="font-size:14px; color:var(--text-primary); line-height:1.6; font-style:italic;">"${this._session.journal}"</p>
            </div>
          </div>
        ` : ''}

        <!-- Lista de ejercicios realizados -->
        <div style="display:flex; flex-direction:column; gap:20px;">
          ${this._session.logs.map((log, i) => {
            const exInfo = exercises.find(e => e.id === log.exerciseId);
            const name = exInfo ? exInfo.name : (log.exerciseName || 'Ejercicio');
            const isDeporte = (exInfo && exInfo.muscleGroup === 'Cardio / Deportes') || log.muscleGroup === 'Cardio / Deportes';
            
            return `
              <div class="glass-card view-enter" style="padding:0; overflow:hidden;">
                <div style="padding:16px 24px; background:rgba(128,128,128,0.05); border-bottom:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center;">
                  <div style="display:flex; align-items:center; gap:16px;">
                    <div style="width:32px; height:32px; border-radius:8px; background:var(--accent)22; display:flex; align-items:center; justify-content:center; border:1px solid var(--accent)33; font-weight:900; color:var(--accent-light); font-size:13px;">${i+1}</div>
                    <div>
                      <h3 style="font-size:17px; font-weight:700; color:var(--text-primary);">${name}</h3>
                      ${exInfo && exInfo.muscleGroup ? `<span style="font-size:11px; color:var(--text-muted);">${exInfo.muscleGroup}</span>` : ''}
                    </div>
                  </div>
                  <span class="badge badge-slate">${log.sets.length} ${isDeporte ? 'rounds' : 'series'}</span>
                </div>
                <div style="padding:16px 24px;">
                   <table style="width:100%; border-collapse:collapse;">
                     <thead>
                       <tr style="text-align:left; font-size:11px; text-transform:uppercase; color:var(--text-muted); border-bottom:1px solid var(--border);">
                         <th style="padding:10px 0;">#</th>
                         <th style="padding:10px 0;">${isDeporte ? 'TIEMPO (MIN)' : 'PESO (' + unitLabel() + ')'}</th>
                         <th style="padding:10px 0;">${isDeporte ? 'ROUNDS' : 'REPS'}</th>

                         <th style="padding:10px 0;">RPE</th>
                         <th style="padding:10px 0; text-align:right;">Estado</th>
                       </tr>
                     </thead>
                     <tbody>
                       ${log.sets.map((s, si) => `
                         <tr style="border-bottom:1px solid var(--border-subtle);">
                           <td style="padding:12px 0; font-weight:800; color:var(--text-muted); font-size:13px;">${si+1}</td>
                           <td style="padding:12px 0; font-weight:700; color:var(--text-primary); font-size:15px;">${isDeporte ? s.weight : displayWeight(s.weight)}</td>
                           <td style="padding:12px 0; font-weight:700; color:var(--text-primary); font-size:15px;">${s.reps}</td>
                           <td style="padding:12px 0; font-weight:700; color:var(--accent-light); font-size:13px;">${s.rpe ? s.rpe : '—'}</td>
                           <td style="padding:12px 0; text-align:right;">
                             <i class="ph-fill ph-check-circle" style="color:var(--success); font-size:20px;"></i>
                           </td>
                         </tr>
                       `).join('')}
                     </tbody>
                   </table>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div style="margin-top:40px; text-align:center;">
           <button class="btn btn-ghost" onclick="window.location.hash='#sessions'" style="color:var(--text-muted);">
             <i class="ph ph-calendar"></i> Volver al calendario de sesiones
           </button>
        </div>
      </div>
    `;
  }
}

customElements.define('session-detail-view', SessionDetailView);

