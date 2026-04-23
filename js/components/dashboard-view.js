/**
 * 
 *  <dashboard-view> — Panel de Control Principal
 *  Con filtros de periodo: Hoy / Semana / Mes / Global
 *  Incluye: objetivo visible, resumen de peso corporal
 * 
 */

class DashboardView extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
    this._sessions  = [];
    this._exercises = [];
    this._exMap     = {};
    this._period    = 'week'; // 'today' | 'week' | 'month' | 'global'
    this._bwRecords = [];
  }

  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    const profile = this._getProfile();
    const goalText = profile.goal || null;
    const name     = profile.name || '';

    const goalIcons = {
      'Ganar musculo':       { icon: 'ph-trend-up',         color: '#f97316' },
      'Perder grasa':        { icon: 'ph-trend-down',        color: '#10b981' },
      'Mejorar resistencia': { icon: 'ph-heartbeat',         color: '#3b82f6' },
      'Mantener forma':      { icon: 'ph-equals',            color: '#a78bfa' },
      'Aumentar fuerza':     { icon: 'ph-barbell',           color: '#fbbf24' }
    };
    const goalStyle = goalIcons[goalText] || { icon: 'ph-target', color: 'var(--accent-light)' };

    this.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">${name ? `Hola, ${name} 👋` : 'Panel de Control'}</h1>
          <p class="page-subtitle" id="dash-subtitle">Resumen de tu progreso</p>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-ghost" id="unit-toggle" style="background:var(--bg-card); border:1px solid var(--border);">
            <i class="ph-bold ph-scales"></i>
            <span id="unit-label">${unitLabel()}</span>
          </button>
        </div>
      </div>

      <!-- Banner de Objetivo -->
      ${goalText ? `
        <div style="margin: 0 32px 0; padding:14px 20px; background:${goalStyle.color}18; border:1px solid ${goalStyle.color}44; border-radius:14px; display:flex; align-items:center; gap:12px;">
          <div style="width:36px; height:36px; border-radius:10px; background:${goalStyle.color}22; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            <i class="ph-bold ${goalStyle.icon}" style="font-size:18px; color:${goalStyle.color};"></i>
          </div>
          <div>
            <p style="font-size:10px; font-weight:800; color:${goalStyle.color}; text-transform:uppercase; letter-spacing:0.06em;">Tu Objetivo</p>
            <p style="font-size:14px; font-weight:700; color:var(--text-primary); margin-top:1px;">${goalText}</p>
          </div>
          <a href="#profile" style="margin-left:auto; font-size:11px; color:var(--text-muted); text-decoration:none; white-space:nowrap;">Editar →</a>
        </div>
      ` : `
        <div style="margin: 0 32px 0; padding:12px 20px; background:rgba(255,255,255,0.02); border:1px dashed rgba(255,255,255,0.08); border-radius:14px; display:flex; align-items:center; justify-content:space-between;">
          <p style="font-size:13px; color:var(--text-muted);">Aún no has definido tu objetivo</p>
          <a href="#profile" style="font-size:12px; font-weight:700; color:var(--accent-light); text-decoration:none;">Configurar →</a>
        </div>
      `}

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

        <!-- Panel de Peso Corporal -->
        <div class="glass-card" style="padding:24px;" id="bw-dashboard-card">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <i class="ph-bold ph-scales" style="color:#10b981; font-size:16px;"></i>
              <span style="font-weight:700; font-size:15px; color:var(--text-primary);">Evolución de Peso Corporal</span>
            </div>
            <a href="#profile" style="font-size:11px; color:var(--text-muted); text-decoration:none;">+ Registrar →</a>
          </div>
          <div id="bw-dashboard-content">
            <p style="font-size:12px; color:var(--text-muted); font-style:italic; text-align:center; padding:16px 0;">Cargando...</p>
          </div>
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

    // Evento unidad
    this.querySelector('#unit-toggle').addEventListener('click', () => {
      setWeightUnit(getWeightUnit() === 'kg' ? 'lb' : 'kg');
      location.reload();
    });

    // Eventos filtro de periodo
    this.querySelectorAll('.filter-btn[data-period]').forEach(btn => {
      btn.addEventListener('click', () => {
        this._period = btn.dataset.period;
        this.querySelectorAll('.filter-btn[data-period]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._update();
      });
    });
  }

  _getProfile() {
    try { return JSON.parse(localStorage.getItem('gym-profile') || '{}'); }
    catch { return {}; }
  }

  async loadData() {
    try {
      [this._sessions, this._exercises, this._bwRecords] = await Promise.all([
        GymDB.sessions.getAll(),
        GymDB.exercises.getAll(),
        GymDB.bodyweight.getLastDays(90)
      ]);
      this._exMap = Object.fromEntries(this._exercises.map(e => [e.id, e]));
      this._update();
      this._renderBwPanel();
    } catch (err) {
      console.error('Error dashboard loadData:', err);
    }
  }

  // -------------------------------------------------------
  //  Panel de Peso Corporal
  // -------------------------------------------------------
  _renderBwPanel() {
    const container = this.querySelector('#bw-dashboard-content');
    if (!container) return;

    const records = this._bwRecords;
    const unit    = unitLabel();

    if (!records || records.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:24px 0;">
          <i class="ph-bold ph-scales" style="font-size:36px; color:var(--text-muted); opacity:0.3;"></i>
          <p style="font-size:13px; color:var(--text-muted); margin-top:12px;">Aún no tienes registros de peso.</p>
          <a href="#profile" style="font-size:12px; color:var(--accent-light); font-weight:700; text-decoration:none;">Registra tu peso de hoy →</a>
        </div>
      `;
      return;
    }

    const weights  = records.map(r => r.weight);
    const latest   = records[records.length - 1];
    const oldest   = records[0];
    const change   = parseFloat((latest.weight - oldest.weight).toFixed(1));
    const absChange = Math.abs(change);

    // Determinar tendencia
    let trendLabel, trendColor, trendIcon;
    if (records.length < 2 || change === 0) {
      trendLabel = 'Estable'; trendColor = '#a78bfa'; trendIcon = 'ph-equals';
    } else if (change > 0) {
      trendLabel = `+${absChange} ${unit}`; trendColor = '#f97316'; trendIcon = 'ph-trend-up';
    } else {
      trendLabel = `-${absChange} ${unit}`; trendColor = '#10b981'; trendIcon = 'ph-trend-down';
    }

    // Mini KPIs de peso
    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);
    const avg  = (weights.reduce((a,b) => a+b, 0) / weights.length).toFixed(1);

    const kpis = `
      <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:20px;">
        <div style="text-align:center; padding:12px 8px; background:rgba(255,255,255,0.02); border-radius:10px; border:1px solid var(--border);">
          <p style="font-size:18px; font-weight:800; color:#FFF;">${latest.weight}</p>
          <p style="font-size:10px; color:var(--text-muted); margin-top:2px;">${unit} — Actual</p>
        </div>
        <div style="text-align:center; padding:12px 8px; background:rgba(255,255,255,0.02); border-radius:10px; border:1px solid var(--border);">
          <p style="font-size:18px; font-weight:800; color:${trendColor}; display:flex; align-items:center; justify-content:center; gap:4px;">
            <i class="ph-bold ${trendIcon}" style="font-size:14px;"></i>${trendLabel}
          </p>
          <p style="font-size:10px; color:var(--text-muted); margin-top:2px;">vs hace ${records.length - 1} días</p>
        </div>
        <div style="text-align:center; padding:12px 8px; background:rgba(255,255,255,0.02); border-radius:10px; border:1px solid var(--border);">
          <p style="font-size:18px; font-weight:800; color:#FFF;">${minW}</p>
          <p style="font-size:10px; color:var(--text-muted); margin-top:2px;">${unit} — Mínimo</p>
        </div>
        <div style="text-align:center; padding:12px 8px; background:rgba(255,255,255,0.02); border-radius:10px; border:1px solid var(--border);">
          <p style="font-size:18px; font-weight:800; color:#FFF;">${avg}</p>
          <p style="font-size:10px; color:var(--text-muted); margin-top:2px;">${unit} — Promedio</p>
        </div>
      </div>
    `;

    // Gráfica de línea SVG para peso
    const n    = records.length;
    const W    = 600, H = 120, padL = 36, padR = 16, padT = 16, padB = 28;
    const minWp = minW - 1; const maxWp = maxW + 1;
    const rangeW = maxWp - minWp || 1;

    const xPos = (i) => padL + (i / Math.max(n - 1, 1)) * (W - padL - padR);
    const yPos = (w) => padT + (1 - (w - minWp) / rangeW) * (H - padT - padB);

    // Línea de tendencia como polyline
    const points = records.map((r, i) => `${xPos(i).toFixed(1)},${yPos(r.weight).toFixed(1)}`).join(' ');

    // Área bajo la línea
    const areaPoints = `${xPos(0).toFixed(1)},${(H - padB).toFixed(1)} ${points} ${xPos(n-1).toFixed(1)},${(H - padB).toFixed(1)}`;

    // Etiquetas Y (eje izquierdo)
    const yTicks = [minW, Math.round((minW + maxW) / 2), maxW];
    const yLabels = yTicks.map(v => `
      <text x="${padL - 4}" y="${yPos(v).toFixed(1) + 4}" text-anchor="end"
        fill="rgba(255,255,255,0.3)" font-size="9" font-family="Inter,sans-serif">${v}</text>
      <line x1="${padL}" y1="${yPos(v).toFixed(1)}" x2="${W - padR}" y2="${yPos(v).toFixed(1)}"
        stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
    `).join('');

    // Etiquetas X (cada ~7 días o menos)
    const step = Math.max(1, Math.floor(n / 5));
    const xLabels = records.map((r, i) => {
      if (i % step !== 0 && i !== n - 1) return '';
      const d = new Date(r.date + 'T00:00:00');
      const label = `${d.getDate()}/${d.getMonth() + 1}`;
      return `<text x="${xPos(i).toFixed(1)}" y="${H - 6}" text-anchor="middle"
        fill="rgba(255,255,255,0.3)" font-size="8" font-family="Inter,sans-serif">${label}</text>`;
    }).join('');

    // Punto del último valor
    const lastX = xPos(n - 1).toFixed(1);
    const lastY = yPos(latest.weight).toFixed(1);

    const svgLine = `
      <div style="background:rgba(0,0,0,0.2); border-radius:12px; padding:12px; border:1px solid var(--border); overflow-x:auto;">
        <svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bwGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="${trendColor}" stop-opacity="0.25"/>
              <stop offset="100%" stop-color="${trendColor}" stop-opacity="0"/>
            </linearGradient>
          </defs>
          ${yLabels}
          <polygon points="${areaPoints}" fill="url(#bwGradient)"/>
          <polyline points="${points}" fill="none" stroke="${trendColor}" stroke-width="2" stroke-linejoin="round"/>
          ${records.map((r, i) => `
            <circle cx="${xPos(i).toFixed(1)}" cy="${yPos(r.weight).toFixed(1)}" r="${i === n-1 ? 5 : 2.5}"
              fill="${i === n-1 ? trendColor : trendColor + '88'}" />
          `).join('')}
          <text x="${lastX}" y="${parseFloat(lastY) - 10}" text-anchor="middle"
            fill="#fff" font-size="10" font-weight="700" font-family="Inter,sans-serif">${latest.weight} ${unit}</text>
          ${xLabels}
        </svg>
      </div>
    `;

    container.innerHTML = kpis + svgLine;
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
      .filter((v, i, a) => a.indexOf(v) === i)
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

    // 2. Frecuencia
    const freqData = [0,0,0,0,0,0,0];
    sessions.forEach(s => {
      const idx = new Date(s.date).getDay();
      freqData[idx === 0 ? 6 : idx - 1]++;
    });
    this._buildChart('canvas-freq', 'bar',
      ['L','M','M','J','V','S','D'],
      [{ label:'Sesiones', data:freqData, backgroundColor:'#10B981', borderRadius:5 }]
    );

    // 3. Distribución Muscular
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

    // 4. Intensidad Promedio
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

    const ctx = canvas.getContext('2d');
    
    // Gradiente para lineas (Fase 4)
    let gradient = null;
    if (type === 'line' && datasets[0].borderColor) {
      gradient = ctx.createLinearGradient(0, 0, 0, 200);
      gradient.addColorStop(0, datasets[0].borderColor + '44');
      gradient.addColorStop(1, datasets[0].borderColor + '00');
      datasets[0].backgroundColor = gradient;
    }

    new Chart(ctx, {
      type,
      data: { labels, datasets },
      options: isDoughnut ? {
        responsive: true, maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
          legend: { 
            position: 'right', 
            labels: { 
              color:'#9CA3AF', 
              font:{ size:11, weight:'600' }, 
              boxWidth:8, 
              usePointStyle: true,
              padding:12 
            } 
          }
        }
      } : {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { 
            grid:{ color:'rgba(255,255,255,0.03)', drawBorder:false }, 
            ticks:{ color:'#6B7280', font:{ size:10, weight:'600' }, beginAtZero:true, padding:8 } 
          },
          x: { 
            grid:{ display:false }, 
            ticks:{ color:'#6B7280', font:{ size:10, weight:'600' }, padding:8 } 
          }
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
