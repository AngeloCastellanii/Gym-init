# Gym-Init: Ejercicios y Reglas de Dominio

Este documento contiene la lista completa de ejercicios de la aplicacion y las reglas tecnicas de dominio para la generacion de contenido y desarrollo.

## 1. Reglas de Dominio (Code Rules)

1. **PROHIBIDO EL USO DE "ñ"**: No se debe utilizar el caracter "ñ" en ninguna parte del codigo (nombres de variables, comentarios, logs, IDs). Siempre usar "gn" o "n".
2. **Enfoque Mobile-First**: Todo el diseño y las interacciones deben estar optimizados prioritariamente para dispositivos moviles.
3. **Estetica Premium**: Uso de Glassmorphism, gradientes suaves, colores vibrantes y micro-animaciones. Evitar colores basicos (red, blue puro).
4. **Persistencia Local**: La aplicacion utiliza IndexedDB para almacenar ejercicios, rutinas y sesiones de forma local.
5. **Arquitectura de Componentes**: La app se construye mediante Web Components (Custom Elements) nativos en JavaScript.
6. **Sistema de Temas**: Soporte completo para Modo Claro y Modo Oscuro mediante variables CSS.
7. **Idempotencia de Datos**: Las inserciones de datos semilla (Seed) deben usar IDs fijos (ej: `ex_pec_01`) para evitar duplicados en recargas.

---

## 2. Lista de Ejercicios (Catalog)

### Pectorales
- Press de Banca Plano
- Press de Banca Inclinado
- Aperturas con Mancuernas
- Flexiones de Brazos
- Press de Banca Declinado
- Cruce de Poleas

### Dorsales (Espalda)
- Jalon al Pecho
- Remo con Barra
- Dominadas
- Remo con Mancuerna
- Pullover con Mancuerna
- Remo en Polea Baja

### Deltoides (Hombros)
- Press Militar con Barra
- Elevaciones Laterales
- Elevaciones Frontales
- Pajaros con Mancuernas
- Press Arnold
- Face Pull

### Biceps
- Curl de Biceps con Barra
- Curl con Mancuernas Alterno
- Curl en Predicador
- Curl Martillo
- Curl en Polea Baja

### Triceps
- Press Frances
- Fondos en Paralelas
- Extension de Triceps en Polea
- Patada de Triceps
- Press de Banca Agarre Cerrado

### Piernas (Cuadriceps / Isquios / Pantorrillas)
- Sentadilla con Barra
- Prensa de Piernas
- Extension de Cuadriceps
- Zancadas (Lunges)
- Sentadilla Hack
- Curl Femoral Tumbado
- Peso Muerto Rumano
- Buenos Dias
- Curl Femoral Sentado
- Peso Muerto Convencional
- Elevacion de Talones de Pie
- Elevacion de Talones Sentado
- Elevacion en Prensa de Piernas
- Saltos a la Comba

### Gluteos
- Hip Thrust
- Sentadilla Sumo
- Patada Trasera en Polea
- Puente de Gluteos
- Step-Up con Mancuernas
- Extensiones de Cadera
- Abducciones
- Patada de Gluteo
- RDL Unilateral
- Sentadilla con Mancuerna / Disco

### Core y Abdominales
- Crunch Abdominal
- Plancha Abdominal
- Rueda Abdominal
- Elevacion de Piernas Colgado
- Russian Twist
- Abs — Extension de Piernas
- Abs — Giro Ruso
- Abs — Crunch

### Otros (Lumbares, Trapecios, Antebrazos)
- Hiperextension Lumbar
- Superman
- Puente desde Suelo
- Peso Muerto Sumo
- Encogimientos de Hombros (Barra/Mancuernas)
- Remo al Cuello
- Curl de Munecas con Barra
- Extension de Munecas
- Curl de Agarre con Pinza
- Rotacion de Munecas con Maza
- Muertos Colgados en Barra
