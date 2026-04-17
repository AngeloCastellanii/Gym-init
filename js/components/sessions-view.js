/**
 * ============================================================
 *  <sessions-view> — Historial de Sesiones
 * ============================================================
 */

class SessionsView extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
    this._sessions = [];
    this._activeFilter = 'all';
  }

  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    this.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Historial</h1>
          <p class="page-subtitle" id="session-subtitle">Cargando...</p>
        </div>
        <button class="btn btn-primary" onclick="window.location.hash='#session/new'">
          <i class="ph-bold ph-play"></i> Nueva Sesion
        </button>
      </div>

      <!-- Filtros + Lista dentro de view-content para centrado correcto -->
      <div class="view-content">
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:24px;">
          ${['all','today','week','month','year'].map(f => `
            <button class="filter-btn ${f === 'all' ? 'active' : ''}" data-filter="${f}">
              ${{ all:'Todo', today:'Hoy', week:'Esta Semana', month:'Este Mes', year:'Este Año' }[f]}
            </button>
          `).join('')}
        </div>

        <!-- Lista de sesiones -->
        <div id="sessions-list">
          <loading-state></loading-state>
        </div>
      </div>
    `;

    this.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._activeFilter = btn.dataset.filter;
        this.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._renderList();
      });
    });
  }

  async loadData() {
    try {
      this._sessions = await GymDB.sessions.getAll();
      this._renderList();
    } catch (err) {
      console.error('Error loadData Sessions:', err);
      this.querySelector('#sessions-list').innerHTML = '<error-state></error-state>';
    }
  }

  _filterSessions() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return this._sessions.filter(s => {
      const d = new Date(s.date);
      switch (this._activeFilter) {
        case 'today': return d >= today;
        case 'week': {
          const ws = new Date(today);
          ws.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
          return d >= ws;
        }
        case 'month': return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        case 'year':  return d.getFullYear() === now.getFullYear();
        default: return true;
      }
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  _renderList() {
    const container = this.querySelector('#sessions-list');
    const filtered = this._filterSessions();
    const subtitle = this.querySelector('#session-subtitle');
    const label = { all:'todas las sesiones', today:'hoy', week:'esta semana', month:'este mes', year:'este año' }[this._activeFilter];
    const totalVol = filtered.filter(s => s.type !== 'free').reduce((a, s) => a + calcTotalVolume(s.logs), 0);

    if (subtitle) {
      subtitle.textContent = `${filtered.length} sesion${filtered.length !== 1 ? 'es' : ''} — ${label}${totalVol > 0 ? ' • Vol: ' + displayWeight(totalVol) + ' ' + unitLabel() : ''}`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="ph-bold ph-calendar-x icon"></i>
          <p>No hay sesiones en este periodo.</p>
          <button class="btn btn-primary" onclick="window.location.hash='#session/new'">
            <i class="ph-bold ph-play"></i> Empezar a entrenar
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(s => {
      const isFree  = s.type === 'free';
      const title   = isFree ? (s.name || 'Sesion Libre') : 'Entrenamiento Finalizado';
      const icon    = isFree ? 'ph-timer' : 'ph-check-circle';
      const iconClr = isFree ? 'var(--success-light)' : 'var(--accent-light)';
      const vol     = !isFree ? `${displayWeight(calcTotalVolume(s.logs))} ${unitLabel()}` : null;

      return `
        <div class="glass-card hover-lift session-row">
          <!-- Icono -->
          <div class="session-row-icon" style="color:${iconClr};">
            <i class="ph-fill ${icon}" style="font-size:24px;"></i>
          </div>

          <!-- Info -->
          <div class="session-row-info" onclick="window.location.hash='#session/${s.id}'">
            <p class="session-row-date">${formatDate(s.date)}</p>
            <h3 class="session-row-title">${title}</h3>
            <div class="session-row-meta">
              ${vol ? `<span><i class="ph ph-barbell"></i> ${vol}</span>` : ''}
              <span><i class="ph ph-clock"></i> ${formatDuration(s.duration)}</span>
              ${!isFree ? `<span><i class="ph ph-list-checks"></i> ${(s.logs||[]).length} ejercicios</span>` : ''}
              ${isFree ? `<span class="badge badge-success" style="font-size:9px; padding:3px 8px;">LIBRE</span>` : ''}
            </div>
          </div>

          <!-- Acciones -->
          <div class="session-row-actions">
            <button class="btn btn-ghost" style="height:34px; padding:0 12px; font-size:12px; white-space:nowrap;" onclick="window.location.hash='#session/${s.id}'">
              <i class="ph-bold ph-arrow-right"></i><span class="btn-label"> Ver</span>
            </button>
            <button class="btn btn-icon btn-danger" style="width:34px; height:34px; border-radius:8px; flex-shrink:0;" onclick="this.closest('sessions-view')._deleteSession('${s.id}')">
              <i class="ph-bold ph-trash-simple"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  async _deleteSession(id) {
    const dialog = document.createElement('confirm-dialog');
    const confirmed = await dialog.show({
      title: 'Eliminar Sesion',
      message: 'Esta accion eliminara permanentemente este registro de entrenamiento.',
      confirmText: 'Si, eliminar'
    });
    if (!confirmed) return;
    try {
      await GymDB.sessions.delete(id);
      this._sessions = this._sessions.filter(s => String(s.id) !== String(id));
      this._renderList();
    } catch (err) {
      console.error('Error al eliminar sesion:', err);
    }
  }
}

customElements.define('sessions-view', SessionsView);
