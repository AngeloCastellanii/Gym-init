# 🏋️ Gym-Init — Tracker de Entrenamiento Personal

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://gym-init.vercel.app)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa)](https://gym-init.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> Registra tu progreso de entrenamiento, crea rutinas personalizadas y trackea tu fuerza — funciona **100% offline**, directo en tu dispositivo.

---

## 📋 Descripción del Proyecto

**Gym-Init** es una Progressive Web App (PWA) diseñada para atletas y personas que llegan nuevas a un gimnasio y quieren llevar un registro serio de sus entrenamientos sin depender de servidores externos ni de conexión a internet. Toda la información se almacena localmente en el dispositivo usando **IndexedDB**, por lo que tus datos siempre son privados y accesibles sin conexión.

### ✨ Funcionalidades Principales

| Módulo | Descripción |
|---|---|
| 📊 **Dashboard** | KPIs en tiempo real (volumen, sesiones, racha), gráficas de distribución muscular e intensidad. Filtros por Hoy / Semana / Mes / Global. |
| 🏋️ **Ejercicios** | Catálogo de 52+ ejercicios predeterminados. Filtros por región corporal (Pecho, Espalda, Pierna, Brazos, Hombros, Core). Agregar ejercicios personalizados con imagen. |
| 📋 **Rutinas** | 22+ rutinas predeterminadas (Push, Pull, Full Body, Piernas, Brazos, etc.). Crea y edita tus propias rutinas. |
| ⏱️ **Sesiones** | Tracker en tiempo real con dos modos: **Rutina** (series × repeticiones × peso) y **Libre** (cronómetro + notas, para cardio/deportes). |
| 📅 **Historial** | Lista de todas las sesiones completadas. Vista de detalle con los pesos trabajados por ejercicio. Filtros temporales. |
| 👤 **Perfil** | Nombre de usuario, objetivo de entrenamiento, cambio de unidad (Kg/Lb), gestión de grupos musculares personalizados. |

---

## 🚀 Instrucciones de Instalación y Ejecución

### Opción A — Abrir directamente (sin servidor)

> ⚠️ Algunas funciones (Service Worker / PWA) solo funcionan bajo HTTPS o `localhost`. Para desarrollo local usa la Opción B.

```bash
# Clona el repositorio
git clone https://github.com/AngeloCastellanii/Gym-init.git
cd Gym-init

# Abre el archivo directamente en tu navegador
# (Windows)
start index.html
```

### Opción B — Con servidor local (Recomendado para desarrollo)

```bash
# Clona el repositorio
git clone https://github.com/AngeloCastellanii/Gym-init.git
cd Gym-init

# Instala las dependencias de desarrollo
npm install

# Inicia el servidor de desarrollo
npm run dev
```

Esto iniciará un servidor local en `http://localhost:3000` (o similar).

### Opción C — Ver en producción

La app está desplegada y disponible públicamente en Vercel:

```
https://gym-init.vercel.app
```

### 📱 Instalar como App en tu móvil (PWA)

**Android (Chrome):**
1. Abre la URL en Chrome.
2. Toca el menú (⋮) → **"Añadir a pantalla de inicio"** o **"Instalar aplicación"**.

**iOS (Safari):**
1. Abre la URL en Safari.
2. Toca el botón Compartir (□↑) → **"Añadir a pantalla de inicio"**.

---

## 📁 Estructura del Proyecto

```
Gym-Init/
│
├── index.html              # App Shell principal (punto de entrada)
├── manifest.json           # Configuración PWA (nombre, iconos, tema)
├── sw.js                   # Service Worker (caché offline)
├── package.json            # Dependencias de desarrollo
│
├── css/
│   └── styles.css          # Estilos globales (variables, componentes, layout)
│
└── js/
    ├── app.js              # Punto de entrada: inicializa DB, seed y router
    ├── db.js               # Capa de persistencia (wrapper de IndexedDB)
    ├── router.js           # Router SPA basado en hash (#dashboard, #exercises…)
    ├── seed.js             # Datos iniciales: 52 ejercicios y 22 rutinas
    ├── utils.js            # Helpers globales, grupos musculares, colores
    │
    └── components/
        ├── app-nav.js              # Sidebar (desktop) y Bottom Nav (móvil)
        ├── dashboard-view.js       # Vista del Dashboard con KPIs y gráficas
        ├── exercises-view.js       # Catálogo de ejercicios con filtros
        ├── routines-view.js        # Listado y gestión de rutinas
        ├── sessions-view.js        # Historial de sesiones con filtros temporales
        ├── active-session-view.js  # Tracker activo (modo rutina y modo libre)
        ├── session-detail-view.js  # Vista de detalle de una sesión pasada
        ├── profile-view.js         # Perfil, preferencias y zona de peligro
        ├── exercise-modal.js       # Modal para crear/editar ejercicios
        ├── routine-modal.js        # Modal para crear/editar rutinas
        ├── confirm-dialog.js       # Dialogo de confirmación reutilizable
        ├── loading-state.js        # Componente de estado de carga
        └── error-state.js          # Componente de estado de error
```

---

## 🧭 Rutas de Navegación (SPA)

| Hash | Componente | Descripción |
|---|---|---|
| `#dashboard` | `dashboard-view` | Pantalla principal con estadísticas |
| `#exercises` | `exercises-view` | Catálogo de ejercicios |
| `#routines` | `routines-view` | Gestor de rutinas |
| `#sessions` | `sessions-view` | Historial de entrenamientos |
| `#session/new` | `active-session-view` | Iniciar nueva sesión |
| `#session/:id` | `session-detail-view` | Detalle de sesión pasada |
| `#profile` | `profile-view` | Perfil y configuración |

---

## 🗃️ Base de Datos (IndexedDB)

La persistencia se maneja a través de la clase `GymDatabase` (en `db.js`) con tres almacenes:

| Store | Key | Descripción |
|---|---|---|
| `exercises` | `id` (string) | Catálogo de ejercicios |
| `routines` | `id` (string) | Rutinas con sus ejercicios |
| `sessions` | `id` (string) | Historial de sesiones completadas |

**Seed automático:** Al iniciar por primera vez (DB vacía), `seed.js` inserta automáticamente **52 ejercicios** y **22 rutinas** organizadas por grupos musculares.

---

## 💪 Catálogo de Ejercicios por Región

| Región | Músculos incluidos | Ejercicios |
|---|---|---|
| **Pecho** | Pectorales | 6 |
| **Espalda** | Dorsales, Lumbares, Trapecios | 6 + 4 + 4 |
| **Hombros** | Deltoides (Hombros) | 5 |
| **Brazos** | Bíceps, Tríceps, Antebrazos | 5 + 5 + 5 |
| **Pierna** | Cuádriceps, Isquiotibiales, Glúteos, Pantorrillas | 5 + 5 + 5 + 4 |
| **Core** | Abdominales, Lumbares | 5 + 4 |

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Uso |
|---|---|
| **HTML5** | Estructura semántica del App Shell |
| **CSS3 (Vanilla)** | Diseño visual: variables CSS, flexbox, grid, animaciones |
| **JavaScript (ES6+)** | Lógica de la aplicación (Web Components nativos, Promises, async/await) |
| **Web Components** | Todos los componentes de UI son Custom Elements nativos (`customElements.define`) |
| **IndexedDB** | Persistencia local de ejercicios, rutinas y sesiones |
| **Service Worker** | Caché offline y funcionamiento sin conexión |
| **PWA (manifest.json)** | Instalación en dispositivos móviles y de escritorio |
| **Chart.js** | Gráficas del dashboard (distribución muscular, intensidad) |
| **Phosphor Icons** | Librería de iconos SVG |
| **Google Fonts (Inter)** | Tipografía principal |
| **Vercel** | Plataforma de despliegue (CI/CD automático desde GitHub) |

---

## 📦 Dependencias

### Producción (CDN, sin instalación local)
```
Chart.js@4.4.4          — Gráficas
@phosphor-icons/web     — Iconos
Google Fonts (Inter)    — Tipografía
```

### Desarrollo
```json
{
  "devDependencies": {
    "serve": "^14.x"   // Servidor local para desarrollo
  }
}
```

---

## 🗺️ Roadmap (Futuras Mejoras)

- [ ] **Sugerencias de peso:** Mostrar el peso de la sesión anterior al registrar una serie.
- [ ] **Exportar datos:** Exportar sesiones a CSV o PDF.
- [ ] **Gráficas de progreso por ejercicio:** Ver la curva de fuerza a lo largo del tiempo.
- [ ] **Temporizador de descanso:** Cuenta regresiva automática entre series.
- [ ] **Múltiples perfiles:** Soporte para más de un usuario en el mismo dispositivo.

---

## 🤝 Contribuyendo

1. Haz un fork del repositorio.
2. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit de tus cambios: `git commit -m 'feat: descripcion de la funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request.

---

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">
  <p>Hecho con ❤️ y mucho <strong>esfuerzo físico</strong> 💪</p>
  <p><strong>Gym-Init</strong> — Dale Push a tu entrenamiento</p>
</div>
