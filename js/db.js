/**
 * ============================================================
 *  db.js — Wrapper de IndexedDB para Gym Init
 *
 *  Provee una API async limpia sobre IndexedDB para los tres
 *  almacenes de datos: exercises, routines y sessions.
 *
 *  Incluye logica de auto-semilla: cuando la DB se crea por
 *  primera vez, inyecta datos realistas (12 ejercicios,
 *  2 rutinas, 15 sesiones pasadas) para alimentar los graficos.
 *
 *  Stores:
 *    exercises → { id, name, muscleGroup, type, description, image }
 *    routines  → { id, name, description, exercises[], createdAt }
 *    sessions  → { id, date, routineId, duration, logs[] }
 * ============================================================
 */

// Configuracion de la base de datos
const DB_NAME = 'GymInitDB';
const DB_VERSION = 1;

/**
 * GymDB — Wrapper singleton para operaciones IndexedDB.
 *
 * Uso:
 *   await GymDB.init();
 *   const exercises = await GymDB.exercises.getAll();
 *   await GymDB.exercises.add({ name: 'Press de Banca', ... });
 */
const GymDB = {

  /** @type {IDBDatabase|null} Conexion abierta a la base de datos */
  _db: null,

  // ════════════════════════════════════════════
  //  INICIALIZACION
  // ════════════════════════════════════════════

  /**
   * Abre (o crea) la base de datos y ejecuta la semilla si es necesario.
   * Debe llamarse una sola vez antes de cualquier operacion CRUD.
   * @returns {Promise<IDBDatabase>}
   */
  async init() {
    if (this._db) return this._db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      // Creacion del esquema / migracion
      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store de ejercicios con indices para filtrado
        if (!db.objectStoreNames.contains('exercises')) {
          const exStore = db.createObjectStore('exercises', { keyPath: 'id' });
          exStore.createIndex('muscleGroup', 'muscleGroup', { unique: false });
          exStore.createIndex('type', 'type', { unique: false });
          exStore.createIndex('name', 'name', { unique: false });
        }

        // Store de rutinas
        if (!db.objectStoreNames.contains('routines')) {
          const rtStore = db.createObjectStore('routines', { keyPath: 'id' });
          rtStore.createIndex('name', 'name', { unique: false });
          rtStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Store de sesiones con indices para consultas
        if (!db.objectStoreNames.contains('sessions')) {
          const ssStore = db.createObjectStore('sessions', { keyPath: 'id' });
          ssStore.createIndex('date', 'date', { unique: false });
          ssStore.createIndex('routineId', 'routineId', { unique: false });
        }
      };

      request.onsuccess = async (event) => {
        this._db = event.target.result;

        // Verifica si la DB esta vacia (primer uso) → inserta datos semilla
        try {
          const count = await this._countStore('exercises');
          if (count === 0) {
            console.log('%c🌱 Sembrando base de datos...', 'color: #10b981; font-weight: bold;');
            await this._seedAll();
            console.log('%c✅ Semilla completada!', 'color: #10b981;');
          }
        } catch (err) {
          console.error('Error en semilla:', err);
        }

        resolve(this._db);
      };

      request.onerror = (event) => {
        console.error('Error al abrir IndexedDB:', event.target.error);
        reject(event.target.error);
      };
    });
  },

  // ════════════════════════════════════════════
  //  HELPERS CRUD GENERICOS
  // ════════════════════════════════════════════

  /**
   * Cuenta los registros en un store.
   * @param {string} storeName
   * @returns {Promise<number>}
   */
  _countStore(storeName) {
    return new Promise((resolve, reject) => {
      const tx = this._db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  /**
   * Obtiene todos los registros de un store.
   * @param {string} storeName
   * @returns {Promise<Array>}
   */
  _getAll(storeName) {
    return new Promise((resolve, reject) => {
      const tx = this._db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  /**
   * Obtiene un registro por ID.
   * @param {string} storeName
   * @param {string} id
   * @returns {Promise<Object|undefined>}
   */
  _getById(storeName, id) {
    return new Promise((resolve, reject) => {
      const tx = this._db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  /**
   * Agrega o actualiza un registro (put).
   * @param {string} storeName
   * @param {Object} data
   * @returns {Promise<string>} El ID del registro
   */
  _put(storeName, data) {
    return new Promise((resolve, reject) => {
      const tx = this._db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(data);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  /**
   * Elimina un registro por ID.
   * @param {string} storeName
   * @param {string} id
   * @returns {Promise<void>}
   */
  _delete(storeName, id) {
    return new Promise((resolve, reject) => {
      const tx = this._db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  /**
   * Obtiene registros por valor de indice.
   * @param {string} storeName
   * @param {string} indexName
   * @param {*} value
   * @returns {Promise<Array>}
   */
  _getByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
      const tx = this._db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const index = store.index(indexName);
      const req = index.getAll(value);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  // ════════════════════════════════════════════
  //  CRUD DE EJERCICIOS
  // ════════════════════════════════════════════

  exercises: {
    /** Obtiene todos los ejercicios */
    async getAll() { return GymDB._getAll('exercises'); },

    /** Obtiene un ejercicio por ID */
    async getById(id) { return GymDB._getById('exercises', id); },

    /** Obtiene ejercicios filtrados por grupo muscular */
    async getByMuscle(muscleGroup) {
      return GymDB._getByIndex('exercises', 'muscleGroup', muscleGroup);
    },

    /**
     * Agrega un nuevo ejercicio.
     * @param {Object} data — { name, muscleGroup, type, description, image }
     * @returns {Promise<string>} ID del ejercicio creado
     */
    async add(data) {
      const exercise = {
        id: generateId(),
        name: data.name || '',
        muscleGroup: data.muscleGroup || 'Otro',
        type: data.type || 'Peso Libre',
        description: data.description || '',
        image: data.image || '',
        ...data
      };
      if (!exercise.id) exercise.id = generateId();
      await GymDB._put('exercises', exercise);
      return exercise.id;
    },

    /**
     * Actualiza un ejercicio existente.
     * @param {Object} data — debe incluir id
     */
    async update(data) {
      if (!data.id) throw new Error('Se requiere el ID del ejercicio para actualizar');
      const existing = await GymDB._getById('exercises', data.id);
      if (!existing) throw new Error('Ejercicio no encontrado: ' + data.id);
      await GymDB._put('exercises', { ...existing, ...data });
    },

    /**
     * Elimina un ejercicio por ID.
     * @param {string} id
     */
    async delete(id) {
      await GymDB._delete('exercises', id);
    },

    /**
     * Verifica si un ejercicio esta en uso en alguna rutina.
     * @param {string} exerciseId
     * @returns {Promise<Array>} Rutinas que usan este ejercicio
     */
    async findInRoutines(exerciseId) {
      const routines = await GymDB._getAll('routines');
      return routines.filter(r =>
        r.exercises && r.exercises.some(e => e.exerciseId === exerciseId)
      );
    }
  },

  // ════════════════════════════════════════════
  //  CRUD DE RUTINAS
  // ════════════════════════════════════════════

  routines: {
    /** Obtiene todas las rutinas */
    async getAll() { return GymDB._getAll('routines'); },

    /** Obtiene una rutina por ID */
    async getById(id) { return GymDB._getById('routines', id); },

    /**
     * Agrega una nueva rutina.
     * @param {Object} data — { name, description, exercises[] }
     */
    async add(data) {
      const routine = {
        id: generateId(),
        name: data.name || '',
        description: data.description || '',
        exercises: data.exercises || [],
        createdAt: new Date().toISOString(),
        ...data
      };
      if (!routine.id) routine.id = generateId();
      await GymDB._put('routines', routine);
      return routine.id;
    },

    /** Actualiza una rutina */
    async update(data) {
      if (!data.id) throw new Error('Se requiere el ID de la rutina para actualizar');
      const existing = await GymDB._getById('routines', data.id);
      if (!existing) throw new Error('Rutina no encontrada: ' + data.id);
      await GymDB._put('routines', { ...existing, ...data });
    },

    /** Elimina una rutina */
    async delete(id) {
      await GymDB._delete('routines', id);
    },

    /**
     * Obtiene una rutina con los datos completos de sus ejercicios.
     * @param {string} id
     * @returns {Promise<Object>} Rutina con exercises[] conteniendo datos completos
     */
    async getWithExercises(id) {
      const routine = await GymDB._getById('routines', id);
      if (!routine) return null;

      // Completa los datos de cada ejercicio
      const populatedExercises = [];
      for (const entry of (routine.exercises || [])) {
        const exercise = await GymDB._getById('exercises', entry.exerciseId);
        populatedExercises.push({
          ...entry,
          exercise: exercise || { name: 'Ejercicio eliminado', muscleGroup: 'N/A' }
        });
      }
      return { ...routine, exercises: populatedExercises };
    }
  },

  // ════════════════════════════════════════════
  //  CRUD DE SESIONES
  // ════════════════════════════════════════════

  sessions: {
    /** Obtiene todas las sesiones, ordenadas por fecha descendente (mas reciente primero) */
    async getAll() {
      const all = await GymDB._getAll('sessions');
      return all.sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    /** Obtiene una sesion por ID */
    async getById(id) { return GymDB._getById('sessions', id); },

    /** Obtiene sesiones para una rutina especifica */
    async getByRoutine(routineId) {
      return GymDB._getByIndex('sessions', 'routineId', routineId);
    },

    /**
     * Agrega una nueva sesion.
     * @param {Object} data — { routineId, duration, logs[] }
     */
    async add(data) {
      const session = {
        id: generateId(),
        date: new Date().toISOString(),
        routineId: data.routineId || '',
        duration: data.duration || 0,
        logs: data.logs || [],
        notes: data.notes || '',
        ...data
      };
      if (!session.id) session.id = generateId();
      await GymDB._put('sessions', session);
      return session.id;
    },

    /** Actualiza una sesion */
    async update(data) {
      if (!data.id) throw new Error('Se requiere el ID de la sesion para actualizar');
      const existing = await GymDB._getById('sessions', data.id);
      if (!existing) throw new Error('Sesion no encontrada: ' + data.id);
      await GymDB._put('sessions', { ...existing, ...data });
    },

    /** Elimina una sesion */
    async delete(id) {
      await GymDB._delete('sessions', id);
    },

    /**
     * Obtiene las N sesiones mas recientes.
     * @param {number} n
     */
    async getRecent(n = 5) {
      const all = await this.getAll();
      return all.slice(0, n);
    },

    /**
     * Obtiene sesiones dentro de un rango de fechas.
     * @param {Date} from
     * @param {Date} to
     */
    async getByDateRange(from, to) {
      const all = await GymDB._getAll('sessions');
      return all.filter(s => {
        const d = new Date(s.date);
        return d >= from && d <= to;
      }).sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  },

  // ════════════════════════════════════════════
  //  DATOS SEMILLA — Auto-poblado en primer uso
  // ════════════════════════════════════════════

  /**
   * Inserta todos los datos semilla: ejercicios, rutinas y sesiones simuladas.
   * Solo se llama cuando la DB esta vacia (primera carga de pagina).
   */
  async _seedAll() {
    // 1. Sembrar ejercicios
    const exercises = this._getSeedExercises();
    for (const ex of exercises) {
      await this._put('exercises', ex);
    }

    // 2. Sembrar rutinas
    const routines = this._getSeedRoutines(exercises);
    for (const rt of routines) {
      await this._put('routines', rt);
    }

    // 3. Sembrar sesiones (15 sesiones simuladas en los ultimos 30 dias)
    const sessions = this._getSeedSessions(routines, exercises);
    for (const ss of sessions) {
      await this._put('sessions', ss);
    }
  },

  /**
   * Genera 12 ejercicios semilla con datos realistas.
   * @returns {Array<Object>}
   */
  _getSeedExercises() {
    return [
      {
        id: 'ex_bench',
        name: 'Press de Banca',
        muscleGroup: 'Pecho',
        type: 'Peso Libre',
        description: 'Ejercicio compuesto que trabaja pecho, triceps y deltoides anteriores. Acuestate en el banco y empuja la barra desde el pecho.',
        image: ''
      },
      {
        id: 'ex_squat',
        name: 'Sentadilla',
        muscleGroup: 'Piernas',
        type: 'Peso Libre',
        description: 'El rey de los ejercicios de pierna. Trabaja cuadriceps, gluteos y core. Baja hasta que los muslos queden paralelos al suelo.',
        image: ''
      },
      {
        id: 'ex_deadlift',
        name: 'Peso Muerto',
        muscleGroup: 'Espalda',
        type: 'Peso Libre',
        description: 'Ejercicio compuesto para espalda baja, gluteos e isquiotibiales. Mantén la espalda recta durante todo el movimiento.',
        image: ''
      },
      {
        id: 'ex_ohp',
        name: 'Press Militar',
        muscleGroup: 'Hombros',
        type: 'Peso Libre',
        description: 'Press de hombros de pie con barra. Trabaja deltoides, triceps y core. Empuja la barra sobre la cabeza hasta la extension completa.',
        image: ''
      },
      {
        id: 'ex_curl',
        name: 'Curl de Biceps',
        muscleGroup: 'Biceps',
        type: 'Peso Libre',
        description: 'Ejercicio de aislamiento para biceps con barra o mancuernas. Mantén los codos pegados al cuerpo.',
        image: ''
      },
      {
        id: 'ex_tricep',
        name: 'Extension de Triceps',
        muscleGroup: 'Triceps',
        type: 'Maquina',
        description: 'Extension de triceps en polea alta. Mantén los codos fijos a los costados y extiende completamente.',
        image: ''
      },
      {
        id: 'ex_pulldown',
        name: 'Jalon al Pecho',
        muscleGroup: 'Espalda',
        type: 'Maquina',
        description: 'Jalones dorsales en polea alta hacia el pecho. Trabaja dorsales y biceps. Contrae los omoplatos al bajar.',
        image: ''
      },
      {
        id: 'ex_legpress',
        name: 'Prensa de Piernas',
        muscleGroup: 'Piernas',
        type: 'Maquina',
        description: 'Prensa inclinada para cuadriceps y gluteos. Baja controladamente hasta 90 grados de flexion de rodilla.',
        image: ''
      },
      {
        id: 'ex_lateral',
        name: 'Elevaciones Laterales',
        muscleGroup: 'Hombros',
        type: 'Peso Libre',
        description: 'Aislamiento de deltoides lateral con mancuernas. Sube los brazos hasta la altura de los hombros.',
        image: ''
      },
      {
        id: 'ex_row',
        name: 'Remo con Barra',
        muscleGroup: 'Espalda',
        type: 'Peso Libre',
        description: 'Remo inclinado con barra. Trabaja dorsales, romboides y biceps. Mantén la espalda a 45 grados.',
        image: ''
      },
      {
        id: 'ex_flyes',
        name: 'Aperturas con Mancuernas',
        muscleGroup: 'Pecho',
        type: 'Peso Libre',
        description: 'Aislamiento de pecho en banco plano con mancuernas. Baja los brazos en arco controlado.',
        image: ''
      },
      {
        id: 'ex_plank',
        name: 'Plancha Abdominal',
        muscleGroup: 'Core',
        type: 'Peso Libre',
        description: 'Ejercicio isometrico de core. Mantén el cuerpo recto apoyandote en antebrazos y puntas de los pies.',
        image: ''
      }
    ];
  },

  /**
   * Genera 2 rutinas semilla usando los ejercicios semilla.
   * @param {Array} exercises
   * @returns {Array<Object>}
   */
  _getSeedRoutines(exercises) {
    const now = new Date();
    return [
      {
        id: 'rt_torso',
        name: 'Torso (Pecho, Espalda y Hombros)',
        description: 'Rutina de tren superior: pecho, espalda, hombros y brazos. Ideal para lunes y jueves.',
        createdAt: new Date(now.getTime() - 25 * 86400000).toISOString(),
        exercises: [
          { exerciseId: 'ex_bench',    order: 1, sets: 4, reps: 10 },
          { exerciseId: 'ex_row',      order: 2, sets: 4, reps: 10 },
          { exerciseId: 'ex_ohp',      order: 3, sets: 3, reps: 10 },
          { exerciseId: 'ex_pulldown', order: 4, sets: 3, reps: 12 },
          { exerciseId: 'ex_curl',     order: 5, sets: 3, reps: 12 },
          { exerciseId: 'ex_tricep',   order: 6, sets: 3, reps: 12 }
        ]
      },
      {
        id: 'rt_pierna',
        name: 'Pierna y Core',
        description: 'Rutina de tren inferior con trabajo de core. Ideal para martes y viernes.',
        createdAt: new Date(now.getTime() - 25 * 86400000).toISOString(),
        exercises: [
          { exerciseId: 'ex_squat',    order: 1, sets: 4, reps: 8  },
          { exerciseId: 'ex_deadlift', order: 2, sets: 4, reps: 6  },
          { exerciseId: 'ex_legpress', order: 3, sets: 3, reps: 12 },
          { exerciseId: 'ex_lateral',  order: 4, sets: 3, reps: 15 },
          { exerciseId: 'ex_plank',    order: 5, sets: 3, reps: 1  }
        ]
      }
    ];
  },

  /**
   * Genera 15 sesiones simuladas distribuidas en los ultimos 30 dias.
   * Los pesos aumentan progresivamente para crear datos de grafico significativos.
   *
   * @param {Array} routines
   * @param {Array} exercises
   * @returns {Array<Object>}
   */
  _getSeedSessions(routines, exercises) {
    const sessions = [];
    const now = new Date();
    const torso = routines[0];
    const pierna = routines[1];

    // Crea 15 sesiones en los ultimos 30 dias (aprox. cada 2 dias)
    for (let i = 0; i < 15; i++) {
      // Distribuye en los ultimos 30 dias
      const daysAgo = 30 - Math.floor(i * (30 / 15));
      const sessionDate = new Date(now.getTime() - daysAgo * 86400000);
      // Hora aleatoria entre 7:00 y 20:00
      sessionDate.setHours(7 + Math.floor(Math.random() * 13), Math.floor(Math.random() * 60));

      // Alterna entre rutina torso y pierna
      const routine = i % 2 === 0 ? torso : pierna;
      // Factor de sobrecarga progresiva: el peso aumenta con el tiempo
      const progressFactor = 1 + (i * 0.03);

      // Genera registros para cada ejercicio de la rutina
      const logs = routine.exercises.map(entry => {
        const exercise = exercises.find(e => e.id === entry.exerciseId);
        // Pesos base varian por ejercicio
        const baseWeight = this._getBaseWeight(entry.exerciseId);

        const sets = [];
        for (let s = 0; s < entry.sets; s++) {
          // Peso con sobrecarga progresiva + variacion aleatoria leve
          const weight = Math.round(baseWeight * progressFactor + (Math.random() * 4 - 2));
          // Reps: objetivo +/- 1-2
          const reps = Math.max(1, entry.reps + Math.floor(Math.random() * 3) - 1);
          sets.push({
            weight: Math.max(0, weight),
            reps: reps,
            done: true
          });
        }

        return {
          exerciseId: entry.exerciseId,
          sets: sets
        };
      });

      // Duracion: 40-75 minutos en milisegundos
      const duration = (40 + Math.floor(Math.random() * 35)) * 60 * 1000;

      sessions.push({
        id: 'ss_seed_' + String(i).padStart(2, '0'),
        date: sessionDate.toISOString(),
        routineId: routine.id,
        duration: duration,
        logs: logs,
        notes: ''
      });
    }

    return sessions;
  },

  /**
   * Devuelve un peso base realista (Kg) para cada ejercicio semilla.
   * @param {string} exerciseId
   * @returns {number}
   */
  _getBaseWeight(exerciseId) {
    const weights = {
      'ex_bench':    60,
      'ex_squat':    80,
      'ex_deadlift': 90,
      'ex_ohp':      35,
      'ex_curl':     20,
      'ex_tricep':   25,
      'ex_pulldown': 50,
      'ex_legpress': 120,
      'ex_lateral':  10,
      'ex_row':      55,
      'ex_flyes':    14,
      'ex_plank':    0
    };
    return weights[exerciseId] || 30;
  },

  // ════════════════════════════════════════════
  //  ADMINISTRACION DE LA BASE DE DATOS
  // ════════════════════════════════════════════

  /**
   * Elimina completamente la base de datos (para pruebas / reseteo).
   */
  async deleteDatabase() {
    if (this._db) {
      this._db.close();
      this._db = null;
    }
    return new Promise((resolve, reject) => {
      const req = indexedDB.deleteDatabase(DB_NAME);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
};
