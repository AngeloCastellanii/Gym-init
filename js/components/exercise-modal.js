/**
 * ============================================================
 *  <exercise-modal> — Modal para Crear / Editar Ejercicios
 *
 *  Formulario modal para agregar ejercicios nuevos o editar existentes.
 *  Campos: nombre, grupoMuscular, tipo, descripcion, imagen.
 *  Guarda en IndexedDB y notifica al padre via callback.
 *
 *  Uso:
 *    const modal = document.createElement('exercise-modal');
 *    modal.open(null, () => refreshList());       // Crear
 *    modal.open(exercise, () => refreshList());   // Editar
 * ============================================================
 */

class ExerciseModal extends HTMLElement {
  constructor() {
    super();

    /** @type {Object|null} Ejercicio siendo editado (null = modo crear) */
    this._exercise = null;
    /** @type {Function|null} Callback disparado tras guardar exitosamente */
    this._onSave = null;
    /** @type {string} Data URL base64 de la imagen */
    this._imageData = '';

    // Construye el DOM del modal
    this.innerHTML = `
      <div class="modal-overlay" id="ex-modal-overlay">
        <div class="modal-box">
          <div class="modal-header">
            <h3 class="modal-title" id="ex-modal-title">Nuevo Ejercicio</h3>
            <button class="modal-close" id="ex-modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <!-- Nombre -->
            <div class="form-group">
              <label class="form-label" for="ex-name">Nombre del Ejercicio</label>
              <input class="form-input" id="ex-name" placeholder="Ej: Press de Banca" required>
            </div>

            <!-- Grupo muscular + Tipo (lado a lado) -->
            <div style="display:flex; gap:12px;">
              <div class="form-group" style="flex:1;">
                <label class="form-label" for="ex-muscle">Grupo Muscular</label>
                <select class="form-select" id="ex-muscle">
                  ${MUSCLE_GROUPS.map(m => `<option value="${m}">${m}</option>`).join('')}
                </select>
              </div>
              <div class="form-group" style="flex:1;">
                <label class="form-label" for="ex-type">Tipo</label>
                <select class="form-select" id="ex-type">
                  <option value="Peso Libre">Peso Libre</option>
                  <option value="Maquina">Maquina</option>
                </select>
              </div>
            </div>

            <!-- Descripcion -->
            <div class="form-group">
              <label class="form-label" for="ex-desc">Descripcion (opcional)</label>
              <textarea class="form-textarea" id="ex-desc" placeholder="Instrucciones o notas sobre el ejercicio..."></textarea>
            </div>

            <!-- Subida de imagen -->
            <div class="form-group">
              <label class="form-label">Imagen (opcional)</label>
              <div id="ex-image-preview" class="ex-image-preview">
                <i class="ph-bold ph-image" style="font-size:32px; color:var(--text-muted);"></i>
                <p style="font-size:12px; color:var(--text-muted); margin-top:4px;">Sin imagen</p>
              </div>
              <input type="file" id="ex-image-input" accept="image/*" style="display:none;">
              <div style="display:flex; gap:8px;">
                <button class="btn btn-ghost" id="ex-image-btn" style="flex:1;" type="button">
                  <i class="ph-bold ph-camera"></i> Seleccionar Imagen
                </button>
                <button class="btn btn-ghost" id="ex-image-clear" style="display:none;" type="button">
                  <i class="ph-bold ph-x"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" id="ex-save" style="width:100%;">
              <i class="ph-bold ph-floppy-disk"></i> Guardar Ejercicio
            </button>
          </div>
        </div>
      </div>
    `;

    // Cierra el modal
    this.querySelector('#ex-modal-close').addEventListener('click', () => this._close());
    this.querySelector('#ex-modal-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'ex-modal-overlay') this._close();
    });

    // Subida de imagen
    this.querySelector('#ex-image-btn').addEventListener('click', () => {
      this.querySelector('#ex-image-input').click();
    });

    this.querySelector('#ex-image-input').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          this._imageData = await fileToBase64(file);
          this._updateImagePreview();
        } catch (err) {
          console.error('Error al cargar imagen:', err);
        }
      }
    });

    // Limpiar imagen
    this.querySelector('#ex-image-clear').addEventListener('click', () => {
      this._imageData = '';
      this._updateImagePreview();
    });

    // Guardar
    this.querySelector('#ex-save').addEventListener('click', () => this._save());
  }

  // ════════════════════════════════════════════
  //  API PUBLICA
  // ════════════════════════════════════════════

  /**
   * Abre el modal en modo crear o editar.
   * @param {Object|null} exercise — Ejercicio existente a editar, o null para nuevo
   * @param {Function} onSave — Callback tras guardar exitosamente
   */
  open(exercise = null, onSave = null) {
    this._exercise  = exercise;
    this._onSave    = onSave;
    this._imageData = '';

    if (exercise) {
      // Modo edicion: rellena los campos
      this.querySelector('#ex-modal-title').textContent = 'Editar Ejercicio';
      this.querySelector('#ex-name').value   = exercise.name || '';
      this.querySelector('#ex-muscle').value = exercise.muscleGroup || 'Pecho';
      this.querySelector('#ex-type').value   = exercise.type || 'Peso Libre';
      this.querySelector('#ex-desc').value   = exercise.description || '';
      this._imageData = exercise.image || '';
      this.querySelector('#ex-save').innerHTML =
        '<i class="ph-bold ph-floppy-disk"></i> Actualizar Ejercicio';
    } else {
      // Modo creacion: limpia los campos
      this.querySelector('#ex-modal-title').textContent = 'Nuevo Ejercicio';
      this.querySelector('#ex-name').value   = '';
      this.querySelector('#ex-muscle').value = 'Pecho';
      this.querySelector('#ex-type').value   = 'Peso Libre';
      this.querySelector('#ex-desc').value   = '';
    }

    this._updateImagePreview();
    document.body.appendChild(this);

    // Enfoca el campo de nombre automaticamente
    setTimeout(() => this.querySelector('#ex-name').focus(), 100);
  }

  // ════════════════════════════════════════════
  //  METODOS INTERNOS
  // ════════════════════════════════════════════

  /** Actualiza el area de vista previa de imagen */
  _updateImagePreview() {
    const preview  = this.querySelector('#ex-image-preview');
    const clearBtn = this.querySelector('#ex-image-clear');

    if (this._imageData) {
      preview.innerHTML = `<img src="${this._imageData}" alt="Vista previa"
        style="width:100%; height:100%; object-fit:cover; border-radius:var(--radius-sm);">`;
      clearBtn.style.display = 'flex';
    } else {
      preview.innerHTML = `
        <i class="ph-bold ph-image" style="font-size:32px; color:var(--text-muted);"></i>
        <p style="font-size:12px; color:var(--text-muted); margin-top:4px;">Sin imagen</p>
      `;
      clearBtn.style.display = 'none';
    }
  }

  /** Valida y guarda en IndexedDB */
  async _save() {
    const name        = this.querySelector('#ex-name').value.trim();
    const muscleGroup = this.querySelector('#ex-muscle').value;
    const type        = this.querySelector('#ex-type').value;
    const description = this.querySelector('#ex-desc').value.trim();

    // Validacion
    if (!name) {
      this.querySelector('#ex-name').style.borderColor = 'var(--danger)';
      this.querySelector('#ex-name').focus();
      return;
    }

    // Construye el objeto ejercicio
    const data = { name, muscleGroup, type, description, image: this._imageData };

    try {
      if (this._exercise) {
        // Actualiza existente
        data.id = this._exercise.id;
        await GymDB.exercises.update(data);
      } else {
        // Crea nuevo
        await GymDB.exercises.add(data);
      }

      // Notifica al padre y cierra
      if (this._onSave) this._onSave();
      this._close();
    } catch (err) {
      console.error('Error al guardar ejercicio:', err);
      alert('Error al guardar: ' + err.message);
    }
  }

  /** Elimina el modal del DOM */
  _close() {
    this.remove();
  }
}

// Registro del Custom Element
customElements.define('exercise-modal', ExerciseModal);
