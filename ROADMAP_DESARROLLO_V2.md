# 🏆 Plan Maestro Gym-Init v2.0: "The Athlete's Gear"

**Concepto:** App de alto rendimiento centrada en datos, inspirada en **Setgraph**.  
**Prioridad:** Mobile-First, Interactividad Táctil, Estética Premium.

---

## 🛠️ Fase 1: Core UX & Media (Cimientos Sólidos)
*Objetivo: Corregir errores de flujo y mejorar la presentación visual inmediata.*

### 1.1 Insumos de Datos (Mobile-First)
- **Input de Peso Inteligente:** 
  - Forzar `inputmode="decimal"` para el teclado numérico.
  - **Lógica de Confirmación:** Los valores del primer set NO se propagan mientras escribes. Se requiere darle a "Aceptar" para validar, propagar a los demás sets y cerrar el teclado.
- **Media Aspect-Ratio:**
  - Contenedor con `aspect-ratio` fijo (1/1 o 16/9) para GIFs/Fotos en todas las listas. Uso de `object-fit: contain/cover` para que nada se vea cortado o estirado.

### 1.2 Rutinas y Acceso Rápido
- **Covers de Rutina:** Fotos personalizables para el fondo de cada tarjeta de rutina.
- **Direct Start:** Botón "Iniciar" directo desde la lista de rutinas para saltar la configuración intermedia.

---

## 📅 Fase 2: El Perfil del Atleta (Consistencia, Récords y Metas)
*Objetivo: El centro de mando del usuario. Motivación basada en datos pasados y futuros.*

### 2.1 Calendario de Consistencia
- **Heatmap de Entrenamiento:** Calendario tipo GitHub (Verde = Entrenamiento, Gris = Descanso).
- **Meta de Frecuencia:** El usuario establece cuántos días entrena a la semana (ej. 4 o 5 días).
- **Indicador de Racha:** Visualización de la racha actual y cumplimiento de la meta semanal.

### 2.2 Sistema de Metas Objetivos (El Futuro)
*Panel interactivo para establecer y seguir metas específicas con barras de progreso.*
- **Metas de Peso Corporal:** (Ej: "Bajar a 75kg" o "Llegar a 85kg").
- **Metas de Distancia:** (Ej: "Recorrer 50km este mes" o "Maratón de 42km").
- **Metas de Carga (PRs Proyectados):** (Ej: "Levantar 140kg en Sentadilla").
- **Metas de Volumen:** (Ej: "Mover 50,000 kg totales este mes").

### 2.3 Records Personales / Hall of Fame (El Pasado)
*Sección configurable para mostrar tus mejores marcas históricas.*
- **Configuración:** El usuario selecciona qué récords quiere que sean visibles en su perfil.
- **Métricas:** Peso Récord, Mejor 1RM, Mejor Volumen por Serie, Mejor Volumen Total de Sesión, Mayor cambio de peso (ganancia/pérdida) y Récord de Distancia.

---

## 🧘 Fase 3: Entrenamiento Libre e Inteligencia Post-Sesión
*Objetivo: Versatilidad total para cualquier tipo de actividad física.*

### 3.1 Diario y Notas Post-Entrenamiento
- **Feedback Journal:** Al finalizar cualquier sesión (Rutina o Libre), campo de texto opcional para describir sensaciones, energía o detalles de la actividad (ej: "9.3 km en la vereda del lago").
- **Métricas Adaptativas:** En sesiones libres, se oculta el "Volumen Levantado" y se prioriza la "Actividad vs Tiempo".

### 3.2 Selección Manual y Salud
- **Añadir en Vivo:** Buscar y añadir ejercicios al catálogo durante una sesión libre.
- **Integración Salud:** Sincronización con Apple Health y Google Fit para pasos, distancias y calorías.

---

## 📈 Fase 4: Analítica Visual Premium y Sobrecarga
*Objetivo: Transformar datos complejos en visualizaciones hermosas y consejos.*

### 4.1 Gráficas de Nueva Generación
- **Distribución Muscular:** Colores únicos y sólidos por grupo muscular.
- **Legibilidad:** Rediseño de gráficas de intensidad, frecuencia y volumen con el estilo premium de la gráfica de peso corporal.

### 4.2 Motor de Sobrecarga Progresiva
- **Smart Notifications:** Consejos basados en el historial: *"La última vez cargaste X, ¿hoy probamos con un 2.5% más?"*.
- **RPE (Esfuerzo Percibido):** Escala 1-10 para medir la dificultad de cada set.

---

## ⚡ Fase 5: El Nuevo "Active Session View" (Flashcard Mode)
*Objetivo: Enfoque total. Inspirado en Setgraph.*

### 5.1 UI de Alto Enfoque
- **Modo Flashcard:** Un ejercicio a la vez en pantalla grande. Navegación por Swipe.
- **Timers Triplets:** 
  1. Cronómetro de Sesión Global. 
  2. Cronómetro por Ejercicio.
  3. **Temporizador de Descanso Automático:** Inicia al marcar una serie y avisa cuándo volver a la carga.
- **Flujo Automatizado:** Transición fluida al siguiente ejercicio tras completar los sets.
