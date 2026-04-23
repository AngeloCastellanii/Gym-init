/**
 *
 *  <app-nav> — Componente principal de navegacion
 *
 */

class AppNav extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
    this._items = [
      { hash: '#dashboard', icon: 'ph-chart-line-up', label: 'Dashboard' },
      { hash: '#exercises', icon: 'ph-barbell', label: 'Ejercicios' },
      { hash: '#routines', icon: 'ph-clipboard-text', label: 'Rutinas' },
      { hash: '#sessions', icon: 'ph-calendar-check', label: 'Sesiones' },
      { hash: '#session/new', icon: 'ph-play-circle', label: 'Entrenar' },
      { hash: '#profile', icon: 'ph-user-circle', label: 'Perfil' },
    ];
  }

  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    this.innerHTML = this._buildHTML();

    // Mostrar nombre del perfil en el sidebar
    try {
      const profile = JSON.parse(localStorage.getItem('gym-profile') || '{}');
      if (profile.name) {
        const nameEl   = this.querySelector('#nav-username');
        const avatarEl = this.querySelector('#nav-avatar');
        if (nameEl)   nameEl.textContent = profile.name;
        if (avatarEl) avatarEl.textContent = profile.name.charAt(0).toUpperCase();
      }
    } catch (_) {}

    this.addEventListener('click', (e) => {
      const link = e.target.closest('[data-route]');
      if (link) {
        e.preventDefault();
        window.location.hash = link.dataset.route;
      }
    });

    document.addEventListener('route-changed', (e) => {
      this._highlightActive(e.detail.hash);
    });

    // Logica de Tema Global
    const themeBtn       = this.querySelector('#global-theme-toggle');
    const themeIcon      = this.querySelector('#global-theme-icon');
    const themeLabel     = this.querySelector('#global-theme-label');
    const bottomThemeBtn   = this.querySelector('#bottom-theme-toggle');
    const bottomThemeIcon  = this.querySelector('#bottom-theme-icon');
    const bottomThemeLabel = this.querySelector('#bottom-theme-label');

    const updateThemeUI = (theme) => {
      const isLight = theme === 'light';
      const iconClass = isLight ? 'ph-bold ph-moon' : 'ph-bold ph-sun-dim';
      const labelText = isLight ? 'Oscuro' : 'Claro';
      if (themeIcon)      themeIcon.className      = iconClass;
      if (themeLabel)     themeLabel.textContent    = isLight ? 'Modo Oscuro' : 'Modo Claro';
      if (bottomThemeIcon)  bottomThemeIcon.className  = iconClass;
      if (bottomThemeLabel) bottomThemeLabel.textContent = labelText;
    };

    const applyTheme = () => {
      const current = document.documentElement.dataset.theme || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      updateThemeUI(next);
      try {
        const p = JSON.parse(localStorage.getItem('gym-profile') || '{}');
        p.theme = next;
        localStorage.setItem('gym-profile', JSON.stringify(p));
        window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: next } }));
      } catch(e) {}
    };

    const currentTheme = document.documentElement.dataset.theme || 'dark';
    updateThemeUI(currentTheme);

    if (themeBtn)       themeBtn.addEventListener('click', applyTheme);
    if (bottomThemeBtn) bottomThemeBtn.addEventListener('click', applyTheme);
  }

  _buildHTML() {
    const navItemsHTML = this._items.map(item => `
      <a class="nav-item" data-route="${item.hash}" href="${item.hash}" aria-label="${item.label}">
        <i class="ph-bold ${item.icon}"></i>
        <span class="nav-label">${item.label}</span>
      </a>
    `).join('');

    // Bottom nav incluye el toggle de tema como item extra
    const bottomNavItemsHTML = this._items.map(item => `
      <a class="nav-item" data-route="${item.hash}" href="${item.hash}" aria-label="${item.label}">
        <i class="ph-bold ${item.icon}"></i>
        <span class="nav-label">${item.label}</span>
      </a>
    `).join('');

    return `
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
          <a class="sidebar-logo" data-route="#dashboard" href="#dashboard">
            <div class="sidebar-logo-icon">
              <i class="ph-fill ph-barbell"></i>
            </div>
            <div style="display:flex; flex-direction:column;">
              <span class="sidebar-logo-text">Gym Init</span>
              <span style="font-size:8px; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em;">Dale Push a tu entrenamiento</span>
            </div>
          </a>
        </div>
        <div class="sidebar-divider"></div>
        <nav class="sidebar-menu">${navItemsHTML}</nav>
        <div style="flex:1;"></div>
        
        <!-- Theme Toggle Global (Sidebar) -->
        <div style="padding:0 12px 12px;">
          <button id="global-theme-toggle" class="nav-item" style="width:100%; border:1px solid var(--border); background:rgba(255,255,255,0.02); cursor:pointer;">
            <i id="global-theme-icon" class="ph-bold ph-sun-dim"></i>
            <span id="global-theme-label" class="nav-label">Modo Claro</span>
          </button>
        </div>

        <div class="sidebar-divider"></div>
        <!-- Acceso rapido al perfil -->
        <div style="padding:12px;">
          <a class="nav-item" data-route="#profile" href="#profile" aria-label="Perfil" id="sidebar-profile-link"
             style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05);">
            <div style="width:32px; height:32px; border-radius:50%; background:var(--accent); display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:800; color:#fff; flex-shrink:0; text-transform:uppercase;" id="nav-avatar">
              <i class="ph-fill ph-user"></i>
            </div>
            <div style="min-width:0;">
              <span id="nav-username" style="font-size:13px; font-weight:700; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:block;">Mi Perfil</span>
              <span style="font-size:10px; color:var(--text-muted);">Configuracion</span>
            </div>
          </a>
        </div>
      </aside>

      <!-- Bottom Nav (Movil) — incluye theme toggle -->
      <nav class="bottom-nav" id="bottom-nav">
        ${bottomNavItemsHTML}
        <button class="nav-item bottom-theme-btn" id="bottom-theme-toggle" aria-label="Cambiar tema" style="background:none; border:none; cursor:pointer;">
          <i id="bottom-theme-icon" class="ph-bold ph-sun-dim" style="font-size:22px;"></i>
          <span class="nav-label" id="bottom-theme-label">Tema</span>
        </button>
      </nav>
    `;
  }

  _highlightActive(hash) {
    this.querySelectorAll('.nav-item').forEach(item => {
      const route = item.dataset.route;
      let isActive = (hash === route);
      if (!isActive && route === '#sessions' && /^#session\/(?!new)[^/]+$/.test(hash)) isActive = true;
      if (!isActive && route === '#routines' && /^#routine\/[^/]+$/.test(hash)) isActive = true;
      item.classList.toggle('active', isActive);
    });
  }
}

customElements.define('app-nav', AppNav);
