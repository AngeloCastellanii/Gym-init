/**
 * ============================================================
 *  Funciones Globales de Ayuda (Utils) — Version Completa
 * ============================================================
 */

// --- Grupos Musculares (Dinamicos + Personalizados) ---
const DEFAULT_MUSCLES = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Biceps', 'Triceps', 'Core', 'Cardio'];

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

function formatDuration(ms) {
  if (!ms) return '00:00';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  const ss = s % 60;
  
  if (hh > 0) {
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  }
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
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
