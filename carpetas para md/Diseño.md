1. Sistema de Diseño Base (UI Kit / Design Tokens)
Tipografía:

Fuente Principal: System UI (San Francisco en Apple, Segoe UI en Windows, Roboto en Android). En Figma, puedes usar Inter o Roboto como equivalente perfecto.

Pesos (Weights): Regular (400), Medium (500), SemiBold (600), Bold (700), Black (900).

Paleta de Colores (Basada en Tailwind CSS):

Fondo Principal (Background): Slate 950 (#020617) - Negro azulado muy profundo.

Fondo de Paneles/Tarjetas: Slate 900 (#0f172a) a Slate 800 (#1e293b).

Acento Principal (Primary): Blue 600 (#2563eb) a Blue 500 (#3b82f6) - Azul eléctrico/neón.

Acento Secundario/Éxito (Success): Emerald 600 (#059669) a Emerald 500 (#10b981) - Verde vibrante.

Peligro/Borrar (Danger): Red 600 (#dc2626) a Red 400 (#f87171).

Textos Principales: White (#ffffff) y Slate 200 (#e2e8f0).

Textos Secundarios/Iconos inactivos: Slate 400 (#94a3b8) y Slate 500 (#64748b).

Líneas / Bordes: Slate 700 (#334155).

Estilos de Efectos:

Glassmorphism (Efecto Cristal): Fondo rgba(30, 41, 59, 0.7) (Slate 800 al 70%) + Background Blur de 10px + Borde superior/izquierdo rgba(255, 255, 255, 0.1). (Este es el estilo de las tarjetas principales).

Sombras (Drop Shadows): Sombras difusas y amplias, especialmente coloreadas bajo los botones principales (ej. sombra azul bajo el botón azul).

Iconografía:

Familia: Phosphor Icons (estilo Bold, Fill y Regular).

2. App Shell (El "Contenedor" Global)
La pantalla se divide en dos grandes áreas.

A. Barra de Navegación (Sidebar / Bottom bar)
Desktop/Tablet (Pantallas > 768px): Es un Sidebar en el lado izquierdo.

Ancho: 256px (lg) o 80px (md).

Fondo: Slate 900 puro. Border derecho de 1px Slate 800.

Cabecera (Logo): Arriba, tiene un div con padding de 24px. Un icono de pesa (Barbell) dentro de un cuadro redondeado (12px) con un gradiente azul. Al lado, el texto "Gym init" en Bold, 20px, color Blanco. (Línea separadora debajo).

Botones de Menú: Ítems apilados verticalmente. Icono a la izquierda, texto a la derecha.

Estado Inactivo: Texto e icono color Slate 400. Sin fondo.

Estado Activo: Fondo azul súper transparente (Blue 600 al 10%), texto e icono en Blue 400.

Hover: Todos escalan ligeramente el icono al pasar el mouse.

Mobile (Pantallas < 768px): Es una barra anclada abajo (Bottom Navigation).

Altura: Aproximadamente 70px.

Fondo: Slate 900. Sombra fuerte hacia arriba (Drop shadow invertido).

Logo: Oculto.

Botones: Alineados horizontalmente. Arriba el icono (24px), abajo el texto muy pequeño (10px).

B. Área de Contenido (Router Outlet)
Ocupa el resto de la pantalla. Fondo Slate 950 puro.

Scroll vertical nativo, con una barra de scroll personalizada (Grosor 6px, track invisible, thumb o "agarre" color Slate 600, hover en Azul).

3. Vistas Específicas (Para prototipar en Figma)
Vista 1: Dashboard (#dashboard)
Header: Título grande "Panel de Control" (30px, Bold) con un gradiente de texto de Azul a Verde Esmeralda. Subtítulo "Resumen de tu progreso...". A la derecha, un botón estilo "Cristal" que dice "⚖️ Unidad: Kg".

Fila 1: Tarjetas de KPIs (4 columnas en desktop, 2 en mobile): * Estilo "Cristal" (Glassmorphism). Altura de ~110px.

Contienen: Título pequeño gris arriba ("Total Sesiones", "Racha Actual"). Número grande (30px) abajo, de colores (Azul, Esmeralda, Naranja, Púrpura).

Fila 2: Cuadrícula de Gráficos (2x2 en desktop, 1x4 en mobile):

Cajas estilo Cristal grandes (Padding 20px). Esquinas muy redondeadas (16px).

Título arriba con un pequeño icono al lado (ej. Icono de tendencia verde + "Progreso Fuerza").

Un área vacía (placeholder) de 250px de altura para insertar el componente de gráfico de línea, barra o dona (esto lo dibujas como un cuadro gris o insertas un plugin de gráficos en Figma).

Vista 2: Ejercicios (#exercises)
Header: Título "Catálogo de Ejercicios". Botón azul prominente a la derecha "+ Añadir Ejercicio" con sombra azul suave.

Barra de Búsqueda y Filtros: Una caja "Cristal" alargada horizontalmente. Lado izquierdo: Input de búsqueda (fondo transparente, texto blanco, icono de lupa). Línea vertical divisora. Lado derecho: Dropdown de "Todos los músculos".

Grid de Tarjetas de Ejercicio (Cards):

Estilo Cristal. Borde fino semitransparente.

Arriba: Título blanco bold. A su derecha, una etiqueta pequeña o "badge" oscura con borde que indica el músculo (ej. "PECHO").

Medio: Icono de etiqueta azul ("Peso Libre"). Debajo, texto descriptivo gris de máximo 3 líneas.

Abajo: Línea separadora. Dos botones: "Editar" (gris ancho) y "Borrar" (rojo pálido, icono de papelera, estrecho).

Vista 3: Rutinas (#routines)
Header: Similar a Ejercicios.

Grid de Tarjetas de Rutina:

Estilo Cristal, pero con un detalle de diseño: Un cuarto de círculo decorativo muy grande y transparente en la esquina superior derecha del fondo (color Azul al 10%).

Contenido: Título grande, descripción, contador de ejercicios ("3 Ejercicios: Sentadilla, Press...").

Botones abajo: Botón verde grande de "▶ Iniciar" a la izquierda. Botón de Editar gris y Botón de borrar rojo.

Vista 4: Historial (#sessions)
Lista de Sesiones (List View): No son cuadros sueltos, es un contenedor grande estilo cristal, y adentro las sesiones están separadas por líneas divisorias horizontales finas (Slate 800).

Ítem de Sesión:

Izquierda: Cuadrado (56x56px) gris oscuro, con el día ("MIE") pequeño y el número ("24") grande en azul eléctrico. Funciona como un calendario.

Centro: Nombre de la rutina blanco ("Torso Lunes"). Abajo texto gris con la hora y el Volumen total levantado ("Vol: 4500 Kg").

Derecha: Botón de papelera rojo (solo aparece on hover o está sutilmente a la derecha).

Vista 5: Entrenamiento Activo (#session/new - ¡La más compleja e importante!)
Esta vista tiene dos "Estados" visuales.

Estado 1: Pantalla Setup (Modo Selección)

Un cuadro modal centrado vertical y horizontalmente. Estilo cristal.

Icono gigante de Pesa en azul. Texto "Modo Entrenamiento".

Input select grande y oscuro.

Botón Verde Esmeralda masivo "INICIAR SESIÓN".

Estado 2: Tracker Activo (En pleno entrenamiento)

Barra Superior (Sticky/Fija): Flota arriba. Fondo Slate 900 al 80% con mucho desenfoque (Blur). Texto "Entrenando" y un Cronómetro Verde neón ("05:42"). Botón Azul de "Terminar".

Tarjetas Grandes de Ejercicio: Por cada ejercicio en la rutina hay una gran caja estilo Cristal.

Header de la caja: Banda azul oscuro superior. Icono de pesa azul y título "Press de Banca".

Cuerpo: Una tabla (Listado).

Cabecera de Tabla: Textos minúsculos grises: "SET", "CARGA", "REPS", "HECHO".

Filas (Sets/Series): * Fondo gris muy oscuro (Slate 900).

Col 1: Número de set gris (1, 2, 3).

Col 2 y 3: Campos de input (cajas rectangulares, fondo casi negro absoluto Slate 950, borde tenue, texto Blanco gigante y en Bold (ej. "60")). Tiene sufijo "Kg" y "reps" en pequeño adentro a la derecha.

Col 4: Botón cuadrado grande. Estado Normal: Gris con check tenue. Estado Marcado/Hecho: Color Verde Esmeralda encendido, icono blanco. Si está marcado, toda la fila se vuelve ligeramente verdosa.

Pie de caja: Botón ancho, transparente con borde punteado "+ Añadir Serie".

4. Componente Modal (Overlays)
Fondo: Todo el fondo de la pantalla (App Shell entera) se oscurece con negro al 85% y aplica un Blur fuerte a todo lo que esté detrás.

Caja Modal: Centrada. Estilo Cristal, pero más sólida que las tarjetas.

Cabecera Modal: Título blanco y botón "X" arriba a la derecha.

Campos de Formulario: Títulos pequeños ("Nombre del Ejercicio"). Inputs con fondo Slate 900 (casi negro), textos blancos, bordes que se pintan de Azul al hacer focus.

Botón de acción: Azul brillante abarcando todo el ancho abajo.