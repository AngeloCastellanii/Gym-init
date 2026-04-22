/**
 * 
 *  <profile-view> — Perfil y Configuracion del Usuario
 * 
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

        <!-- ── Calendario de Consistencia (Fase 2) ── -->
        <div class="glass-card" style="padding:28px;">
          <h3 style="font-size:15px; font-weight:700; color:#FFFFFF; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
            <i class="ph-bold ph-calendar" style="color:var(--accent-light);"></i>
            Consistencia y Actividad
          </h3>
          <p style="font-size:12px; color:var(--text-muted); margin-bottom:20px;">Tu historial de actividad de los ultimos meses</p>
          
          <div id="activity-heatmap" style="overflow-x:auto; padding-bottom:8px;">
            <p style="font-size:12px; color:var(--text-muted); font-style:italic;">Calculando actividad...</p>
          </div>

          <div id="streak-stats" style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:20px;">
            <!-- Streaks se inyectan aqui -->
          </div>
        </div>

        <!-- ── Records Personales / Hall of Fame (Fase 2) ── -->
        <div class="glass-card" style="padding:28px;">
          <h3 style="font-size:15px; font-weight:700; color:#FFFFFF; margin-bottom:20px; display:flex; align-items:center; gap:8px;">
            <i class="ph-bold ph-trophy" style="color:#fbbf24;"></i>
            Hall of Fame — Records Personales
          </h3>
          <div id="personal-records-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(140px, 1fr)); gap:12px;">
            <p style="font-size:12px; color:var(--text-muted); font-style:italic;">Analizando historial...</p>
          </div>
        </div>

        <!-- ── Sistema de Metas Objetivos (Fase 2) ── -->
        <div class="glass-card" style="padding:28px;">
          <h3 style="font-size:15px; font-weight:700; color:#FFFFFF; margin-bottom:8px; display:flex; align-items:center; gap:8px;">
            <i class="ph-bold ph-flag-banner" style="color:var(--success-light);"></i>
            Metas y Objetivos
          </h3>
          <p style="font-size:12px; color:var(--text-muted); margin-bottom:20px;">Lo que estas por lograr</p>
          
          <div style="display:flex; flex-direction:column; gap:20px;">
            <div class="goal-item">
              <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span style="font-size:13px; font-weight:700; color:#FFF;">Peso Corporal Objetivo</span>
                <span id="goal-weight-label" style="font-size:12px; color:var(--accent-light); font-weight:800;">-- ${unit}</span>
              </div>
              <input type="range" class="form-range" id="goal-weight-range" min="40" max="150" step="0.5" style="width:100%; accent-color:var(--accent);">
            </div>

            <div class="goal-item">
              <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span style="font-size:13px; font-weight:700; color:#FFF;">Meta de Entrenamiento Semanal</span>
                <span id="goal-freq-label" style="font-size:12px; color:var(--success-light); font-weight:800;">-- dias</span>
              </div>
              <div style="display:flex; gap:6px;">
                ${[1,2,3,4,5,6,7].map(d => `<button class="btn btn-ghost btn-goal-freq" data-val="${d}" style="flex:1; height:32px; font-size:11px; padding:0;">${d}</button>`).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- ── Temas y Personalización (Fase 2.3) ── -->
        <div class="glass-card" style="padding:28px;">
          <h3 style="font-size:15px; font-weight:700; color:var(--text-primary); margin-bottom:20px; display:flex; align-items:center; gap:8px;">
            <i class="ph-bold ph-palette" style="color:var(--accent-light);"></i>
            Aspecto de la App
          </h3>
          <div style="display:flex; align-items:center; justify-content:space-between; padding:14px 0;">
            <div>
              <p style="font-size:14px; font-weight:600; color:var(--text-primary);">Tema Visual</p>
              <p style="font-size:12px; color:var(--text-secondary); margin-top:2px;">Elige tu ambiente preferido</p>
            </div>
            <div style="display:flex; background:var(--bg-base); padding:4px; border-radius:12px; border:1px solid var(--border);">
              <button class="btn-theme" data-theme="dark" style="padding:8px 16px; border-radius:8px; border:none; cursor:pointer; font-size:12px; font-weight:700; display:flex; align-items:center; gap:6px; transition:all 0.2s;">
                <i class="ph-bold ph-moon"></i> Oscuro
              </button>
              <button class="btn-theme" data-theme="light" style="padding:8px 16px; border-radius:8px; border:none; cursor:pointer; font-size:12px; font-weight:700; display:flex; align-items:center; gap:6px; transition:all 0.2s;">
                <i class="ph-bold ph-sun"></i> Claro
              </button>
            </div>
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

        <!-- ── Peso Corporal ── -->
        <div class="glass-card" style="padding:28px;" id="bw-card">
          <h3 style="font-size:15px; font-weight:700; color:#FFFFFF; margin-bottom:20px; display:flex; align-items:center; gap:8px;">
            <i class="ph-bold ph-scales" style="color:#10b981;"></i>
            Registro de Peso Corporal
          </h3>

          <!-- Registro de hoy -->
          <div style="display:flex; gap:12px; align-items:flex-end; margin-bottom:20px;">
            <div class="form-group" style="flex:1; margin-bottom:0;">
              <label class="form-label">Tu peso hoy</label>
              <div style="position:relative; margin-top:8px;">
                <input class="form-input" id="bw-input" type="number" step="0.1" min="30" max="300"
                  placeholder="Ej: 75.5" style="background:#0B0E14; padding-right:40px;">
                <span style="position:absolute; right:14px; top:50%; transform:translateY(-50%); font-size:11px; font-weight:800; color:var(--text-muted);">${unit}</span>
              </div>
            </div>
            <button class="btn btn-primary" id="btn-log-weight" style="height:44px; padding:0 20px; flex-shrink:0;">
              <i class="ph-bold ph-plus"></i> Guardar
            </button>
          </div>

          <!-- Historial visual -->
          <div id="bw-history-wrap">
            <p style="font-size:12px; color:var(--text-muted); font-style:italic;">Cargando historial...</p>
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
        const allBw        = await GymDB.bodyweight.getAll();
        await Promise.all([
          ...allSessions.map(s  => GymDB.sessions.delete(s.id)),
          ...allRoutines.map(r  => GymDB.routines.delete(r.id)),
          ...allExercises.map(e => GymDB.exercises.delete(e.id)),
          ...allBw.map(b        => GymDB._delete('bodyweight', b.id))
        ]);
        // Limpiar localStorage (excepto preferencias)
        const unit    = localStorage.getItem('gym-weight-unit');
        const profile = localStorage.getItem('gym-profile');
        localStorage.removeItem('gym-custom-muscles');
        if (unit)    localStorage.setItem('gym-weight-unit', unit);
        if (profile) localStorage.setItem('gym-profile', profile);

        // Re-insertar ejercicios y rutinas del seed
        await seedDatabase();

        alert('Datos eliminados y restaurados correctamente. La app se reiniciara.');
        location.reload();
      } catch (err) {
        console.error('Error al borrar datos:', err);
        alert('Error al borrar los datos: ' + err.message);
      }
    });

    /* Registrar peso corporal */
    const btnLogWeight = this.querySelector('#btn-log-weight');
    if (btnLogWeight) {
      btnLogWeight.addEventListener('click', async () => {
        const input = this.querySelector('#bw-input');
        const val = parseFloat(input ? input.value : '');
        if (!val || val < 20 || val > 500) {
          alert('Ingresa un peso válido (entre 20 y 500).');
          return;
        }
        await GymDB.bodyweight.logToday(val);
        input.value = '';
        // feedback
        btnLogWeight.innerHTML = '<i class="ph-bold ph-check"></i> Guardado';
        btnLogWeight.style.background = 'var(--success)';
        setTimeout(() => {
          btnLogWeight.innerHTML = '<i class="ph-bold ph-plus"></i> Guardar';
          btnLogWeight.style.background = '';
        }, 1500);
        this._loadBwHistory();
      });
    }

    /* Temas (Fase 2.3) */
    const themeBtns = this.querySelectorAll('.btn-theme');
    const currentTheme = document.documentElement.dataset.theme || 'dark';
    
    const updateThemeUI = (theme) => {
      themeBtns.forEach(btn => {
        const isActive = btn.dataset.theme === theme;
        btn.style.background = isActive ? 'var(--accent)' : 'transparent';
        btn.style.color = isActive ? '#FFF' : 'var(--text-secondary)';
      });
    };
    updateThemeUI(currentTheme);

    themeBtns.forEach(btn => {
      btn.onclick = () => {
        const theme = btn.dataset.theme;
        document.documentElement.dataset.theme = theme;
        const p = this._getProfile();
        p.theme = theme;
        this._saveProfile(p);
        updateThemeUI(theme);
      };
    });

    /* Eventos de Metas (Fase 2) */
    const rangeWeight = this.querySelector('#goal-weight-range');
    const labelWeight = this.querySelector('#goal-weight-label');
    const profile     = this._getProfile();
    
    if (rangeWeight) {
      rangeWeight.value = profile.goalWeight || 75;
      labelWeight.textContent = `${rangeWeight.value} ${getWeightUnit()}`;
      rangeWeight.oninput = (e) => {
        labelWeight.textContent = `${e.target.value} ${getWeightUnit()}`;
      };
      rangeWeight.onchange = (e) => {
        const p = this._getProfile();
        p.goalWeight = parseFloat(e.target.value);
        this._saveProfile(p);
      };
    }

    const freqBtns = this.querySelectorAll('.btn-goal-freq');
    const labelFreq = this.querySelector('#goal-freq-label');
    const currentFreq = profile.weeklyGoal || 4;
    labelFreq.textContent = `${currentFreq} dias`;
    
    freqBtns.forEach(btn => {
      if (parseInt(btn.dataset.val) === currentFreq) btn.classList.replace('btn-ghost','btn-primary');
      btn.onclick = () => {
        const val = parseInt(btn.dataset.val);
        const p = this._getProfile();
        p.weeklyGoal = val;
        this._saveProfile(p);
        labelFreq.textContent = `${val} dias`;
        freqBtns.forEach(b => b.classList.replace('btn-primary','btn-ghost'));
        btn.classList.replace('btn-ghost','btn-primary');
      };
    });

    // Cargar datos asíncronos de Fase 2
    this._loadPhase2Data();

    // Cargar historial al montar
    this._loadBwHistory();
  }

  async _loadPhase2Data() {
    try {
      const sessions = await GymDB.sessions.getAll();
      this._renderHeatmap(sessions);
      this._renderPRs(sessions);
    } catch (err) { console.error('Error Phase 2 data:', err); }
  }

  _renderHeatmap(sessions) {
    const container = this.querySelector('#activity-heatmap');
    const streakContainer = this.querySelector('#streak-stats');
    if (!container) return;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear  = today.getFullYear();
    
    // Obtener primer dia del mes y total de dias
    const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0=Dom
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Ajustar primer dia (queremos que empiece en Lunes=0)
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    const trainedDates = new Set(sessions.map(s => {
      const d = new Date(s.date);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    }));

    const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

    let html = `
      <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border); border-radius:16px; padding:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <h4 style="font-size:16px; font-weight:800; color:#FFF;">${monthNames[currentMonth]} ${currentYear}</h4>
          <div style="display:flex; gap:8px; align-items:center;">
            <div style="width:10px; height:10px; border-radius:50%; background:var(--success);"></div>
            <span style="font-size:11px; color:var(--text-muted); font-weight:700; text-transform:uppercase;">Entrenado</span>
          </div>
        </div>
        
        <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:8px; text-align:center;">
          ${['L','M','X','J','V','S','D'].map(day => `<span style="font-size:10px; font-weight:800; color:var(--text-muted); padding-bottom:10px;">${day}</span>`).join('')}
          
          ${Array(startOffset).fill(0).map(() => `<div></div>`).join('')}
          
          ${Array.from({ length: daysInMonth }, (_, i) => {
            const dayNum = i + 1;
            const dateKey = `${currentYear}-${currentMonth}-${dayNum}`;
            const isTrained = trainedDates.has(dateKey);
            const isToday = dayNum === today.getDate();
            
            return `
              <div style="aspect-ratio:1/1; display:flex; align-items:center; justify-content:center; position:relative; cursor:default;">
                <div style="
                  width:34px; height:34px; border-radius:10px; 
                  display:flex; align-items:center; justify-content:center;
                  font-size:13px; font-weight:700;
                  background: ${isTrained ? 'var(--success)' : isToday ? 'rgba(255,255,255,0.08)' : 'transparent'};
                  color: ${isTrained ? '#000' : isToday ? 'var(--accent-light)' : '#64748b'};
                  border: ${isToday && !isTrained ? '1px solid var(--accent-light)' : '1px solid rgba(255,255,255,0.03)'};
                  transition: all 0.2s;
                ">
                  ${dayNum}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    
    container.innerHTML = html;

    // Stats de racha
    const streak = this._calculateStreak(sessions);
    streakContainer.innerHTML = `
      <div style="padding:20px; background:var(--success)10; border:1px solid var(--success)33; border-radius:16px; text-align:center;">
        <p style="font-size:32px; font-weight:900; color:var(--success); line-height:1;">${streak}</p>
        <p style="font-size:11px; color:var(--text-muted); text-transform:uppercase; font-weight:800; margin-top:6px; letter-spacing:0.05em;">Racha Actual</p>
      </div>
      <div style="padding:20px; background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:16px; text-align:center;">
        <p style="font-size:32px; font-weight:900; color:#FFF; line-height:1;">${sessions.length}</p>
        <p style="font-size:11px; color:var(--text-muted); text-transform:uppercase; font-weight:800; margin-top:6px; letter-spacing:0.05em;">Sesiones Totales</p>
      </div>
    `;
  }

  _calculateStreak(sessions) {
    if (!sessions.length) return 0;
    const dates = [...new Set(sessions.map(s => new Date(s.date).toDateString()))]
      .sort((a,b) => new Date(b) - new Date(a));
    
    let streak = 0;
    let check = new Date();
    check.setHours(0,0,0,0);

    for (let d of dates) {
      const day = new Date(d);
      const diff = (check - day) / (1000 * 60 * 60 * 24);
      if (diff <= 1) {
        streak++;
        check = day;
      } else break;
    }
    return streak;
  }

  async _renderPRs(sessions) {
    const container = this.querySelector('#personal-records-grid');
    if (!container) return;

    const prs = {
      weight: 0,
      vol: 0,
      oneRM: 0
    };

    sessions.forEach(s => {
      if (!s.logs) return;
      s.logs.forEach(log => {
        const vol = (log.sets || []).reduce((a, st) => a + (st.weight * st.reps), 0);
        if (vol > prs.vol) prs.vol = vol;
        
        (log.sets || []).forEach(st => {
          if (st.weight > prs.weight) prs.weight = st.weight;
          const erm = st.weight * (1 + (st.reps / 30)); // Formula Brzycki
          if (erm > prs.oneRM) prs.oneRM = Math.round(erm);
        });
      });
    });

    const unit = getWeightUnit();
    container.innerHTML = `
      ${this._prCard('Peso Record', `${prs.weight} ${unit}`, 'ph-barbell', '#f97316')}
      ${this._prCard('Mejor 1RM', `~${prs.oneRM} ${unit}`, 'ph-fire', 'var(--accent-light)')}
      ${this._prCard('Vol. Sesion', `${prs.vol} ${unit}`, 'ph-chart-line-up', 'var(--success-light)')}
    `;
  }

  _prCard(label, val, icon, color) {
    return `
      <div style="padding:16px; background:rgba(255,255,255,0.02); border:1px solid var(--border); border-radius:12px;">
        <i class="ph-bold ${icon}" style="color:${color}; font-size:16px; margin-bottom:8px;"></i>
        <p style="font-size:18px; font-weight:900; color:#FFF;">${val}</p>
        <p style="font-size:10px; color:var(--text-muted); text-transform:uppercase; margin-top:2px;">${label}</p>
      </div>
    `;
  }

  async _loadBwHistory() {
    const wrap = this.querySelector('#bw-history-wrap');
    if (!wrap) return;

    try {
      const records = await GymDB.bodyweight.getLastDays(30);
      if (records.length === 0) {
        wrap.innerHTML = `<p style="font-size:12px; color:var(--text-muted); font-style:italic;">Aun no tienes registros. Empieza hoy!</p>`;
        return;
      }

      const unit = getWeightUnit();
      const weights = records.map(r => r.weight);
      const minW = Math.min(...weights) - 1;
      const maxW = Math.max(...weights) + 1;
      const range = maxW - minW || 1;
      const latest = records[records.length - 1];
      const first  = records[0];
      const diff   = (latest.weight - first.weight).toFixed(1);
      const diffColor = diff > 0 ? '#f97316' : diff < 0 ? '#10b981' : 'var(--text-muted)';
      const diffLabel = diff > 0 ? `+${diff}` : `${diff}`;

      // Mini resumen
      const summaryHTML = `
        <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:16px;">
          <div style="flex:1; min-width:80px; text-align:center; padding:12px; background:rgba(255,255,255,0.02); border-radius:10px; border:1px solid var(--border);">
            <p style="font-size:20px; font-weight:800; color:#FFF;">${latest.weight}</p>
            <p style="font-size:10px; color:var(--text-muted); margin-top:2px;">${unit} — Hoy</p>
          </div>
          <div style="flex:1; min-width:80px; text-align:center; padding:12px; background:rgba(255,255,255,0.02); border-radius:10px; border:1px solid var(--border);">
            <p style="font-size:20px; font-weight:800; color:#FFF;">${Math.min(...weights).toFixed(1)}</p>
            <p style="font-size:10px; color:var(--text-muted); margin-top:2px;">${unit} — Mínimo</p>
          </div>
          <div style="flex:1; min-width:80px; text-align:center; padding:12px; background:rgba(255,255,255,0.02); border-radius:10px; border:1px solid var(--border);">
            <p style="font-size:20px; font-weight:800; color:${diffColor};">${diffLabel}</p>
            <p style="font-size:10px; color:var(--text-muted); margin-top:2px;">${unit} — Cambio</p>
          </div>
        </div>
      `;

      // Gráfica solo si hay suficientes datos para mostrar evolución
      let chartHTML = '';
      if (records.length >= 3) {
        const n     = records.length;
        const W     = 480, H = 100, padL = 8, padR = 8, padT = 8, padB = 24;
        const bW    = Math.max(4, Math.floor((W - padL - padR) / n) - 2);
        const gap   = Math.floor((W - padL - padR - bW * n) / Math.max(n - 1, 1));

        const bars = records.map((r, i) => {
          const x = padL + i * (bW + gap);
          const bH = ((r.weight - minW) / range) * (H - padT - padB);
          const y  = H - padB - bH;
          const isLast = i === n - 1;
          return `
            <rect x="${x}" y="${y.toFixed(1)}" width="${bW}" height="${Math.max(bH, 2).toFixed(1)}"
              fill="${isLast ? '#2563EB' : '#2563EB55'}" rx="2"/>
            ${i % Math.max(1, Math.floor(n / 5)) === 0 || isLast ? `
              <text x="${x + bW/2}" y="${H - 4}" text-anchor="middle" fill="rgba(255,255,255,0.3)"
                font-size="8" font-family="Inter,sans-serif">${r.date.slice(5)}</text>
            ` : ''}
            ${isLast ? `
              <text x="${x + bW/2}" y="${y - 4}" text-anchor="middle" fill="#fff"
                font-size="9" font-weight="700" font-family="Inter,sans-serif">${r.weight}</text>
            ` : ''}
          `;
        }).join('');

        chartHTML = `
          <div style="background:rgba(0,0,0,0.2); border-radius:10px; padding:12px; border:1px solid var(--border); overflow-x:auto; margin-bottom:24px;">
            <p style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:8px;">Evolución de peso — últimos ${n} registros</p>
            <svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              ${bars}
            </svg>
          </div>
        `;
      } else {
        const remaining = 3 - records.length;
        chartHTML = `
          <div style="background:rgba(0,0,0,0.15); border-radius:10px; padding:16px; border:1px dashed rgba(255,255,255,0.07); margin-bottom:24px; text-align:center;">
            <i class="ph-bold ph-chart-bar" style="font-size:24px; color:var(--text-muted); opacity:0.4;"></i>
            <p style="font-size:12px; color:var(--text-muted); margin-top:8px;">Agrega ${remaining} registro${remaining > 1 ? 's' : ''} más para ver tu gráfica de evolución</p>
          </div>
        `;
      }

      // Lista Detallada de Registros
      const recordsListHTML = `
        <p style="font-size:11px; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:12px;">Registros Recientes</p>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${[...records].reverse().slice(0, 7).map(r => `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; background:rgba(255,255,255,0.02); border-radius:12px; border:1px solid var(--border-subtle);">
              <div>
                <p style="font-size:13px; font-weight:700; color:#FFF;">${formatDateLong(r.date)}</p>
                <p style="font-size:11px; color:var(--text-muted);">${r.weight} ${unit}</p>
              </div>
              <button class="btn btn-icon btn-ghost" style="color:var(--danger-light); width:32px; height:32px; border:none;" 
                onclick="this.closest('profile-view')._deleteWeight('${r.id}')" title="Eliminar registro">
                <i class="ph-bold ph-trash-simple" style="font-size:16px;"></i>
              </button>
            </div>
          `).join('')}
        </div>
        ${records.length > 7 ? `<p style="font-size:11px; color:var(--text-muted); text-align:center; margin-top:12px; font-style:italic;">Mostrando los últimos 7 registros</p>` : ''}
      `;

      wrap.innerHTML = summaryHTML + chartHTML + recordsListHTML;

    } catch (err) {
      console.error('Error loading bw history:', err);
      wrap.innerHTML = `<p style="font-size:12px; color:var(--text-muted);">Error al cargar el historial.</p>`;
    }
  }

  async _deleteWeight(id) {
    if (!confirm('¿Eliminar este registro de peso?')) return;
    try {
      // Necesitamos acceder al metodo interno de eliminacion de GymDB
      await GymDB._delete('bodyweight', id);
      this._loadBwHistory();
    } catch (err) {
      console.error('Error al eliminar peso:', err);
      alert('Error: ' + err.message);
    }
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
