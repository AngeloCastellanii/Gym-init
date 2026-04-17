/**
 * ============================================================
 *  <dashboard-view> — Panel de Control Principal
 *  Con filtros de periodo: Hoy / Semana / Mes / Global
 * ============================================================
 */

class DashboardView extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
    this._sessions  = [];
    this._exercises = [];
    this._exMap     = {};
    this._period    = 'week'; // 'today' | 'week' | 'month' | 'global'
  }

  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    this.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Panel de Control</h1>
          <p class="page-subtitle" id="dash-subtitle">Resumen de tu progreso</p>
        </div>
        <button class="btn btn-ghost" id="unit-toggle">
          <i class="ph-bold ph-scales"></i>
          Unidad: <span id="unit-label">${unitLabel()}</span>
        </button>
      </div>

      <!-- Filtros de periodo -->
      <div style="padding:16px 32px 0; display:flex; gap:8px; flex-wrap:wrap;">
        ${[
          { key:'today',  label:'Hoy' },
          { key:'week',   label:'Esta Semana' },
          { key:'month',  label:'Este Mes' },
          { key:'global', label:'Global' }
        ].map(f => `
          <button class="filter-btn ${f.key === 'week' ? 'active' : ''}" data-period="${f.key}">${f.label}</button>
        `).join('')}
      </div>

      <div class="view-content">
        <!-- KPI Grid -->
        <div class="kpi-grid" id="dashboard-kpis">
          ${this._kpiCard('Total Sesiones','—','ph-calendar-check','var(--accent-light)')}
          ${this._kpiCard('Racha Actual','—','ph-fire','var(--success-light)')}
          ${this._kpiCard('Vol. Total','—','ph-barbell','#f97316')}
          ${this._kpiCard('Ejercicios','—','ph-list-checks','#a78bfa')}
        </div>

        <!-- Charts -->
        <div class="charts-grid">
          ${this._chartContainer('Progreso de Volumen','canvas-volume','ph-chart-line-up','var(--accent-light)')}
          ${this._chartContainer('Frecuencia de Sesiones','canvas-freq','ph-chart-bar','var(--success-light)')}
          ${this._chartContainer('Distribucion Muscular','canvas-dist','ph-chart-pie-slice','#f97316')}
          ${this._chartContainer('Intensidad Promedio','canvas-intensity','ph-activity','#a78bfa')}
        </div>

        <!-- Actividades recientes -->
        <div class="glass-card" style="padding:24px;">
          <h3 style="font-size:15px; font-weight:700; margin-bottom:16px; display:flex; align-items:center; gap:8px;">
            <i class="ph-bold ph-clock-counter-clockwise" style="color:var(--accent-light);"></i>
            Ultimas Actividades
          </h3>
          <div id="recent-list">
            <div class="empty-state" style="padding:24px;"><p>Cargando...</p></div>
          </div>
        </div>
      </div>
    `;

    // Evento unidad
    this.querySelector('#unit-toggle').addEventListener('click', () => {
      setWeightUnit(getWeightUnit() === 'kg' ? 'lb' : 'kg');
      location.reload();
    });

    // Eventos filtro
    this.querySelectorAll('.filter-btn[data-period]').forEach(btn => {
      btn.addEventListener('click', () => {
        this._period = btn.dataset.period;
        this.querySelectorAll('.filter-btn[data-period]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._update();
      });
    });
  }

  async loadData() {
    try {
      [this._sessions, this._exercises] = await Promise.all([
        GymDB.sessions.getAll(),
        GymDB.exercises.getAll()
      ]);
      this._exMap = Object.fromEntries(this._exercises.map(e => [e.id, e]));
      this._update();
    } catch (err) {
      console.error('Error dashboard loadData:', err);
    }
  }

  // -------------------------------------------------------
  //  Filtrado por periodo
  // -------------------------------------------------------
  _sessionsByPeriod() {
    const now   = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const weekStart = new Date(todayStart);
    weekStart.setDate(todayStart.getDate() - todayStart.getDay() + (todayStart.getDay() === 0 ? -6 : 1));

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return this._sessions.filter(s => {
      const d = new Date(s.date);
      if (this._period === 'today')  return d >= todayStart;
      if (this._period === 'week')   return d >= weekStart;
      if (this._period === 'month')  return d >= monthStart;
      return true; // global
    });
  }

  _update() {
    const filtered = this._sessionsByPeriod();
    const subtitle = this.querySelector('#dash-subtitle');
    const labels   = { today:'Hoy', week:'Esta Semana', month:'Este Mes', global:'Historico' };
    if (subtitle) subtitle.textContent = `${labels[this._period]} — ${filtered.length} sesion${filtered.length !== 1 ? 'es' : ''}`;

    this._renderKPIs(filtered);
    this._renderCharts(filtered);
    this._renderRecent(filtered);
  }

  // -------------------------------------------------------
  //  KPIs
  // -------------------------------------------------------
  _renderKPIs(sessions) {
    const routineSessions = sessions.filter(s => s.type !== 'free' && s.logs);
    const totalVol  = routineSessions.reduce((a, s) => a + calcTotalVolume(s.logs), 0);
    const streak    = this._calcStreak();
    const exCount   = this._exercises.length;

    const container = this.querySelector('#dashboard-kpis');
    container.innerHTML = `
      ${this._kpiCard('Sesiones', sessions.length, 'ph-calendar-check', 'var(--accent-light)')}
      ${this._kpiCard('Racha', `${streak} dias`, 'ph-fire', 'var(--success-light)')}
      ${this._kpiCard('Vol. Total', `${displayWeight(totalVol)} ${unitLabel()}`, 'ph-barbell', '#f97316')}
      ${this._kpiCard('Ejercicios', exCount, 'ph-list-checks', '#a78bfa')}
    `;
  }

  _calcStreak() {
    if (!this._sessions.length) return 0;
    const sorted = [...this._sessions]
      .filter(s => s.type !== 'free')
      .map(s => new Date(s.date).toDateString())
      .filter((v, i, a) => a.indexOf(v) === i) // dias unicos
      .sort((a, b) => new Date(b) - new Date(a));

    let streak = 0;
    let check  = new Date();
    check.setHours(0,0,0,0);

    for (const d of sorted) {
      const day = new Date(d);
      const diff = (check - day) / 86400000;
      if (diff <= 1) { streak++; check = day; }
      else break;
    }
    return streak;
  }

  // -------------------------------------------------------
  //  Charts
  // -------------------------------------------------------
  _renderCharts(sessions) {
    if (typeof Chart === 'undefined') return;
    const routineSessions = sessions.filter(s => s.type !== 'free' && s.logs && s.logs.length);

    // 1. Progreso de Volumen
    const volSessions = routineSessions.slice(-10);
    this._buildChart('canvas-volume', 'line',
      volSessions.map(s => formatDate(s.date).split(' ')[0]),
      [{ label:'Volumen', data: volSessions.map(s => calcTotalVolume(s.logs)),
         borderColor:'#60A5FA', backgroundColor:'#60A5FA18', fill:true,
         tension:0.4, borderWidth:2, pointRadius:3, pointBackgroundColor:'#60A5FA' }]
    );

    // 2. Frecuencia — barras por dia de semana dentro del período
    const freqData = [0,0,0,0,0,0,0];
    sessions.forEach(s => {
      const idx = new Date(s.date).getDay();
      freqData[idx === 0 ? 6 : idx - 1]++;
    });
    this._buildChart('canvas-freq', 'bar',
      ['L','M','M','J','V','S','D'],
      [{ label:'Sesiones', data:freqData, backgroundColor:'#10B981', borderRadius:5 }]
    );

    // 3. Distribución Muscular — lookup real
    const muscleCount = {};
    routineSessions.forEach(s => {
      s.logs.forEach(log => {
        const ex    = this._exMap[log.exerciseId];
        const group = ex ? ex.muscleGroup : 'Otro';
        muscleCount[group] = (muscleCount[group] || 0) + (log.sets ? log.sets.length : 1);
      });
    });
    let mLabels = Object.keys(muscleCount);
    let mVals   = Object.values(muscleCount);
    let mColors = mLabels.map(m => getMuscleColor(m));
    if (!mLabels.length) { mLabels = ['Sin datos']; mVals = [1]; mColors = ['#374151']; }
    this._buildChart('canvas-dist', 'doughnut', mLabels,
      [{ data:mVals, backgroundColor:mColors, borderWidth:0 }], true
    );

    // 4. Intensidad Promedio — peso medio por sesion
    const intSessions = routineSessions.slice(-10);
    const intData = intSessions.map(s => {
      const sets = s.logs.flatMap(l => (l.sets || []));
      if (!sets.length) return 0;
      return Math.round(sets.reduce((a, st) => a + (st.weight || 0), 0) / sets.length);
    });
    this._buildChart('canvas-intensity', 'line',
      intSessions.map(s => formatDate(s.date).split(' ')[0]),
      [{ label:'Peso prom.', data:intData,
         borderColor:'#A78BFA', backgroundColor:'#A78BFA18', fill:true,
         tension:0.4, borderWidth:2, pointRadius:3, pointBackgroundColor:'#A78BFA' }]
    );
  }

  _buildChart(id, type, labels, datasets, isDoughnut = false) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const existing = Chart.getChart(canvas);
    if (existing) existing.destroy();
    new Chart(canvas.getContext('2d'), {
      type,
      data: { labels, datasets },
      options: isDoughnut ? {
        responsive: true, maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: { position: 'right', labels: { color:'#9CA3AF', font:{ size:10 }, boxWidth:10, padding:8 } }
        }
      } : {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid:{ color:'rgba(255,255,255,0.04)' }, ticks:{ color:'#4B5563', font:{ size:10 } }, beginAtZero:true },
          x: { grid:{ display:false }, ticks:{ color:'#4B5563', font:{ size:10 } } }
        }
      }
    });
  }

  // -------------------------------------------------------
  //  Actividades recientes
  // -------------------------------------------------------
  _renderRecent(sessions) {
    const container = this.querySelector('#recent-list');
    const recent = [...sessions]
      .sort((a,b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    if (!recent.length) {
      container.innerHTML = `
        <div class="empty-state" style="padding:24px;">
          <i class="ph-bold ph-calendar-x icon"></i>
          <p>Sin actividad en este periodo</p>
        </div>`;
      return;
    }

    container.innerHTML = recent.map(s => {
      const isFree = s.type === 'free';
      const title  = isFree ? (s.name || 'Sesion Libre') : 'Entrenamiento';
      const vol    = !isFree ? `+${displayWeight(calcTotalVolume(s.logs))} ${unitLabel()}` : formatDuration(s.duration);
      const ic     = isFree ? 'ph-timer' : 'ph-check-circle';
      const clr    = isFree ? 'var(--success-light)' : 'var(--accent-light)';
      return `
        <div style="display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.03); cursor:pointer;"
          onclick="window.location.hash='#session/${s.id}'">
          <div style="width:32px; height:32px; border-radius:8px; background:rgba(255,255,255,0.03); display:flex; align-items:center; justify-content:center; flex-shrink:0; color:${clr};">
            <i class="ph-fill ${ic}" style="font-size:15px;"></i>
          </div>
          <div style="flex:1; min-width:0;">
            <p style="font-weight:700; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${title}</p>
            <p style="font-size:11px; color:var(--text-muted); margin-top:1px;">${formatDate(s.date)}</p>
          </div>
          <span class="badge badge-blue" style="flex-shrink:0; font-size:10px;">${vol}</span>
        </div>
      `;
    }).join('');
  }

  // -------------------------------------------------------
  //  HTML Helpers
  // -------------------------------------------------------
  _kpiCard(title, value, icon, color) {
    return `
      <div class="glass-card" style="padding:20px;">
        <p style="font-size:10px; color:var(--text-muted); text-transform:uppercase; font-weight:700; letter-spacing:0.06em;">${title}</p>
        <div style="display:flex; align-items:flex-end; justify-content:space-between; margin-top:10px;">
          <span style="font-size:26px; font-weight:900; color:#FFFFFF; line-height:1;">${value === '—' ? '0' : value}</span>
          <i class="ph-bold ${icon}" style="font-size:22px; color:${color}; opacity:0.25;"></i>
        </div>
      </div>
    `;
  }

  _chartContainer(title, canvasId, icon, color) {
    return `
      <div class="glass-card" style="padding:20px;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:16px;">
          <i class="ph-bold ${icon}" style="color:${color}; font-size:16px;"></i>
          <span style="font-weight:700; font-size:13px; color:#FFFFFF;">${title}</span>
        </div>
        <div style="height:200px;">
          <canvas id="${canvasId}"></canvas>
        </div>
      </div>
    `;
  }
}

customElements.define('dashboard-view', DashboardView);
