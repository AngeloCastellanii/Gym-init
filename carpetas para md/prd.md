Product Requirements Document (PRD)

1. Información General del Proyecto

Nombre del Producto: Gym init

Plataforma: Aplicación Web (SPA - Single Page Application)

Público Objetivo: Usuarios de gimnasio que buscan registrar y trackear su progreso de entrenamiento de forma rápida y sin depender de conexión a internet constante.

Tecnología Estricta: HTML5, CSS3 (Tailwind vía CDN), JavaScript Vanilla (Web Components). Cero frameworks (React, Angular, Vue).

Persistencia: Local (IndexedDB para datos estructurados, LocalStorage para preferencias).

2. Visión del Producto

Desarrollar una herramienta inmersiva, rápida y offline-first que permita a los usuarios diseñar sus rutinas y registrar su carga progresiva. La interfaz debe ser moderna (inspirada en temas oscuros tipo "glassmorphism") y altamente interactiva, minimizando los clics necesarios durante una sesión de entrenamiento activa.

3. Historias de Usuario (User Stories)

3.1. Gestión de Catálogo (Ejercicios)

Como usuario, quiero poder agregar ejercicios personalizados a mi catálogo, especificando el músculo y tipo (máquina/peso libre), para tener una base de datos adaptada a mi gimnasio.

Como usuario, quiero poder buscar y filtrar ejercicios por grupo muscular para armar mis rutinas más rápido.

Como usuario, quiero ser advertido si intento eliminar un ejercicio que actualmente pertenece a una de mis rutinas.

3.2. Constructor de Rutinas

Como usuario, quiero poder crear "Rutinas" agrupando múltiples ejercicios.

Como usuario, quiero poder definir el número de series (sets) y repeticiones (reps) objetivo para cada ejercicio dentro de la rutina.

Como usuario, quiero poder editar una rutina existente para añadir o quitar ejercicios si mi plan de entrenamiento cambia.

3.3. Tracker de Sesión en Vivo

Como usuario, quiero poder iniciar un entrenamiento basado en una rutina y ver una lista de los ejercicios que debo hacer.

Como usuario, quiero poder anotar el peso exacto levantado y las repeticiones hechas en cada serie individual.

Como usuario, quiero tener un botón de "Check" (Completado) en cada serie para saber visualmente qué he terminado y qué me falta.

Como usuario, quiero ver un cronómetro activo durante mi sesión para saber cuánto tiempo llevo entrenando.

Como usuario, quiero poder añadir series extras ("+ Añadir Serie") sobre la marcha si me siento con energía.

3.4. Analítica y Dashboard

Como usuario, quiero un panel resumen (Dashboard) que me muestre cuántos días he entrenado en el mes.

Como usuario, quiero ver un gráfico de líneas con mi progresión de fuerza (peso máximo) en mis ejercicios principales.

Como usuario, quiero poder alternar la unidad global de la aplicación entre Kilogramos (Kg) y Libras (Lb) y que todos los gráficos se ajusten.

4. Requisitos Funcionales (Funcionalidades Clave)

Motor de Base de Datos Local (IndexedDB)

Autoseed: Si la base de datos está vacía, el sistema debe inyectar automáticamente datos semilla (5 ejercicios básicos, 1 rutina y 15 sesiones simuladas en fechas pasadas) para alimentar los gráficos.

Estructura Relacional: * Store exercises: {id, name, muscleGroup, type, description}

Store routines: {id, name, description, exercises: [{exerciseId, order, sets, reps}]}

Store sessions: {id, date, routineId, duration, logs: [{exerciseId, sets: [{weight, reps, done}]}]}

Sistema de Enrutamiento (SPA Router)

Navegación basada en hash (window.location.hash).

Actualización del DOM (montaje y desmontaje de Custom Elements) sin recargar la página.

Vistas principales: #dashboard, #exercises, #routines, #sessions, #session/new.

Módulo de Gráficos (Chart.js)

Renderizado de mínimo 4 gráficos dinámicos.

Recálculo matemático (ej. Volumen Total = Suma de (Peso * Reps) de todas las series en una sesión).

Conversión de unidades en tiempo real si el usuario cambia de Kg a Lb en LocalStorage.

5. Requisitos No Funcionales (Restricciones y Rendimiento)

Arquitectura de Componentes Web:

Todas las vistas y modales deben ser implementadas usando clases JS que extiendan HTMLElement.

Debido a restricciones de ciclo de vida específicas del proyecto, el DOM interno del componente (this.innerHTML) debe generarse dentro del constructor(), dejando connectedCallback() solo para inyectar el nodo y solicitar datos asíncronos.

Rendimiento Offline:

Toda interacción debe ser inmediata (optimistic UI) sin bloqueos de red, leyendo y escribiendo directamente en IndexedDB.

UI/UX y Responsive Design:

Implementar un diseño oscuro fluido con Tailwind CSS.

Uso de Glassmorphism (backdrop-blur, fondos semitransparentes).

Navegación adaptativa: Barra lateral ancha en escritorio, y barra inferior anclada (bottom-0) con iconos en dispositivos móviles.

Manejo de Errores y Nulos:

Los campos sin descripción deben mostrar "Sin descripción" o "N/A".

Acciones destructivas (borrar rutinas, ejercicios) deben disparar un confirm() nativo o modal de advertencia para prevenir pérdida accidental de datos.



deberá permitir ingresar fotos a los ejercicios para poder saber cuales son cada unos, esta funcion debe encontrarse en el mismo componente de la tarjeta del ejercicio.


6. Fases de Implementación (Hitos)

Fase 1: Configuración de UI global (App Shell, Navbar responsivo, CSS Base).

Fase 2: Implementación del Wrapper de IndexedDB y generación de datos semilla matemáticos.

Fase 3: Desarrollo de vistas de Catálogo (Ejercicios y Rutinas) con lógica CRUD y Modales compartidos.

Fase 4: Desarrollo del Tracker Activo (#session/new) con inputs dinámicos de series, cronómetro y validaciones de finalización.

Fase 5: Integración de Chart.js, cálculo de volumen/progresión y renderizado del Dashboard interactivo.

Fase 6: QA, refinamiento de estilos Glassmorphism y pruebas de persistencia offline.