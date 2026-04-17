/**
 * ============================================================
 *  <profile-view> — Perfil y Configuracion del Usuario
 * ============================================================
 */

class ProfileView extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
  }

  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;
    this._render();
  }

  /* ----------------------------------------------------------
     Helpers de perfil (localStorage)
  ---------------------------------------------------------- */
  _getProfile() {
    try { return JSON.parse(localStorage.getItem('gym-profile') || '{}'); }
    catch { return {}; }
  }

  _saveProfile(data) {
    localStorage.setItem('gym-profile', JSON.stringify(data));
  }

  /* ----------------------------------------------------------
     Render principal
  ---------------------------------------------------------- */
  _render() {
    const profile  = this._getProfile();
    const name     = profile.name  || '';
    const goal     = profile.goal  || '';
    const unit     = getWeightUnit();
    const customs  = getCustomMuscles();

    this.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Perfil y Configuracion</h1>
          <p class="page-subtitle">Personaliza tu experiencia de entrenamiento</p>
        </div>
      </div>

      <div class="view-content" style="max-width:680px;">

        <!-- ── Tarjeta de Perfil ── -->
        <div class="glass-card" style="padding:28px;">
          <div style="display:flex; align-items:center; gap:18px; margin-bottom:28px;">
            <!-- Avatar generado -->
            <div id="profile-avatar" style="width:64px; height:64px; border-radius:50%; background:var(--accent); display:flex; align-items:center; justify-content:center; font-size:26px; font-weight:800; color:#fff; flex-shrink:0; text-transform:uppercase;">
              ${name ? name.charAt(0) : '<i class="ph-fill ph-user" style="font-size:28px;"></i>'}
            </div>
            <div>
              <h2 style="font-size:18px; font-weight:800; color:#FFFFFF;">${name || 'Sin nombre'}</h2>
              <p style="font-size:12px; color:var(--text-muted); margin-top:2px;">${goal || 'Sin objetivo definido'}</p>
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:16px;">
            <div class="form-group">
              <label class="form-label">Tu nombre</label>
              <input class="form-input" id="profile-name" placeholder="Ej: Angelo" value="${name}" style="background:#0B0E14;">
            </div>
            <div class="form-group">
              <label class="form-label">Tu objetivo</label>
              <select class="form-select" id="profile-goal" style="background:#0B0E14;">
                <option value="" ${!goal ? 'selected' : ''}>— Seleccionar —</option>
                <option value="Ganar musculo" ${goal==='Ganar musculo' ? 'selected' : ''}>Ganar musculo</option>
                <option value="Perder grasa" ${goal==='Perder grasa' ? 'selected' : ''}>Perder grasa</option>
                <option value="Mejorar resistencia" ${goal==='Mejorar resistencia' ? 'selected' : ''}>Mejorar resistencia</option>
                <option value="Mantener forma" ${goal==='Mantener forma' ? 'selected' : ''}>Mantener forma</option>
                <option value="Aumentar fuerza" ${goal==='Aumentar fuerza' ? 'selected' : ''}>Aumentar fuerza</option>
              </select>
            </div>
            <button class="btn btn-primary" id="btn-save-profile" style="align-self:flex-start;">
              <i class="ph-bold ph-floppy-disk"></i> Guardar Perfil
            </button>
          </div>
        </div>

        <!-- ── Preferencias ── -->
        <div class="glass-card" style="padding:28px;">
          <h3 style="font-size:15px; font-weight:700; color:#FFFFFF; margin-bottom:20px; display:flex; align-items:center; gap:8px;">
            <i class="ph-bold ph-sliders" style="color:var(--accent-light);"></i>
            Preferencias
          </h3>

          <!-- Unidad de peso -->
          <div style="display:flex; align-items:center; justify-content:space-between; padding:14px 0; border-bottom:1px solid rgba(255,255,255,0.04);">
            <div>
              <p style="font-size:14px; font-weight:600; color:#FFFFFF;">Unidad de Peso</p>
              <p style="font-size:12px; color:var(--text-muted); margin-top:2px;">Se aplica a todos los calculos y graficas</p>
            </div>
            <div style="display:flex; gap:6px;">
              <button class="btn ${unit==='kg' ? 'btn-primary' : 'btn-ghost'}" id="unit-kg" style="height:36px; padding:0 16px; font-size:13px; font-weight:700;">Kg</button>
              <button class="btn ${unit==='lb' ? 'btn-primary' : 'btn-ghost'}" id="unit-lb" style="height:36px; padding:0 16px; font-size:13px; font-weight:700;">Lb</button>
            </div>
          </div>
        </div>

        <!-- ── Grupos Musculares / Actividades ── -->
        <div class="glass-card" style="padding:28px;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
            <h3 style="font-size:15px; font-weight:700; color:#FFFFFF; display:flex; align-items:center; gap:8px;">
              <i class="ph-bold ph-tag" style="color:#f97316;"></i>
              Grupos Musculares y Actividades
            </h3>
            <button class="btn btn-ghost" id="btn-add-muscle-profile" style="height:34px; padding:0 12px; font-size:12px; font-weight:700;">
              <i class="ph-bold ph-plus"></i> Agregar
            </button>
          </div>

          <!-- Defaults (no eliminables) -->
          <p style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:10px;">Predeterminados</p>
          <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:20px;">
            ${DEFAULT_MUSCLES.map(m => {
              const c = getMuscleColor(m);
              return `<span class="badge" style="font-size:11px; padding:5px 12px; color:${c}; border-color:${c}33; background:${c}1a;">${m}</span>`;
            }).join('')}
          </div>

          <!-- Personalizados (eliminables) -->
          <div id="custom-muscles-section" style="${customs.length ? '' : 'display:none'}">
            <p style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:10px;">Personalizados</p>
            <div id="custom-muscles-list" style="display:flex; flex-wrap:wrap; gap:6px;">
              ${this._buildCustomTags(customs)}
            </div>
          </div>

          ${customs.length === 0 ? `<p style="font-size:12px; color:var(--text-muted); font-style:italic;">Aun no has agregado grupos personalizados.</p>` : ''}
        </div>

        <!-- ── Zona de Peligro ── -->
        <div class="glass-card" style="padding:28px; border-color:rgba(220,38,38,0.15);">
          <h3 style="font-size:15px; font-weight:700; color:var(--danger-light); margin-bottom:8px; display:flex; align-items:center; gap:8px;">
            <i class="ph-bold ph-warning-circle"></i>
            Zona de Peligro
          </h3>
          <p style="font-size:12px; color:var(--text-muted); margin-bottom:18px;">Estas acciones son irreversibles. Procede con cuidado.</p>
          <button class="btn btn-danger" id="btn-clear-data" style="font-size:13px;">
            <i class="ph-bold ph-trash"></i> Borrar todos mis datos
          </button>
        </div>

      </div>
    `;

    this._wireEvents();
  }

  _buildCustomTags(customs) {
    return customs.map(m => {
      const c = getMuscleColor(m);
      return `
        <span class="badge muscle-custom-tag" style="font-size:11px; padding:5px 10px; gap:6px; color:${c}; border-color:${c}33; background:${c}1a; display:inline-flex; align-items:center;">
          ${m}
          <button data-muscle="${m}" style="background:none; border:none; cursor:pointer; color:inherit; opacity:0.6; padding:0; display:flex; align-items:center;" title="Eliminar">
            <i class="ph-bold ph-x" style="font-size:10px;"></i>
          </button>
        </span>
      `;
    }).join('');
  }

  _wireEvents() {
    /* Guardar perfil */
    this.querySelector('#btn-save-profile').addEventListener('click', () => {
      const name = this.querySelector('#profile-name').value.trim();
      const goal = this.querySelector('#profile-goal').value;
      this._saveProfile({ name, goal });

      // Actualizar avatar en tiempo real
      const avatar = this.querySelector('#profile-avatar');
      if (avatar) {
        avatar.innerHTML = name
          ? name.charAt(0)
          : '<i class="ph-fill ph-user" style="font-size:28px;"></i>';
      }

      // Mostrar feedback
      const btn = this.querySelector('#btn-save-profile');
      const original = btn.innerHTML;
      btn.innerHTML = '<i class="ph-bold ph-check"></i> Guardado';
      btn.style.background = 'var(--success)';
      setTimeout(() => {
        btn.innerHTML = original;
        btn.style.background = '';
        // Actualizar nombre visible
        this.querySelector('h2').textContent = name || 'Sin nombre';
        this.querySelector('p.page-subtitle ~ div h2') && (this.querySelector('h2').textContent = name || 'Sin nombre');
      }, 1500);
    });

    /* Cambiar unidad */
    this.querySelector('#unit-kg').addEventListener('click', () => {
      setWeightUnit('kg');
      this._updateUnitButtons('kg');
    });
    this.querySelector('#unit-lb').addEventListener('click', () => {
      setWeightUnit('lb');
      this._updateUnitButtons('lb');
    });

    /* Agregar musculo/actividad */
    this.querySelector('#btn-add-muscle-profile').addEventListener('click', () => {
      const name = prompt('Nombre del nuevo grupo muscular o actividad:');
      if (!name || !name.trim()) return;
      addCustomMuscle(name.trim());
      this._refreshCustomMuscles();
    });

    /* Eliminar musculo personalizado (delegacion) */
    const muscleList = this.querySelector('#custom-muscles-list');
    if (muscleList) {
      muscleList.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-muscle]');
        if (!btn) return;
        const muscle = btn.dataset.muscle;
        if (confirm(`Eliminar "${muscle}"? Los ejercicios que lo usen quedaran sin grupo.`)) {
          removeCustomMuscle(muscle);
          this._refreshCustomMuscles();
        }
      });
    }

    /* Borrar todos los datos */
    this.querySelector('#btn-clear-data').addEventListener('click', async () => {
      const dialog = document.createElement('confirm-dialog');
      const confirmed = await dialog.show({
        title: 'Borrar todos los datos',
        message: 'Se eliminaran TODAS tus sesiones, rutinas y ejercicios. Este proceso no se puede deshacer.',
        confirmText: 'Si, borrar todo'
      });
      if (!confirmed) return;

      try {
        // Limpiar IndexedDB
        const allSessions  = await GymDB.sessions.getAll();
        const allRoutines  = await GymDB.routines.getAll();
        const allExercises = await GymDB.exercises.getAll();
        await Promise.all([
          ...allSessions.map(s  => GymDB.sessions.delete(s.id)),
          ...allRoutines.map(r  => GymDB.routines.delete(r.id)),
          ...allExercises.map(e => GymDB.exercises.delete(e.id))
        ]);
        // Limpiar localStorage (excepto preferencias)
        const unit = localStorage.getItem('gym-weight-unit');
        const profile = localStorage.getItem('gym-profile');
        localStorage.removeItem('gym-custom-muscles');
        if (unit) localStorage.setItem('gym-weight-unit', unit);
        if (profile) localStorage.setItem('gym-profile', profile);

        alert('Datos eliminados correctamente.');
        window.location.hash = '#dashboard';
      } catch (err) {
        console.error('Error al borrar datos:', err);
        alert('Error al borrar los datos: ' + err.message);
      }
    });
  }

  _updateUnitButtons(unit) {
    const kgBtn = this.querySelector('#unit-kg');
    const lbBtn = this.querySelector('#unit-lb');
    if (!kgBtn || !lbBtn) return;
    kgBtn.className = `btn ${unit === 'kg' ? 'btn-primary' : 'btn-ghost'}`;
    kgBtn.style.cssText = 'height:36px; padding:0 16px; font-size:13px; font-weight:700;';
    lbBtn.className = `btn ${unit === 'lb' ? 'btn-primary' : 'btn-ghost'}`;
    lbBtn.style.cssText = 'height:36px; padding:0 16px; font-size:13px; font-weight:700;';
  }

  _refreshCustomMuscles() {
    const customs = getCustomMuscles();
    const section = this.querySelector('#custom-muscles-section');
    const list    = this.querySelector('#custom-muscles-list');
    if (!section || !list) return;

    if (customs.length === 0) {
      section.style.display = 'none';
    } else {
      section.style.display = 'block';
      list.innerHTML = this._buildCustomTags(customs);
    }
  }
}

customElements.define('profile-view', ProfileView);
