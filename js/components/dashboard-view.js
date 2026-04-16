/**
 * ============================================================
 *  <dashboard-view> — Panel de Control Principal
 *
 *  Muestra KPIs globales y placeholders de graficos.
 *  Incluye el selector de unidades Kg/Lb.
 * ============================================================
 */

class DashboardView extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
  }

  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    this.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Panel de Control</h1>
          <p class="page-subtitle">Resumen de tu progreso de entrenamiento</p>
        </div>
        <button class="btn btn-glass" id="unit-toggle">
          <i class="ph-bold ph-scales"></i>
          Unidad: <span id="unit-label">${unitLabel()}</span>
        </button>
      </div>
      <div class="view-content">
        <!-- Fila de tarjetas KPI -->
        <div class="kpi-grid">
          ${this._kpiCard('Total Sesiones', '—', 'ph-calendar-check', 'var(--accent-light)')}
          ${this._kpiCard('Racha Actual', '—', 'ph-fire', 'var(--success-light)')}
          ${this._kpiCard('Vol. Total', '—', 'ph-barbell', '#f97316')}
          ${this._kpiCard('Ejercicios', '—', 'ph-list-checks', '#a78bfa')}
        </div>

        <!-- Cuadricula de graficos -->
        <div class="charts-grid">
          ${this._chartPlaceholder('Frecuencia Semanal', 'ph-chart-bar', 'var(--accent-light)')}
          ${this._chartPlaceholder('Progreso de Fuerza', 'ph-trend-up', 'var(--success-light)')}
          ${this._chartPlaceholder('Distribucion Muscular', 'ph-chart-pie-slice', '#f97316')}
          ${this._chartPlaceholder('Volumen Total', 'ph-chart-line-up', '#a78bfa')}
        </div>

        <!-- Sesiones recientes -->
        <div class="glass-card" style="padding:24px;">
          <h3 style="font-size:16px; font-weight:700; margin-bottom:16px; display:flex; align-items:center; gap:8px;">
            <i class="ph-bold ph-clock-counter-clockwise" style="color:var(--accent-light);"></i>
            Sesiones Recientes
          </h3>
          <div class="empty-state" style="padding:32px;">
            <i class="ph ph-clipboard icon" style="font-size:36px;"></i>
            <p>Aun no hay sesiones registradas</p>
          </div>
        </div>
      </div>
    `;

    // Script para cambiar unidades (Kg/Lb)
    this.querySelector('#unit-toggle').addEventListener('click', () => {
      const current = getWeightUnit();
      const next = current === 'kg' ? 'lb' : 'kg';
      setWeightUnit(next);
      this.querySelector('#unit-label').textContent = unitLabel();
      console.log(`Unidades cambiadas a: ${next}`);
    });
  }

  /** Genera una tarjeta KPI de estadistica */
  _kpiCard(title, value, icon, color) {
    return `
      <div class="glass-card hover-lift" style="padding:20px; cursor:default;">
        <p style="font-size:11px; color:var(--text-secondary); margin-bottom:10px; text-transform:uppercase; letter-spacing:0.06em; font-weight:600;">
          ${title}
        </p>
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <span style="font-size:30px; font-weight:900; color:${color}; letter-spacing:-1px;">${value}</span>
          <i class="ph-bold ${icon}" style="font-size:26px; color:${color}; opacity:0.4;"></i>
        </div>
      </div>
    `;
  }

  /** Genera una tarjeta placeholder para un grafico */
  _chartPlaceholder(title, icon, color) {
    return `
      <div class="glass-card" style="padding:20px;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:16px;">
          <i class="ph-bold ${icon}" style="color:${color};"></i>
          <span style="font-weight:600; font-size:14px;">${title}</span>
        </div>
        <div style="height:220px; display:flex; align-items:center; justify-content:center; border-radius:var(--radius-md); background:rgba(255,255,255,0.015); border:1px dashed var(--border);">
          <p style="color:var(--text-muted); font-size:13px;">
            <i class="ph ph-chart-line" style="margin-right:4px;"></i>
            Sin datos suficientes
          </p>
        </div>
      </div>
    `;
  }
}

customElements.define('dashboard-view', DashboardView);
