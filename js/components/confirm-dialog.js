/**
 * ============================================================
 *  <confirm-dialog> — Modal de confirmacion reutilizable
 *
 *  Muestra un modal de advertencia para acciones destructivas (eliminar).
 *  Devuelve una Promise que se resuelve en true (confirmado) o
 *  false (cancelado).
 *
 *  Uso:
 *    const dialog = document.createElement('confirm-dialog');
 *    const confirmed = await dialog.show({
 *      title: 'Eliminar ejercicio?',
 *      message: 'Esta accion no se puede deshacer.',
 *      impact: 'Este ejercicio se usa en 2 rutinas.',
 *      confirmText: 'Si, eliminar'
 *    });
 * ============================================================
 */

class ConfirmDialog extends HTMLElement {
  constructor() {
    super();
    this._resolvePromise = null;
    this._initialized = false;
  }

  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    // Construye el DOM del modal
    this.innerHTML = `
      <div class="modal-overlay" id="confirm-overlay">
        <div class="modal-box" style="max-width:420px;">
          <div class="modal-header">
            <h3 class="modal-title" id="confirm-title">Estas seguro?</h3>
            <button class="modal-close" id="confirm-close-x">&times;</button>
          </div>
          <div class="modal-body">
            <p id="confirm-message" style="color:var(--text-secondary); line-height:1.6; font-size:14px;"></p>
            <div id="confirm-impact" style="display:none;"></div>
          </div>
          <div class="modal-footer" style="display:flex; gap:12px;">
            <button class="btn btn-ghost" id="confirm-cancel" style="flex:1;">Cancelar</button>
            <button class="btn btn-danger" id="confirm-ok" style="flex:1;">
              <i class="ph-bold ph-trash"></i> Eliminar
            </button>
          </div>
        </div>
      </div>
    `;

    // Manejadores de cierre
    this.querySelector('#confirm-cancel').addEventListener('click', () => this._finish(false));
    this.querySelector('#confirm-close-x').addEventListener('click', () => this._finish(false));
    this.querySelector('#confirm-ok').addEventListener('click', () => this._finish(true));
    this.querySelector('#confirm-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'confirm-overlay') this._finish(false);
    });

    // Aplica la configuracion pendiente si show() se llamo antes de montar
    if (this._pendingConfig) {
      this._applyConfig(this._pendingConfig);
      this._pendingConfig = null;
    }
  }

  // ════════════════════════════════════════════
  //  API PUBLICA
  // ════════════════════════════════════════════

  /**
   * Muestra el dialogo y devuelve una promise.
   * @param {Object} options
   * @param {string} options.title       — Titulo del modal
   * @param {string} options.message     — Texto descriptivo
   * @param {string} [options.impact]    — Advertencia opcional (ej: impacto en rutinas)
   * @param {string} [options.confirmText] — Texto personalizado del boton
   * @returns {Promise<boolean>} true si confirmado, false si cancelado
   */
  show({ title, message, impact, confirmText } = {}) {
    this._pendingConfig = { title, message, impact, confirmText };

    // Monta en el DOM (esto dispara connectedCallback)
    document.body.appendChild(this);

    return new Promise(resolve => {
      this._resolvePromise = resolve;
    });
  }

  /** Aplica la configuracion del dialogo a los elementos del DOM */
  _applyConfig({ title, message, impact, confirmText }) {
    if (title)   this.querySelector('#confirm-title').textContent = title;
    if (message) this.querySelector('#confirm-message').textContent = message;

    // Muestra la caja de advertencia de impacto si se proporciona
    if (impact) {
      const impactEl = this.querySelector('#confirm-impact');
      impactEl.style.display = 'block';
      impactEl.innerHTML = `
        <div style="background:rgba(220,38,38,0.08); border:1px solid rgba(220,38,38,0.2);
                    border-radius:var(--radius-sm); padding:12px; margin-top:8px;">
          <p style="color:var(--danger-light); font-size:13px; display:flex; align-items:start; gap:8px; line-height:1.5;">
            <i class="ph-bold ph-warning" style="flex-shrink:0; margin-top:2px;"></i>
            ${impact}
          </p>
        </div>
      `;
    }

    if (confirmText) {
      this.querySelector('#confirm-ok').innerHTML =
        `<i class="ph-bold ph-trash"></i> ${confirmText}`;
    }
  }

  // ════════════════════════════════════════════
  //  METODOS INTERNOS
  // ════════════════════════════════════════════

  /**
   * Resuelve la promise y elimina el dialogo del DOM.
   * @param {boolean} result
   */
  _finish(result) {
    if (this._resolvePromise) {
      this._resolvePromise(result);
      this._resolvePromise = null;
    }
    this.remove();
  }
}

// Registro del Custom Element
customElements.define('confirm-dialog', ConfirmDialog);
