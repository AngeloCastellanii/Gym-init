/**
 * ============================================================
 *  db.js — Wrapper de IndexedDB para Gym Init
 * ============================================================
 */

const DB_NAME = 'GymInitDB';
const DB_VERSION = 1;

const GymDB = {
  _db: null,

  async init() {
    if (this._db) return this._db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('exercises')) {
          const exStore = db.createObjectStore('exercises', { keyPath: 'id' });
          exStore.createIndex('muscleGroup', 'muscleGroup', { unique: false });
        }
        if (!db.objectStoreNames.contains('routines')) {
          db.createObjectStore('routines', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sessions')) {
          const ssStore = db.createObjectStore('sessions', { keyPath: 'id' });
          ssStore.createIndex('date', 'date', { unique: false });
        }
      };

      request.onsuccess = async (event) => {
        this._db = event.target.result;
        try {
          const tx = this._db.transaction('exercises', 'readonly');
          const store = tx.objectStore('exercises');
          const countReq = store.count();
          countReq.onsuccess = async () => {
            if (countReq.result === 0) await this._seedAll();
          };
        } catch (err) { console.error('Error seeding:', err); }
        resolve(this._db);
      };

      request.onerror = (e) => reject(e.target.error);
    });
  },

  _getAll(storeName) {
    return new Promise((resolve, reject) => {
      const tx = this._db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  _getById(storeName, id) {
    return new Promise((resolve, reject) => {
      const tx = this._db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  _put(storeName, data) {
    return new Promise((resolve, reject) => {
      const tx = this._db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(data);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  exercises: {
    async getAll() { return GymDB._getAll('exercises'); },
    async getById(id) { return GymDB._getById('exercises', id); },
    async add(data) {
      const ex = { id: generateId(), ...data };
      await GymDB._put('exercises', ex);
      return ex.id;
    }
  },

  routines: {
    async getAll() { return GymDB._getAll('routines'); },
    async getById(id) { return GymDB._getById('routines', id); },
    async getWithExercises(id) {
      const routine = await this.getById(id);
      if (!routine) return null;
      const populated = [];
      for (const entry of (routine.exercises || [])) {
        const ex = await GymDB.exercises.getById(entry.exerciseId);
        populated.push({ ...entry, exercise: ex });
      }
      return { ...routine, exercises: populated };
    },
    async add(data) {
      const rt = { id: generateId(), createdAt: new Date().toISOString(), ...data };
      await GymDB._put('routines', rt);
      return rt.id;
    }
  },

  sessions: {
    async getAll() {
      const all = await GymDB._getAll('sessions');
      return all.sort((a,b) => new Date(b.date) - new Date(a.date));
    },
    async add(data) {
      const ss = { id: generateId(), date: new Date().toISOString(), ...data };
      await GymDB._put('sessions', ss);
      return ss.id;
    }
  },

  async _seedAll() {
    const exercises = [
      { id: 'ex_bench', name: 'Press de Banca', muscleGroup: 'Pecho', type: 'Peso Libre', description: 'Pecho' },
      { id: 'ex_squat', name: 'Sentadilla', muscleGroup: 'Piernas', type: 'Peso Libre', description: 'Cuadriceps' }
    ];
    for (const ex of exercises) await this._put('exercises', ex);
    
    const routines = [
      { id: 'rt_full', name: 'Full Body', description: 'Cuerpo completo', exercises: [
        { exerciseId: 'ex_bench', sets: 3, reps: 10 },
        { exerciseId: 'ex_squat', sets: 3, reps: 10 }
      ]}
    ];
    for (const rt of routines) await this._put('routines', rt);
  }
};
