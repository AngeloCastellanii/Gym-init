/**
 *  Utils.js — Funciones utilitarias globales para Gym Init
 *  Formato, conversion de unidades, helpers de fecha y
 *  calculos matematicos usados en todas las vistas.


//  CONVERSION DE UNIDADES (Kg <-> Lb)


const KG_TO_LB = 2.20462;

/**
 * Obtiene la unidad de peso actual desde LocalStorage.
 * @returns {'kg'|'lb'}
 */
function getWeightUnit() {
  return localStorage.getItem('gym-init-unit') || 'kg';
}

/**
 * Guarda la unidad de peso en LocalStorage.
 * @param {'kg'|'lb'} unit
 */
function setWeightUnit(unit) {
  localStorage.setItem('gym-init-unit', unit);
}

/**
 * Convierte un valor de peso a la unidad actualmente seleccionada.
 * Los valores se almacenan internamente en Kg; esto convierte para mostrar.
 * @param {number} kg - Peso en kilogramos
 * @returns {number} Valor convertido (redondeado a 1 decimal)
 */
function displayWeight(kg) {
  if (getWeightUnit() === 'lb') {
    return Math.round(kg * KG_TO_LB * 10) / 10;
  }
  return Math.round(kg * 10) / 10;
}

/**
 * Obtiene la etiqueta de unidad para mostrar en pantalla.
 * @returns {string} 'Kg' o 'Lb'
 */
function unitLabel() {
  return getWeightUnit() === 'lb' ? 'Lb' : 'Kg';
}

// ──────────────────────────────────────────────
//  FORMATO DE FECHAS
// ──────────────────────────────────────────────

const DAY_NAMES_SHORT = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Formatea una fecha a cadena amigable: "Mie 24 Abril, 14:30"
 * @param {Date|string|number} date
 * @returns {string}
 */
function formatDate(date) {
  const d = new Date(date);
  const day = DAY_NAMES_SHORT[d.getDay()];
  const num = d.getDate();
  const month = MONTH_NAMES[d.getMonth()];
  const hours = String(d.getHours()).padStart(2, '0');
  const mins  = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${num} ${month}, ${hours}:${mins}`;
}

/**
 * Formatea una fecha en forma corta: "24 Abr"
 * @param {Date|string|number} date
 * @returns {string}
 */
function formatDateShort(date) {
  const d = new Date(date);
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)}`;
}

/**
 * Obtiene el dia de la semana y numero de dia para vista de calendario.
 * @param {Date|string|number} date
 * @returns {{ dayName: string, dayNum: number }}
 */
function getCalendarDay(date) {
  const d = new Date(date);
  return {
    dayName: DAY_NAMES_SHORT[d.getDay()],
    dayNum: d.getDate()
  };
}

// ──────────────────────────────────────────────
//  FORMATO DE DURACION
// ──────────────────────────────────────────────

/**
 * Formatea milisegundos a cadena MM:SS o HH:MM:SS.
 * @param {number} ms - Duracion en milisegundos
 * @returns {string}
 */
function formatDuration(ms) {
  const totalSec = Math.floor(ms / 1000);
  const hrs  = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  if (hrs > 0) {
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// ──────────────────────────────────────────────
//  CALCULO DE VOLUMEN
// ──────────────────────────────────────────────

/**
 * Calcula el volumen total de los registros de una sesion.
 * Volumen = Suma de (peso x reps) de cada serie completada.
 * @param {Array} logs - Array de logs de sesion
 * @returns {number} Volumen total en Kg
 */
function calcTotalVolume(logs) {
  let total = 0;
  for (const log of logs) {
    for (const set of (log.sets || [])) {
      if (set.done) {
        total += (set.weight || 0) * (set.reps || 0);
      }
    }
  }
  return total;
}

// ──────────────────────────────────────────────
//  HELPERS GENERALES
// ──────────────────────────────────────────────

/**
 * Genera un ID unico corto (para registros en IndexedDB).
 * @returns {string}
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/**
 * Devuelve un valor de respaldo cuando el valor esta vacio/null/undefined.
 * @param {*} value
 * @param {string} fb - Valor de respaldo
 * @returns {string}
 */
function fallback(value, fb = 'Sin descripcion') {
  if (value === null || value === undefined || String(value).trim() === '') {
    return fb;
  }
  return value;
}

// ──────────────────────────────────────────────
//  COLORES E ICONOS POR GRUPO MUSCULAR
// ──────────────────────────────────────────────

/** Mapa de colores por grupo muscular (para badges y acentos) */
const MUSCLE_COLORS = {
  'Pecho':    '#f87171',
  'Espalda':  '#60a5fa',
  'Piernas':  '#34d399',
  'Hombros':  '#fbbf24',
  'Biceps':   '#a78bfa',
  'Triceps':  '#f472b6',
  'Core':     '#fb923c',
  'Otro':     '#94a3b8'
};

/**
 * Obtiene el color de acento para un grupo muscular.
 * @param {string} muscleGroup
 * @returns {string} Color en hex
 */
function getMuscleColor(muscleGroup) {
  return MUSCLE_COLORS[muscleGroup] || '#94a3b8';
}

/**
 * Genera el HTML de un badge para un grupo muscular.
 * @param {string} muscleGroup
 * @returns {string} Cadena HTML
 */
function muscleBadge(muscleGroup) {
  const color = getMuscleColor(muscleGroup);
  return `<span class="badge" style="
    color:${color};
    border-color:${color}33;
    background:${color}1a;
  ">${muscleGroup.toUpperCase()}</span>`;
}

// ──────────────────────────────────────────────
//  HELPERS DE ARCHIVOS E IMAGENES
// ──────────────────────────────────────────────

/**
 * Convierte un objeto File a cadena base64 (data URL).
 * Usado para guardar imagenes de ejercicios en IndexedDB.
 * @param {File} file
 * @returns {Promise<string>} data URL en base64
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Todos los grupos musculares disponibles para los selectores */
const MUSCLE_GROUPS = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Biceps', 'Triceps', 'Core', 'Otro'];
