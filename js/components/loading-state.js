/**
 * 
 *  <loading-state>” Indicador de carga reutilizable
 *
 *  Muestra un spinner giratario con un mensaje personalizable.
 *  Usado en todas las vistas mientras se cargan datos de IndexedDB.
 *
 *  Uso:
 *    const loader = document.createElement('loading-state');
 *    loader.setMessage('Cargando ejercicios...');
 *    container.appendChild(loader);
 * 
 */

class LoadingState extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
  }

  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    // Construye el DOM con mensaje por defecto
    this.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p class="loading-message">Cargando...</p>
      </div>
    `;
  }

  /**
   * Actualiza el texto del mensaje de carga.
   * @param {string} message
   */
  setMessage(message) {
    const p = this.querySelector('.loading-message');
    if (p) p.textContent = message;
  }
}

// Registro del Custom Element
customElements.define('loading-state', LoadingState);
