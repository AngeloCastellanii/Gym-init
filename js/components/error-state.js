/**
 * ============================================================
 *  <error-state> — Pantalla de error reutilizable
 *
 *  Muestra un icono de error, mensaje y boton de reintento.
 *  Usado en las vistas cuando las operaciones de IndexedDB fallan.
 *
 *  Uso:
 *    const err = document.createElement('error-state');
 *    err.setMessage('No se pudieron cargar los datos.');
 *    container.appendChild(err);
 * ============================================================
 */

class ErrorState extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
  }

  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    // Construye el DOM con mensaje de error por defecto
    this.innerHTML = `
      <div class="error-state">
        <i class="ph-bold ph-warning-circle error-state-icon"></i>
        <p class="error-message">Ocurrio un error inesperado</p>
        <button class="btn btn-ghost error-retry-btn">
          <i class="ph-bold ph-arrow-counter-clockwise"></i>
          Reintentar
        </button>
      </div>
    `;

    // El boton de reintento recarga la pagina
    this.querySelector('.error-retry-btn').addEventListener('click', () => {
      location.reload();
    });
  }

  /**
   * Actualiza el texto del mensaje de error.
   * @param {string} message
   */
  setMessage(message) {
    const p = this.querySelector('.error-message');
    if (p) p.textContent = message;
  }
}

// Registro del Custom Element
customElements.define('error-state', ErrorState);
