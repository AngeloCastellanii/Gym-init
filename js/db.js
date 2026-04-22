/**
 * 
 *  GymDB — Capa de Persistencia (IndexedDB)
 * 
 */

const DB_NAME = 'GymInitDB';
const DB_VERSION = 2; // v2: agrega store bodyweight

class GymDatabase {
  constructor() {
    this.db = null;
  }

  /** Inicializa la base de datos y crea los almacenes */
  init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;

        if (!db.objectStoreNames.contains('exercises')) {
          db.createObjectStore('exercises', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('routines')) {
          db.createObjectStore('routines', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', { keyPath: 'id' });
        }
        // NUEVO en v2: registro de peso corporal diario
        if (!db.objectStoreNames.contains('bodyweight')) {
          db.createObjectStore('bodyweight', { keyPath: 'id' });
        }
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };
      request.onerror = (e) => reject(e.target.error);
    });
  }

  // --- Helpers Genericos ---
  _getAll(storeName) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const request = tx.objectStore(storeName).getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  _get(storeName, id) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const request = tx.objectStore(storeName).get(isNaN(id) ? id : Number(id));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  _put(storeName, data) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const request = tx.objectStore(storeName).put(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  _delete(storeName, id) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const request = tx.objectStore(storeName).delete(isNaN(id) ? id : Number(id));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // --- API Publica ---
  exercises = {
    getAll: () => this._getAll('exercises'),
    get: (id) => this._get('exercises', id),
    add: (data) => {
      if (!data.id) data.id = 'ex_' + Date.now();
      return this._put('exercises', data);
    },
    update: (data) => this._put('exercises', data),
    delete: (id) => this._delete('exercises', id),
    findInRoutines: async (exerciseId) => {
      const routines = await this.routines.getAll();
      return routines.filter(r => r.exercises.some(e => e.exerciseId === exerciseId));
    }
  };

  routines = {
    getAll: () => this._getAll('routines'),
    get: (id) => this._get('routines', id),
    add: (data) => {
      if (!data.id) data.id = 'rt_' + Date.now();
      data.createdAt = new Date().toISOString();
      return this._put('routines', data);
    },
    update: (data) => this._put('routines', data),
    delete: (id) => this._delete('routines', id),
    getWithExercises: async (id) => {
      const routine = await this._get('routines', id);
      if (!routine) return null;
      const allEx = await this.exercises.getAll();
      routine.exercises = routine.exercises.map(re => ({
        ...re,
        exercise: allEx.find(ex => ex.id === re.exerciseId)
      }));
      return routine;
    }
  };

  sessions = {
    getAll: () => this._getAll('sessions'),
    get: (id) => this._get('sessions', id),
    add: (data) => {
      if (!data.id) data.id = 'sess_' + Date.now();
      data.date = new Date().toISOString();
      return this._put('sessions', data);
    },
    delete: (id) => this._delete('sessions', id)
  };

  bodyweight = {
    getAll: () => this._getAll('bodyweight'),
    /** Un registro por día — upsert usando fecha como clave */
    logToday: (weight) => {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      return this._put('bodyweight', {
        id: 'bw_' + today,
        date: today,
        weight: parseFloat(weight)
      });
    },
    /** Últimos N días ordenados cronológicamente */
    getLastDays: async (days) => {
      const all = await this._getAll('bodyweight');
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      return all
        .filter(r => new Date(r.date) >= cutoff)
        .sort((a, b) => a.date.localeCompare(b.date));
    }
  };
}

const GymDB = new GymDatabase();
