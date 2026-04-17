/**
 * ============================================================
 *  Funciones Globales de Ayuda (Utils) — Version Completa
 * ============================================================
 */

// --- Grupos Musculares exactos (coinciden con el seed) ---
const DEFAULT_MUSCLES = [
  'Pectorales',
  'Dorsales',
  'Deltoides (Hombros)',
  'B\u00edceps',
  'Tr\u00edceps',
  'Cu\u00e1driceps',
  'Isquiotibiales (Femorales)',
  'Gl\u00fateos',
  'Pantorrillas (Gemelos)',
  'Abdominales',
  'Lumbares',
  'Trapecios',
  'Antebrazos'
];

function getCustomMuscles() {
  try { return JSON.parse(localStorage.getItem('gym-custom-muscles') || '[]'); } 
  catch { return []; }
}

function addCustomMuscle(name) {
  if (!name || !name.trim()) return;
  const custom = getCustomMuscles();
  const clean = name.trim();
  if (!custom.includes(clean) && !DEFAULT_MUSCLES.includes(clean)) {
    custom.push(clean);
    localStorage.setItem('gym-custom-muscles', JSON.stringify(custom));
  }
}

function removeCustomMuscle(name) {
  const custom = getCustomMuscles().filter(m => m !== name);
  localStorage.setItem('gym-custom-muscles', JSON.stringify(custom));
}

// Lista completa (defaults + personalizados)
Object.defineProperty(window, 'MUSCLE_GROUPS', {
  get: () => [...DEFAULT_MUSCLES, ...getCustomMuscles()],
  configurable: true
});

// Agrupaciones por region corporal (para filtros de UI)
const MUSCLE_CATEGORIES = {
  'Pecho':    ['Pectorales'],
  'Espalda':  ['Dorsales', 'Lumbares', 'Trapecios'],
  'Hombros':  ['Deltoides (Hombros)'],
  'Brazos':   ['B\u00edceps', 'Tr\u00edceps', 'Antebrazos'],
  'Pierna':   ['Cu\u00e1driceps', 'Isquiotibiales (Femorales)', 'Gl\u00fateos', 'Pantorrillas (Gemelos)'],
  'Core':     ['Abdominales', 'Lumbares']
};

function getMuscleCategories(muscleGroup) {
  return Object.entries(MUSCLE_CATEGORIES)
    .filter(([, muscles]) => muscles.includes(muscleGroup))
    .map(([cat]) => cat);
}

// --- Herramientas de Interfaz (UI Helpers) ---
/** Retorna valor fallback si el dato es nulo */
function fallback(val, def = '') {
  return (val === undefined || val === null || val === '') ? def : val;
}

/** Genera el HTML de un Badge con color segun musculo */
function muscleBadge(muscle) {
  const color = getMuscleColor(muscle);
  return `
    <span class="badge" style="color:${color}; border-color:${color}33; background:${color}1a;">
      ${muscle}
    </span>
  `;
}

// --- Gestion de Unidades de Peso ---
let currentUnit = localStorage.getItem('gym-unit') || 'kg';

function getWeightUnit() { return currentUnit; }
function setWeightUnit(unit) {
  currentUnit = unit;
  localStorage.setItem('gym-unit', unit);
}
function unitLabel() { return currentUnit === 'kg' ? 'Kg' : 'Lb'; }

function displayWeight(val) {
  if (currentUnit === 'lb') {
    return Math.round(val * 2.20462);
  }
  return Math.round(val);
}

// --- Calculos de Entrenamiento ---
function calcTotalVolume(logs) {
  if (!logs) return 0;
  return logs.reduce((total, exLog) => {
    const exVolume = exLog.sets.reduce((setSum, s) => {
      if (s.done) return setSum + (Number(s.weight) * Number(s.reps));
      return setSum;
    }, 0);
    return total + exVolume;
  }, 0);
}

// --- Formateo de Datos ---
function formatDate(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/** Formatea fecha YYYY-MM-DD a "Viernes, 17 de Abr" o similar */
function formatDateLong(dateStr) {
  const date = new Date(dateStr + 'T00:00:00'); // Forzar hora local
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  const formatted = date.toLocaleDateString('es-ES', options);
  // Capitalizar primera letra
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/** Formatea duracion en ms a HH:MM:SS o MM:SS */
function formatDuration(ms) {
  if (!ms || ms < 0) return '00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  
  const p = (n) => String(n).padStart(2, '0');
  if (hrs > 0) return `${p(hrs)}:${p(mins)}:${p(secs)}`;
  return `${p(mins)}:${p(secs)}`;
}

// --- Colores por Musculo ---
function getMuscleColor(muscle) {
  const colors = {
    'Pecho': '#3b82f6',
    'Espalda': '#10b981',
    'Piernas': '#f59e0b',
    'Hombros': '#8b5cf6',
    'Biceps': '#ec4899',
    'Triceps': '#6366f1',
    'Core': '#14b8a6',
    'Cardio': '#f43f5e'
  };
  return colors[muscle] || '#94a3b8';
}

// --- Imagenes ---
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}
