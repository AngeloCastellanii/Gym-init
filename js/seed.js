/**
 *
 *  seed.js — Datos Iniciales de Ejercicios y Rutinas
 *  Se insertan solo 1 vez (si la DB está vacía).
 * 
 */

const SEED_EXERCISES = [

  // ── PECTORALES ─────────────────────────────────────────
  { id:'ex_pec_01', name:'Press de Banca Plano',         muscleGroup:'Pectorales',             equipment:'Barra',      difficulty:'Intermedio',
    description:'Ejercicio compuesto fundamental para el desarrollo del pectoral mayor. Acuéstate en el banco, agarra la barra a la anchura de los hombros y bájala controladamente hasta el pecho.',
    tips:'Mantén los pies bien apoyados en el suelo y los omóplatos retraídos. Exhala al empujar.' },

  { id:'ex_pec_02', name:'Press de Banca Inclinado',     muscleGroup:'Pectorales',             equipment:'Barra',      difficulty:'Intermedio',
    description:'Igual que el press plano pero con el banco a 30-45°. Enfatiza la parte superior (clavicular) del pecho.',
    tips:'Evita un ángulo mayor a 45° o pasará a ser un ejercicio de deltoides.' },

  { id:'ex_pec_03', name:'Aperturas con Mancuernas',     muscleGroup:'Pectorales',             equipment:'Mancuernas', difficulty:'Principiante',
    description:'Ejercicio de aislamiento que estira y contrae el pecho. Con brazos semi-extendidos, abre los brazos y súbelos de nuevo describiendo un arco.',
    tips:'Mantén una ligera flexión en los codos durante todo el recorrido para proteger las articulaciones.' },

  { id:'ex_pec_04', name:'Flexiones de Brazos',          muscleGroup:'Pectorales',             equipment:'Sin equipo', difficulty:'Principiante',
    description:'Ejercicio básico con el peso corporal. Coloca las manos a la anchura de los hombros y baja el cuerpo hasta casi tocar el suelo.',
    tips:'Mantén el cuerpo recto como una tabla. Puedes variar el ancho de manos para cambiar el énfasis muscular.' },

  { id:'ex_pec_05', name:'Press de Banca Declinado',     muscleGroup:'Pectorales',             equipment:'Barra',      difficulty:'Intermedio',
    description:'Con el banco inclinado negativamente (-15° a -30°), trabaja la parte inferior del pectoral. Exige buena movilidad de hombros.',
    tips:'Usa pesos ligeramente superiores al press plano. Asegúrate con un compañero al desrackear.' },

  { id:'ex_pec_06', name:'Cruce de Poleas',              muscleGroup:'Pectorales',             equipment:'Poleas',     difficulty:'Intermedio',
    description:'Ejercicio de aislamiento con poleas que permite constante tensión en todo el rango de movimiento. Une las manos frente al pecho.',
    tips:'Varía la altura de las poleas (alta, media, baja) para enfocar distintas porciones del pectoral.' },

  // ── DORSALES ───────────────────────────────────────────
  { id:'ex_dor_01', name:'Jalón al Pecho',               muscleGroup:'Dorsales',               equipment:'Polea',      difficulty:'Principiante',
    description:'Ejercicio básico de jalón con polea alta. Jala la barra hacia el pecho manteniendo el tronco ligeramente inclinado hacia atrás.',
    tips:'Retrae los omóplatos al final del movimiento. No te balancees para coger impulso.' },

  { id:'ex_dor_02', name:'Remo con Barra',               muscleGroup:'Dorsales',               equipment:'Barra',      difficulty:'Intermedio',
    description:'Ejercicio compuesto de empuje horizontal para el dorsal ancho y romboides. Inclina el tronco a 45°, jala la barra hacia el abdomen.',
    tips:'Mantén la espalda plana y las rodillas ligeramente flexionadas. El cuello en posición neutra.' },

  { id:'ex_dor_03', name:'Dominadas',                    muscleGroup:'Dorsales',               equipment:'Sin equipo', difficulty:'Avanzado',
    description:'El mejor ejercicio de peso corporal para la espalda. Agarra la barra con agarre prono y sube hasta que la barbilla supere la barra.',
    tips:'Inicia el movimiento retrayendo los omóplatos. Si no puedes hacer una, usa banda elástica de asistencia.' },

  { id:'ex_dor_04', name:'Remo con Mancuerna',           muscleGroup:'Dorsales',               equipment:'Mancuernas', difficulty:'Principiante',
    description:'Remo unilateral que permite un mayor rango de movimiento. Apoya una mano y rodilla en el banco, jala la mancuerna hacia la cadera.',
    tips:'Mantén la espalda paralela al suelo. Lleva el codo lo más atrás posible en cada repetición.' },

  { id:'ex_dor_05', name:'Pullover con Mancuerna',       muscleGroup:'Dorsales',               equipment:'Mancuernas', difficulty:'Intermedio',
    description:'Ejercicio que trabaja el dorsal amplio en un eje diferente al de los jaones. Tumbado en banco, lleva la mancuerna por detrás de la cabeza.',
    tips:'Mantén los codos ligeramente flexionados. Siente el estiramiento del dorsal en la fase excéntrica.' },

  { id:'ex_dor_06', name:'Remo en Polea Baja',           muscleGroup:'Dorsales',               equipment:'Polea',      difficulty:'Principiante',
    description:'Remo sentado con agarre neutro. Permite trabajar el dorsal y los romboides con una trayectoria estable y controlada.',
    tips:'No te balancees al tirar. Mantén el torso erguido y lleva los codos pegados al cuerpo.' },

  // ── DELTOIDES ──────────────────────────────────────────
  { id:'ex_del_01', name:'Press Militar con Barra',      muscleGroup:'Deltoides (Hombros)',    equipment:'Barra',      difficulty:'Intermedio',
    description:'Ejercicio compuesto para el deltoides anterior y medio. De pie o sentado, presiona la barra desde la clavícula hasta la extensión completa.',
    tips:'Activa el core para proteger la zona lumbar. No bloquees los codos al final del recorrido.' },

  { id:'ex_del_02', name:'Elevaciones Laterales',        muscleGroup:'Deltoides (Hombros)',    equipment:'Mancuernas', difficulty:'Principiante',
    description:'Ejercicio de aislamiento para el deltoides medio. Eleva las mancuernas lateralmente hasta la altura de los hombros.',
    tips:'Usa cargas ligeras. El dedo meñique debe ir ligeramente más alto que el pulgar (rotación interna leve).' },

  { id:'ex_del_03', name:'Elevaciones Frontales',        muscleGroup:'Deltoides (Hombros)',    equipment:'Mancuernas', difficulty:'Principiante',
    description:'Trabaja el deltoides anterior. Eleva los brazos al frente alternando o simultáneamente hasta la altura de los hombros.',
    tips:'Evita el balanceo del tronco. Controla la fase de bajada (excéntrica) para mayor estímulo.' },

  { id:'ex_del_04', name:'Pájaros con Mancuernas',       muscleGroup:'Deltoides (Hombros)',    equipment:'Mancuernas', difficulty:'Principiante',
    description:'Trabaja el deltoides posterior. Con torso inclinado a 90°, eleva los brazos lateralmente describiendo un arco.',
    tips:'Lleva los codos ligeramente flexionados. Imagina que quieres juntar los omóplatos al elevar.' },

  { id:'ex_del_05', name:'Press Arnold',                 muscleGroup:'Deltoides (Hombros)',    equipment:'Mancuernas', difficulty:'Intermedio',
    description:'Variante del press de hombros creada por Arnold Schwarzenegger. Parte con las palmas mirando hacia ti y las rotas durante el press.',
    tips:'El rango de movimiento completo trabaja las tres cabezas del deltoides. Control total en la bajada.' },

  // ── BÍCEPS ─────────────────────────────────────────────
  { id:'ex_bic_01', name:'Curl de Bíceps con Barra',     muscleGroup:'Bíceps',                 equipment:'Barra',      difficulty:'Principiante',
    description:'Ejercicio clásico de aislamiento para el bíceps braquial. De pie, con agarre supino, flexiona el codo hasta contraer el bíceps.',
    tips:'Mantén los codos pegados al cuerpo. No uses inercia del torso para levantar el peso.' },

  { id:'ex_bic_02', name:'Curl con Mancuernas Alterno',  muscleGroup:'Bíceps',                 equipment:'Mancuernas', difficulty:'Principiante',
    description:'Variante unilateral que permite supinar la muñeca durante el movimiento, maximizando la contracción del bíceps.',
    tips:'Supina la muñeca (gírala hacia afuera) a medida que sube la mancuerna para un pico de bíceps mayor.' },

  { id:'ex_bic_03', name:'Curl en Predicador',           muscleGroup:'Bíceps',                 equipment:'Polea',      difficulty:'Intermedio',
    description:'El banco predicador elimina la inercia del cuerpo. Aísla puro bíceps especialmente en la parte inferior del rango.',
    tips:'Baja el peso de forma controlada. No hiperextiendas el codo al bajar.' },

  { id:'ex_bic_04', name:'Curl Martillo',                muscleGroup:'Bíceps',                 equipment:'Mancuernas', difficulty:'Principiante',
    description:'Con agarre neutro (palmas enfrentadas), trabaja el braquial y braquiorradial además del bíceps. Da más volumen al brazo.',
    tips:'Mantén los codos inmóviles. Puedes hacerlo alternando o simultáneamente.' },

  { id:'ex_bic_05', name:'Curl en Polea Baja',           muscleGroup:'Bíceps',                 equipment:'Polea',      difficulty:'Principiante',
    description:'La polea mantiene tensión constante en todo el rango. Permite el uso de diferentes accesorios (soga, barra recta, barra EZ).',
    tips:'Experimenta con diferentes pomos para variar el énfasis en el bíceps.' },

  // ── TRÍCEPS ────────────────────────────────────────────
  { id:'ex_tri_01', name:'Press Francés',                muscleGroup:'Tríceps',                equipment:'Barra',      difficulty:'Intermedio',
    description:'Ejercicio de aislamiento para el tríceps. Tumbado en banco, baja la barra EZ hacia la frente flexionando solo los codos.',
    tips:'Mantén los codos apuntando al techo. No abras los codos hacia los lados.' },

  { id:'ex_tri_02', name:'Fondos en Paralelas',          muscleGroup:'Tríceps',                equipment:'Sin equipo', difficulty:'Intermedio',
    description:'Ejercicio compuesto de peso corporal en paralelas. Con torso más erguido, el énfasis pasa del pecho al tríceps.',
    tips:'Mantén el torso recto (no te inclines hacia delante) para aislar el tríceps.' },

  { id:'ex_tri_03', name:'Extensión de Tríceps en Polea',muscleGroup:'Tríceps',                equipment:'Polea',      difficulty:'Principiante',
    description:'Clásico ejercicio de aislamiento. Con polea alta y soga o barra, extiende los codos hacia abajo completamente.',
    tips:'Mantén los codos pegados al cuerpo y fijos. Solo deben moverse los antebrazos.' },

  { id:'ex_tri_04', name:'Patada de Tríceps',            muscleGroup:'Tríceps',                equipment:'Mancuernas', difficulty:'Principiante',
    description:'Ejercicio unilateral con mancuerna. Inclinado a 45°, desde el codo a 90°, extiende el antebrazo completamente hacia atrás.',
    tips:'Contrae al máximo al extender. Mantén el codo inmóvil pegado al cuerpo.' },

  { id:'ex_tri_05', name:'Press de Banca Agarre Cerrado',muscleGroup:'Tríceps',                equipment:'Barra',      difficulty:'Intermedio',
    description:'Variante del press de banca con manos cercanas que enfatiza los tríceps. Manos a unos 30 cm de separación.',
    tips:'No juntes demasiado las manos o pondrás estrés extraño en las muñecas. Codos pegados al cuerpo al bajar.' },

  // ── CUÁDRICEPS ─────────────────────────────────────────
  { id:'ex_cua_01', name:'Sentadilla con Barra',         muscleGroup:'Cuádriceps',             equipment:'Barra',      difficulty:'Intermedio',
    description:'El rey de los ejercicios para pierna. Con la barra en los trapecios, flexiona caderas y rodillas hasta los 90° o más.',
    tips:'Las rodillas deben seguir la dirección de los pies. El pecho erguido durante todo el movimiento.' },

  { id:'ex_cua_02', name:'Prensa de Piernas',            muscleGroup:'Cuádriceps',             equipment:'Máquina',    difficulty:'Principiante',
    description:'Alternativa a la sentadilla con menor estrés en la columna. Empuja la plataforma hasta casi extender las rodillas.',
    tips:'No bloquees las rodillas al extender. Pies en posición media en la plataforma para equilibrar cuádriceps y glúteos.' },

  { id:'ex_cua_03', name:'Extensión de Cuádriceps',      muscleGroup:'Cuádriceps',             equipment:'Máquina',    difficulty:'Principiante',
    description:'Ejercicio de aislamiento para el cuádriceps en la máquina de extensión. Extiende las rodillas desde 90° hasta la extensión total.',
    tips:'Aguanta 1 segundo en la parte alta. Baja de forma controlada (3-4 segundos) para mayor hipertrofia.' },

  { id:'ex_cua_04', name:'Zancadas (Lunges)',            muscleGroup:'Cuádriceps',             equipment:'Mancuernas', difficulty:'Principiante',
    description:'Ejercicio unilateral excelente para cuádriceps y glúteos. Da un paso largo al frente, baja la rodilla trasera casi al suelo.',
    tips:'La rodilla delantera no debe sobrepasar la punta del pie. Mantén el torso erguido.' },

  { id:'ex_cua_05', name:'Sentadilla Hack',              muscleGroup:'Cuádriceps',             equipment:'Máquina',    difficulty:'Intermedio',
    description:'Variante de sentadilla en máquina que permite mayor énfasis en cuádriceps con menor estrés lumbar.',
    tips:'Pies bajos en la plataforma para máximo énfasis en cuádriceps. Pies altos para más glúteos.' },

  // ── ISQUIOTIBIALES ─────────────────────────────────────
  { id:'ex_isq_01', name:'Curl Femoral Tumbado',         muscleGroup:'Isquiotibiales (Femorales)', equipment:'Máquina', difficulty:'Principiante',
    description:'Ejercicio de aislamiento para los femorales. Tumbado boca abajo, flexiona las rodillas trayendo los talones hacia los glúteos.',
    tips:'Contrae los femorales en la posición final. Baja de forma lenta y controlada.' },

  { id:'ex_isq_02', name:'Peso Muerto Rumano',           muscleGroup:'Isquiotibiales (Femorales)', equipment:'Barra',   difficulty:'Intermedio',
    description:'Variante del peso muerto con ligera flexión de rodillas que maximiza el estiramiento de los femorales.',
    tips:'El movimiento viene de la cadera (bisagra), no de doblar la espalda. Siente el estiramiento en los femorales al bajar.' },

  { id:'ex_isq_03', name:'Buenos Días',                  muscleGroup:'Isquiotibiales (Femorales)', equipment:'Barra',   difficulty:'Intermedio',
    description:'Con la barra en la espalda alta, inclina el torso hacia delante manteniendo la espalda recta. Trabaja femorales y lumbares.',
    tips:'Empieza con pesos muy ligeros para aprender la técnica. La flexión de cadera debe ser el movimiento principal.' },

  { id:'ex_isq_04', name:'Curl Femoral Sentado',         muscleGroup:'Isquiotibiales (Femorales)', equipment:'Máquina', difficulty:'Principiante',
    description:'Variante del curl femoral en posición sentada que cambia el ángulo de tensión sobre los isquiotibiales.',
    tips:'Ajusta el asiento para que la articulación de la rodilla esté alineada con el eje de la máquina.' },

  { id:'ex_isq_05', name:'Peso Muerto Convencional',     muscleGroup:'Isquiotibiales (Femorales)', equipment:'Barra',   difficulty:'Avanzado',
    description:'El ejercicio más completo del cuerpo. Trabaja toda la cadena posterior: femorales, glúteos, lumbares, trapecios y dorsal.',
    tips:'La barra debe rozar las espinillas durante todo el recorrido. Empuja el suelo con los pies, no jales con la espalda.' },

  // ── GLÚTEOS ────────────────────────────────────────────
  { id:'ex_glu_01', name:'Hip Thrust',                   muscleGroup:'Glúteos',                equipment:'Barra',      difficulty:'Intermedio',
    description:'El mejor ejercicio para el glúteo mayor. Con la espalda alta apoyada en un banco, empuja la barra con las caderas hacia el techo.',
    tips:'Contrae fuerte el glúteo en la posición alta. Las rodillas deben apuntar hacia afuera en la parte alta.' },

  { id:'ex_glu_02', name:'Sentadilla Sumo',              muscleGroup:'Glúteos',                equipment:'Barra',      difficulty:'Intermedio',
    description:'Sentadilla con apertura amplia de pies (mayor a la anchura de hombros) y pies girados 45°. Mayor activación de glúteos.',
    tips:'Las rodillas deben seguir la dirección de los pies. Baja hasta que los muslos estén paralelos al suelo.' },

  { id:'ex_glu_03', name:'Patada Trasera en Polea',      muscleGroup:'Glúteos',                equipment:'Polea',      difficulty:'Principiante',
    description:'Ejercicio de aislamiento unilateral. Con la polea sujeta al tobillo, lleva la pierna hacia atrás extendiendo la cadera.',
    tips:'Mantén el torso estable apoyado en la máquina. Contrae el glúteo en la extensión máxima.' },

  { id:'ex_glu_04', name:'Puente de Glúteos',            muscleGroup:'Glúteos',                equipment:'Sin equipo', difficulty:'Principiante',
    description:'Versión sin barra del hip thrust. Tumbado boca arriba con rodillas flexionadas, eleva las caderas hasta alinearlas con el torso.',
    tips:'Añade una resistencia elástica sobre las rodillas para mayor activación. Aguanta 2 segundos arriba.' },

  { id:'ex_glu_05', name:'Step-Up con Mancuernas',       muscleGroup:'Glúteos',                equipment:'Mancuernas', difficulty:'Principiante',
    description:'Sube un cajón o banco alternando piernas. Trabaja cuádriceps, femorales y glúteos de forma funcional.',
    tips:'Da el paso desde el pie que está sobre la caja; no te impulses con la pierna del suelo.' },

  // ── PANTORRILLAS ───────────────────────────────────────
  { id:'ex_pan_01', name:'Elevación de Talones de Pie',  muscleGroup:'Pantorrillas (Gemelos)',  equipment:'Máquina',    difficulty:'Principiante',
    description:'Ejercicio básico para el gastrocnemio. De pie, eleva los talones hasta la máxima extensión y baja lentamente.',
    tips:'Realiza el ejercicio con el dedo gordo hacia adentro para mayor activación del gemelo interno.' },

  { id:'ex_pan_02', name:'Elevación de Talones Sentado', muscleGroup:'Pantorrillas (Gemelos)',  equipment:'Máquina',    difficulty:'Principiante',
    description:'Con rodillas a 90°, trabaja principalmente el sóleo (músculo profundo de la pantorrilla), crucial para el volumen total.',
    tips:'El sóleo se trabaja mejor con la rodilla flexionada. Usa un rango de movimiento completo.' },

  { id:'ex_pan_03', name:'Elevación en Prensa de Piernas',muscleGroup:'Pantorrillas (Gemelos)', equipment:'Máquina',    difficulty:'Principiante',
    description:'Usando la prensa de piernas, empuja la plataforma solo con la punta de los pies. Permite usar cargas altas.',
    tips:'No bloquees las rodillas. Controla el movimiento hacia abajo para evitar lesiones.' },

  { id:'ex_pan_04', name:'Saltos a la Comba',            muscleGroup:'Pantorrillas (Gemelos)',  equipment:'Sin equipo', difficulty:'Principiante',
    description:'Ejercicio cardiovascular y de pantorrilla. La comba desarrolla la resistencia y la explosividad de los gemelos.',
    tips:'Aterriza suave con la parte delantera del pie. Mantén los brazos cerca del cuerpo al girar.' },

  // ── ABDOMINALES ────────────────────────────────────────
  { id:'ex_abd_01', name:'Crunch Abdominal',             muscleGroup:'Abdominales',            equipment:'Sin equipo', difficulty:'Principiante',
    description:'Ejercicio básico de aislamiento para el recto abdominal. Tumbado, flexiona el torso llevando el pecho hacia las rodillas.',
    tips:'No hales del cuello. El movimiento es pequeño y controlado. Exhala al contraer.' },

  { id:'ex_abd_02', name:'Plancha Abdominal',            muscleGroup:'Abdominales',            equipment:'Sin equipo', difficulty:'Principiante',
    description:'Ejercicio isométrico que trabaja el core completo (recto, transverso y oblicuos). Mantén el cuerpo recto apoyado en antebrazos y puntas.',
    tips:'No dejes caer las caderas ni las eleves. Aguanta la respiración en apnea o sopla de forma controlada.' },

  { id:'ex_abd_03', name:'Rueda Abdominal',              muscleGroup:'Abdominales',            equipment:'Rueda ab',   difficulty:'Avanzado',
    description:'Con la rueda abdominal, extiéndete hacia el suelo y vuelve al punto inicial. Trabaja el core de forma muy efectiva.',
    tips:'Empieza rodando solo un poco hacia delante. Nunca arquees la espalda baja.' },

  { id:'ex_abd_04', name:'Elevación de Piernas Colgado', muscleGroup:'Abdominales',            equipment:'Barra',      difficulty:'Avanzado',
    description:'Colgado de una barra, eleva las piernas hasta los 90° o más. Trabaja el recto inferior del abdomen y el flexor de cadera.',
    tips:'Evita el balanceo. Eleva las piernas de forma controlada. Las rodillas pueden estar ligeramente flexionadas.' },

  { id:'ex_abd_05', name:'Russian Twist',                muscleGroup:'Abdominales',            equipment:'Sin equipo', difficulty:'Principiante',
    description:'Sentado con rodillas flexionadas y pies elevados, gira el torso de lado a lado trabajando los oblicuos.',
    tips:'Mantén la espalda recta. Añade peso (disco, mancuerna) para mayor intensidad.' },

  // ── LUMBARES ───────────────────────────────────────────
  { id:'ex_lum_01', name:'Hiperextensión Lumbar',        muscleGroup:'Lumbares',               equipment:'Máquina',    difficulty:'Principiante',
    description:'En el banco de hiperextensión, baja el torso y elévalo hasta alinear con las piernas. Fortalece los erectores espinales.',
    tips:'No hiperextiendas la columna en la parte alta. Para en posición neutra. Añade peso en el pecho para progresar.' },

  { id:'ex_lum_02', name:'Superman',                     muscleGroup:'Lumbares',               equipment:'Sin equipo', difficulty:'Principiante',
    description:'Tumbado boca abajo, eleva simultáneamente brazos y piernas del suelo. Trabaja lumbares, glúteos y femorales.',
    tips:'Aguanta 2-3 segundos en la posición elevada. Ideal como ejercicio de activación o rehabilitación.' },

  { id:'ex_lum_03', name:'Puente desde Suelo',           muscleGroup:'Lumbares',               equipment:'Sin equipo', difficulty:'Principiante',
    description:'Similar al puente de glúteos pero con énfasis en la activación de los extensores de la columna y glúteos.',
    tips:'Sube vértebra a vértebra y baja de la misma forma. Activa el core antes de elevar.' },

  { id:'ex_lum_04', name:'Peso Muerto Sumo',             muscleGroup:'Lumbares',               equipment:'Barra',      difficulty:'Intermedio',
    description:'Variante con apertura amplia de pies que reduce el estrés en la zona lumbar comparado con el convencional.',
    tips:'Los pies a 45° y los codos por dentro de las rodillas. Empuja el suelo para arrangcar el peso.' },

  // ── TRAPECIOS ──────────────────────────────────────────
  { id:'ex_tra_01', name:'Encogimientos de Hombros',     muscleGroup:'Trapecios',              equipment:'Barra',      difficulty:'Principiante',
    description:'Ejercicio de aislamiento para la porción superior del trapecio. Eleva los hombros directamente hacia las orejas.',
    tips:'No hagas rotaciones de hombros; el movimiento debe ser estrictamente vertical. Aguanta 1 segundo arriba.' },

  { id:'ex_tra_02', name:'Encogimientos con Mancuernas', muscleGroup:'Trapecios',              equipment:'Mancuernas', difficulty:'Principiante',
    description:'Igual que con barra pero con mancuernas, permitiendo un mayor rango de movimiento y más libertad de muñecas.',
    tips:'Usa pinza completa. Controla la bajada para mayor estímulo excéntrico.' },

  { id:'ex_tra_03', name:'Remo al Cuello',               muscleGroup:'Trapecios',              equipment:'Barra',      difficulty:'Intermedio',
    description:'Con agarre estrecho, jala la barra desde las caderas hasta el mentón en vertical. Trabaja trapecios y deltoides.',
    tips:'Lleva los codos por encima de las manos durante todo el recorrido. Contraindicado si tienes problemas de hombros.' },

  { id:'ex_tra_04', name:'Face Pull',                    muscleGroup:'Trapecios',              equipment:'Polea',      difficulty:'Principiante',
    description:'Con polea alta y cuerda, jala hacia la cara separando las manos. Trabaja trapecios posteriores y deltoides traseros.',
    tips:'Fundamental para la salud de los hombros. Lleva las manos a la altura de las orejas externamente rotando.' },

  // ── ANTEBRAZOS ─────────────────────────────────────────
  { id:'ex_ant_01', name:'Curl de Muñecas con Barra',    muscleGroup:'Antebrazos',             equipment:'Barra',      difficulty:'Principiante',
    description:'Sentado con los antebrazos apoyados en los muslos, flexiona las muñecas levantando la barra. Trabaja los flexores del antebrazo.',
    tips:'Usa cargas ligeras. El movimiento es pequeño pero muy eficaz para el volumen del antebrazo.' },

  { id:'ex_ant_02', name:'Extensión de Muñecas',         muscleGroup:'Antebrazos',             equipment:'Barra',      difficulty:'Principiante',
    description:'Igual que el curl de muñecas pero con agarre prono (palmas hacia abajo). Trabaja los extensores del antebrazo.',
    tips:'Trabaja extensor y flexor en proporciones similares para equilibrar el antebrazo y evitar lesiones.' },

  { id:'ex_ant_03', name:'Curl de Agarre con Pinza',     muscleGroup:'Antebrazos',             equipment:'Mancuernas', difficulty:'Principiante',
    description:'Sujeta una mancuerna por el extremo con los dedos y flexiona la muñeca hacia arriba. Trabaja los flexores de los dedos.',
    tips:'Empieza con poco peso. Es excelente para mejorar el agarre y la fuerza prensil.' },

  { id:'ex_ant_04', name:'Rotación de Muñecas con Maza', muscleGroup:'Antebrazos',             equipment:'Maza',       difficulty:'Intermedio',
    description:'Con una maza de fitness o mancuerna desequilibrada, rota la muñeca en ambas direcciones. Desarrolla los pronadores y supinadores.',
    tips:'Empieza con pesos muy ligeros. El movimiento rotacional fortalece los músculos estabilizadores del antebrazo.' },

  { id:'ex_ant_05', name:'Muertos Colgados en Barra',    muscleGroup:'Antebrazos',             equipment:'Barra',      difficulty:'Principiante',
    description:'Simplemente cuelga de una barra de dominadas durante el máximo tiempo posible. Desarrolla el agarre y los antebrazos.',
    tips:'Usa el tiempo bajo tensión como métrica de progresión. Varía entre agarre supino y prono.' },

  // ── DEPORTES Y COMBATE ─────────────────────────────────
  { id:'ex_dep_01', name:'Saco de Boxeo',                muscleGroup:'Cardio / Deportes',      equipment:'Saco',       difficulty:'Principiante',
    description:'Trabajo de golpeo en saco pesado. Mejora la resistencia cardiovascular, la técnica y la fuerza explosiva.',
    tips:'Mantén siempre la guardia arriba. Anota los minutos en TIEMPO y los asaltos en ROUNDS.' },

  { id:'ex_dep_02', name:'Boxeo (Sparring / Sombra)',    muscleGroup:'Cardio / Deportes',      equipment:'Sin equipo', difficulty:'Intermedio',
    description:'Práctica de boxeo ya sea sombra o combate con compañero. Enfoque en movimiento, esquivas y combinaciones.',
    tips:'Registra los minutos totales de trabajo o el tiempo por asalto.' },

  { id:'ex_dep_03', name:'BJJ - Roladas / Sparring',     muscleGroup:'Cardio / Deportes',      equipment:'Tatami',     difficulty:'Intermedio',
    description:'Práctica libre de Jiu-Jitsu Brasileño. Lucha de sumisión con compañero.',
    tips:'Anota el tiempo total en la primera columna. Usa RPE para medir la intensidad promedio.' },

  { id:'ex_dep_04', name:'BJJ - Drills',                 muscleGroup:'Cardio / Deportes',      equipment:'Tatami',     difficulty:'Principiante',
    description:'Perfeccionamiento técnico de transiciones y sumisiones.',
    tips:'Anota el tiempo empleado en practicar la técnica repetitivamente.' }
];

// ─────────────────────────────────────────────────────────────
//  RUTINAS
// ─────────────────────────────────────────────────────────────
const SEED_ROUTINES = [

  // ── DÍA DE PECHO ─────────────────────────────────────
  {
    id: 'rt_pec_a',
    name: 'Pecho — Volumen',
    muscleGroup: 'Pectorales',
    difficulty: 'Intermedio',
    description: 'Rutina de volumen para pecho con énfasis en el pectoral superior y cabeza clavicular.',
    exercises: [
      { exerciseId:'ex_pec_02', sets:4, reps:10, rest:90, order:1 },
      { exerciseId:'ex_pec_01', sets:4, reps:10, rest:90, order:2 },
      { exerciseId:'ex_pec_03', sets:3, reps:12, rest:75, order:3 },
      { exerciseId:'ex_pec_06', sets:3, reps:15, rest:60, order:4 }
    ]
  },
  {
    id: 'rt_pec_b',
    name: 'Pecho — Fuerza',
    muscleGroup: 'Pectorales',
    difficulty: 'Avanzado',
    description: 'Rutina de alta intensidad para maximizar la fuerza en los movimientos de empuje de pecho.',
    exercises: [
      { exerciseId:'ex_pec_01', sets:5, reps:5,  rest:180, order:1 },
      { exerciseId:'ex_pec_05', sets:4, reps:8,  rest:120, order:2 },
      { exerciseId:'ex_pec_04', sets:3, reps:15, rest:60,  order:3 },
      { exerciseId:'ex_pec_06', sets:3, reps:12, rest:60,  order:4 }
    ]
  },

  // ── DÍA DE ESPALDA ───────────────────────────────────
  {
    id: 'rt_dor_a',
    name: 'Espalda — Ancho y Volumen',
    muscleGroup: 'Dorsales',
    difficulty: 'Intermedio',
    description: 'Combinación de jalones y remos para construir un dorsal ancho y grueso.',
    exercises: [
      { exerciseId:'ex_dor_03', sets:4, reps:8,  rest:120, order:1 },
      { exerciseId:'ex_dor_01', sets:4, reps:12, rest:90,  order:2 },
      { exerciseId:'ex_dor_02', sets:4, reps:10, rest:90,  order:3 },
      { exerciseId:'ex_dor_06', sets:3, reps:12, rest:75,  order:4 }
    ]
  },
  {
    id: 'rt_dor_b',
    name: 'Espalda — Grosor',
    muscleGroup: 'Dorsales',
    difficulty: 'Avanzado',
    description: 'Énfasis en remos horizontales para crear grosor en la espalda media y baja.',
    exercises: [
      { exerciseId:'ex_dor_02', sets:4, reps:8,  rest:120, order:1 },
      { exerciseId:'ex_dor_04', sets:4, reps:10, rest:90,  order:2 },
      { exerciseId:'ex_dor_05', sets:3, reps:12, rest:75,  order:3 },
      { exerciseId:'ex_dor_01', sets:3, reps:12, rest:75,  order:4 }
    ]
  },

  // ── DÍA DE HOMBROS ───────────────────────────────────
  {
    id: 'rt_del_a',
    name: 'Hombros — Completo',
    muscleGroup: 'Deltoides (Hombros)',
    difficulty: 'Intermedio',
    description: 'Rutina que trabaja las tres cabezas del deltoides y los trapecios superiores.',
    exercises: [
      { exerciseId:'ex_del_01', sets:4, reps:10, rest:90, order:1 },
      { exerciseId:'ex_del_02', sets:4, reps:15, rest:60, order:2 },
      { exerciseId:'ex_del_03', sets:3, reps:12, rest:60, order:3 },
      { exerciseId:'ex_del_04', sets:3, reps:15, rest:60, order:4 },
      { exerciseId:'ex_tra_04', sets:3, reps:15, rest:60, order:5 }
    ]
  },
  {
    id: 'rt_del_b',
    name: 'Hombros — Press y Aislamiento',
    muscleGroup: 'Deltoides (Hombros)',
    difficulty: 'Intermedio',
    description: 'Enfocado en fuerza de press y luego aislamiento de cada cabeza del deltoides.',
    exercises: [
      { exerciseId:'ex_del_05', sets:4, reps:10, rest:90, order:1 },
      { exerciseId:'ex_del_01', sets:3, reps:12, rest:75, order:2 },
      { exerciseId:'ex_del_02', sets:4, reps:12, rest:60, order:3 },
      { exerciseId:'ex_del_04', sets:3, reps:15, rest:60, order:4 }
    ]
  },

  // ── BÍCEPS + TRÍCEPS + ANTEBRAZOS ────────────────────
  {
    id: 'rt_bra_a',
    name: 'Brazos — Volumen Total',
    muscleGroup: 'Bíceps',
    difficulty: 'Intermedio',
    description: 'Rutina completa de brazos: bíceps, tríceps y antebrazos superpuestos para máximo flujo de sangre.',
    exercises: [
      { exerciseId:'ex_bic_01', sets:4, reps:10, rest:60,  order:1 },
      { exerciseId:'ex_tri_02', sets:4, reps:10, rest:60,  order:2 },
      { exerciseId:'ex_bic_02', sets:3, reps:12, rest:60,  order:3 },
      { exerciseId:'ex_tri_03', sets:3, reps:12, rest:60,  order:4 },
      { exerciseId:'ex_bic_04', sets:3, reps:12, rest:60,  order:5 },
      { exerciseId:'ex_ant_01', sets:3, reps:15, rest:45,  order:6 }
    ]
  },
  {
    id: 'rt_bra_b',
    name: 'Brazos — Fuerza y Definición',
    muscleGroup: 'Tríceps',
    difficulty: 'Intermedio',
    description: 'Énfasis en ejercicios compuestos para brazos más densos y definidos.',
    exercises: [
      { exerciseId:'ex_tri_05', sets:4, reps:8,  rest:90,  order:1 },
      { exerciseId:'ex_bic_03', sets:4, reps:10, rest:75,  order:2 },
      { exerciseId:'ex_tri_01', sets:3, reps:12, rest:75,  order:3 },
      { exerciseId:'ex_bic_05', sets:3, reps:12, rest:60,  order:4 },
      { exerciseId:'ex_tri_04', sets:3, reps:12, rest:60,  order:5 },
      { exerciseId:'ex_ant_02', sets:3, reps:15, rest:45,  order:6 }
    ]
  },

  // ── PIERNAS COMPLETO ─────────────────────────────────
  {
    id: 'rt_pie_a',
    name: 'Piernas — Cuádriceps Dominante',
    muscleGroup: 'Cuádriceps',
    difficulty: 'Avanzado',
    description: 'Sesión pesada de pierna con énfasis en cuádriceps. Alta carga y volumen moderado.',
    exercises: [
      { exerciseId:'ex_cua_01', sets:5, reps:6,  rest:180, order:1 },
      { exerciseId:'ex_cua_02', sets:4, reps:10, rest:90,  order:2 },
      { exerciseId:'ex_cua_03', sets:3, reps:15, rest:60,  order:3 },
      { exerciseId:'ex_isq_01', sets:3, reps:12, rest:60,  order:4 },
      { exerciseId:'ex_pan_01', sets:4, reps:20, rest:60,  order:5 }
    ]
  },
  {
    id: 'rt_pie_b',
    name: 'Piernas — Posterior e Isquiotibiales',
    muscleGroup: 'Isquiotibiales (Femorales)',
    difficulty: 'Intermedio',
    description: 'Prioriza cadena posterior: femorales, glúteos y gemelos con acceso al peso muerto rumano.',
    exercises: [
      { exerciseId:'ex_isq_02', sets:4, reps:10, rest:90,  order:1 },
      { exerciseId:'ex_glu_01', sets:4, reps:10, rest:90,  order:2 },
      { exerciseId:'ex_isq_04', sets:3, reps:12, rest:75,  order:3 },
      { exerciseId:'ex_cua_04', sets:3, reps:12, rest:75,  order:4 },
      { exerciseId:'ex_pan_02', sets:4, reps:20, rest:60,  order:5 }
    ]
  },

  // ── GLÚTEOS ──────────────────────────────────────────
  {
    id: 'rt_glu_a',
    name: 'Glúteos — Activación y Volumen',
    muscleGroup: 'Glúteos',
    difficulty: 'Principiante',
    description: 'Rutina enfocada en el glúteo mayor con ejercicios de activación progresiva y alto volumen.',
    exercises: [
      { exerciseId:'ex_glu_04', sets:3, reps:20, rest:45,  order:1 },
      { exerciseId:'ex_glu_01', sets:4, reps:12, rest:90,  order:2 },
      { exerciseId:'ex_glu_03', sets:4, reps:15, rest:60,  order:3 },
      { exerciseId:'ex_glu_05', sets:3, reps:12, rest:60,  order:4 }
    ]
  },
  {
    id: 'rt_glu_b',
    name: 'Glúteos — Fuerza con Barra',
    muscleGroup: 'Glúteos',
    difficulty: 'Intermedio',
    description: 'Sesión de fuerza para glúteos y pierna inferior con cargas progresivas.',
    exercises: [
      { exerciseId:'ex_glu_01', sets:5, reps:8,  rest:120, order:1 },
      { exerciseId:'ex_glu_02', sets:4, reps:10, rest:90,  order:2 },
      { exerciseId:'ex_cua_04', sets:3, reps:12, rest:75,  order:3 },
      { exerciseId:'ex_glu_03', sets:3, reps:15, rest:60,  order:4 }
    ]
  },

  // ── CORE / ABDOMINALES ───────────────────────────────
  {
    id: 'rt_abd_a',
    name: 'Core — Resistencia',
    muscleGroup: 'Abdominales',
    difficulty: 'Principiante',
    description: 'Circuito de core para desarrollar resistencia y estabilidad abdominal. Ideal para añadir al final de cualquier entrenamiento.',
    exercises: [
      { exerciseId:'ex_abd_02', sets:4, reps:30, rest:45,  order:1 },  // 30 = 30 segundos
      { exerciseId:'ex_abd_01', sets:4, reps:20, rest:45,  order:2 },
      { exerciseId:'ex_abd_05', sets:3, reps:20, rest:45,  order:3 },
      { exerciseId:'ex_abd_04', sets:3, reps:12, rest:60,  order:4 }
    ]
  },
  {
    id: 'rt_abd_b',
    name: 'Core — Fuerza y Control',
    muscleGroup: 'Abdominales',
    difficulty: 'Intermedio',
    description: 'Sesión de core enfocada en fuerza y control motor con ejercicios de mayor intensidad.',
    exercises: [
      { exerciseId:'ex_abd_03', sets:4, reps:8,  rest:90,  order:1 },
      { exerciseId:'ex_abd_04', sets:4, reps:12, rest:75,  order:2 },
      { exerciseId:'ex_abd_02', sets:3, reps:45, rest:60,  order:3 },  // 45 seg
      { exerciseId:'ex_abd_05', sets:3, reps:20, rest:45,  order:4 }
    ]
  },

  // ── EMPUJE (Push) ────────────────────────────────────
  {
    id: 'rt_push_a',
    name: 'Push A — Clásico',
    muscleGroup: 'Pectorales',
    difficulty: 'Intermedio',
    description: 'Día de empuje clásico: Pecho, hombros y tríceps en una misma sesión.',
    exercises: [
      { exerciseId:'ex_pec_01', sets:4, reps:10, rest:90,  order:1 },
      { exerciseId:'ex_del_01', sets:4, reps:10, rest:90,  order:2 },
      { exerciseId:'ex_pec_02', sets:3, reps:12, rest:75,  order:3 },
      { exerciseId:'ex_tri_02', sets:3, reps:12, rest:75,  order:4 },
      { exerciseId:'ex_del_02', sets:3, reps:15, rest:60,  order:5 },
      { exerciseId:'ex_tri_03', sets:3, reps:15, rest:60,  order:6 }
    ]
  },
  {
    id: 'rt_push_b',
    name: 'Push B — Alta Intensidad',
    muscleGroup: 'Pectorales',
    difficulty: 'Avanzado',
    description: 'Push con énfasis en carga pesada y volumen alto. Para días con mucha energía.',
    exercises: [
      { exerciseId:'ex_pec_01', sets:5, reps:6,  rest:180, order:1 },
      { exerciseId:'ex_del_05', sets:4, reps:8,  rest:120, order:2 },
      { exerciseId:'ex_pec_06', sets:3, reps:12, rest:75,  order:3 },
      { exerciseId:'ex_tri_01', sets:4, reps:10, rest:75,  order:4 },
      { exerciseId:'ex_del_02', sets:3, reps:15, rest:60,  order:5 }
    ]
  },

  // ── JALÓN (Pull) ─────────────────────────────────────
  {
    id: 'rt_pull_a',
    name: 'Pull A — Clásico',
    muscleGroup: 'Dorsales',
    difficulty: 'Intermedio',
    description: 'Día de jalón: Espalda, bíceps y trapecios en una sesión completa.',
    exercises: [
      { exerciseId:'ex_dor_03', sets:4, reps:8,  rest:120, order:1 },
      { exerciseId:'ex_dor_02', sets:4, reps:10, rest:90,  order:2 },
      { exerciseId:'ex_bic_01', sets:3, reps:12, rest:75,  order:3 },
      { exerciseId:'ex_dor_06', sets:3, reps:12, rest:75,  order:4 },
      { exerciseId:'ex_tra_01', sets:3, reps:15, rest:60,  order:5 },
      { exerciseId:'ex_bic_04', sets:3, reps:12, rest:60,  order:6 }
    ]
  },
  {
    id: 'rt_pull_b',
    name: 'Pull B — Dominadas y Remos',
    muscleGroup: 'Dorsales',
    difficulty: 'Avanzado',
    description: 'Pull con peso corporal y barras. Para espalda ancha y gruesa a la vez.',
    exercises: [
      { exerciseId:'ex_dor_03', sets:5, reps:6,  rest:120, order:1 },
      { exerciseId:'ex_dor_04', sets:4, reps:10, rest:90,  order:2 },
      { exerciseId:'ex_tra_04', sets:4, reps:15, rest:60,  order:3 },
      { exerciseId:'ex_bic_03', sets:3, reps:12, rest:75,  order:4 },
      { exerciseId:'ex_dor_05', sets:3, reps:12, rest:60,  order:5 }
    ]
  },

  // ── FULL BODY ────────────────────────────────────────
  {
    id: 'rt_full_a',
    name: 'Full Body A',
    muscleGroup: 'Cuádriceps',
    difficulty: 'Intermedio',
    description: 'Entrenamiento de cuerpo completo con los movimientos compuestos más efectivos.',
    exercises: [
      { exerciseId:'ex_cua_01', sets:4, reps:8,  rest:120, order:1 },
      { exerciseId:'ex_pec_01', sets:4, reps:8,  rest:120, order:2 },
      { exerciseId:'ex_dor_03', sets:3, reps:8,  rest:120, order:3 },
      { exerciseId:'ex_del_01', sets:3, reps:10, rest:90,  order:4 },
      { exerciseId:'ex_abd_02', sets:3, reps:30, rest:60,  order:5 }
    ]
  },
  {
    id: 'rt_full_b',
    name: 'Full Body B',
    muscleGroup: 'Isquiotibiales (Femorales)',
    difficulty: 'Intermedio',
    description: 'Variante del full body con diferentes ejercicios para cadena posterior y empuje.',
    exercises: [
      { exerciseId:'ex_isq_05', sets:4, reps:6,  rest:180, order:1 },
      { exerciseId:'ex_pec_02', sets:4, reps:8,  rest:120, order:2 },
      { exerciseId:'ex_dor_02', sets:4, reps:10, rest:90,  order:3 },
      { exerciseId:'ex_glu_01', sets:3, reps:10, rest:90,  order:4 },
      { exerciseId:'ex_bic_01', sets:3, reps:12, rest:60,  order:5 }
    ]
  },

  // ── LUMBARES + TRAPECIOS ─────────────────────────────
  {
    id: 'rt_lum_a',
    name: 'Lumbares y Trapecios A',
    muscleGroup: 'Lumbares',
    difficulty: 'Principiante',
    description: 'Rutina de fortalecimiento de la zona media posterior: lumbares y trapecios para una postura perfecta.',
    exercises: [
      { exerciseId:'ex_lum_01', sets:4, reps:15, rest:60,  order:1 },
      { exerciseId:'ex_tra_01', sets:4, reps:15, rest:60,  order:2 },
      { exerciseId:'ex_lum_02', sets:3, reps:15, rest:45,  order:3 },
      { exerciseId:'ex_tra_04', sets:3, reps:15, rest:60,  order:4 }
    ]
  },
  {
    id: 'rt_lum_b',
    name: 'Lumbares y Trapecios B',
    muscleGroup: 'Trapecios',
    difficulty: 'Intermedio',
    description: 'Sesión de fuerza para región dorsal alta y media con énfasis en la prevención de lesiones.',
    exercises: [
      { exerciseId:'ex_isq_05', sets:3, reps:5,  rest:180, order:1 },
      { exerciseId:'ex_tra_03', sets:4, reps:12, rest:75,  order:2 },
      { exerciseId:'ex_lum_01', sets:4, reps:12, rest:60,  order:3 },
      { exerciseId:'ex_tra_02', sets:3, reps:15, rest:60,  order:4 }
    ]
  }
];

/**
 * ─────────────────────────────────────────────────────────────
 *  PROGRAMA SEMANAL DEL USUARIO — GYM (5 días)
 *  Lunes: Femoral + Glúteos
 *  Martes: Espalda + Tríceps + Abs
 *  Miércoles: Quads
 *  Jueves: Hombros + Bíceps + Abs
 *  Viernes: Glúteos
 * ─────────────────────────────────────────────────────────────
 */

// Ejercicios específicos del programa semanal del usuario
// (con IDs 'ex_s_XX' para no colisionar con el seed base)
const SEED_WEEKLY_EXERCISES = [
  // ── Femoral / Glúteos ──────────────────────────────────
  { id: 'ex_s_01', name: 'Zumo (Máquina Femoral)',           muscleGroup: 'Isquiotibiales (Femorales)', equipment: 'Máquina',       difficulty: 'Principiante' },
  { id: 'ex_s_02', name: 'Leg Curl Acostado',                muscleGroup: 'Isquiotibiales (Femorales)', equipment: 'Máquina',       difficulty: 'Principiante' },
  { id: 'ex_s_03', name: 'Hip Thrust',                       muscleGroup: 'Glúteos',                    equipment: 'Barra',         difficulty: 'Intermedio'  },
  { id: 'ex_s_04', name: 'Peso Muerto con Barra',            muscleGroup: 'Isquiotibiales (Femorales)', equipment: 'Barra',         difficulty: 'Intermedio'  },
  { id: 'ex_s_05', name: 'Extensiones de Cadera',            muscleGroup: 'Glúteos',                    equipment: 'Máquina',       difficulty: 'Principiante' },
  { id: 'ex_s_06', name: 'Abducciones',                      muscleGroup: 'Glúteos',                    equipment: 'Máquina',       difficulty: 'Principiante' },
  { id: 'ex_s_07', name: 'Pantorrillas (Gemelos)',            muscleGroup: 'Pantorrillas (Gemelos)',      equipment: 'Máquina',       difficulty: 'Principiante' },
  // ── Espalda / Tríceps ──────────────────────────────────
  { id: 'ex_s_08', name: 'Jalón al Pecho',                   muscleGroup: 'Dorsales',                   equipment: 'Polea',         difficulty: 'Principiante' },
  { id: 'ex_s_09', name: 'Extensión de Tríceps (Copa)',       muscleGroup: 'Tríceps',                    equipment: 'Mancuerna',     difficulty: 'Principiante' },
  { id: 'ex_s_10', name: 'Remo en Máquina',                  muscleGroup: 'Dorsales',                   equipment: 'Máquina',       difficulty: 'Principiante' },
  { id: 'ex_s_11', name: 'Copa (Tríceps con Mancuerna)',      muscleGroup: 'Tríceps',                    equipment: 'Mancuerna',     difficulty: 'Principiante' },
  { id: 'ex_s_12', name: 'Pull Over',                        muscleGroup: 'Dorsales',                   equipment: 'Mancuerna',     difficulty: 'Intermedio'  },
  { id: 'ex_s_13', name: 'Fondos en Paralelas',              muscleGroup: 'Tríceps',                    equipment: 'Sin equipo',    difficulty: 'Intermedio'  },
  { id: 'ex_s_14', name: 'Dominadas',                        muscleGroup: 'Dorsales',                   equipment: 'Sin equipo',    difficulty: 'Avanzado'    },
  { id: 'ex_s_15', name: 'Abs — Extensión de Piernas',       muscleGroup: 'Abdominales',                equipment: 'Sin equipo',    difficulty: 'Principiante' },
  { id: 'ex_s_16', name: 'Abs — Giro Ruso',                  muscleGroup: 'Abdominales',                equipment: 'Sin equipo',    difficulty: 'Principiante' },
  { id: 'ex_s_17', name: 'Abs — Crunch',                     muscleGroup: 'Abdominales',                equipment: 'Sin equipo',    difficulty: 'Principiante' },
  // ── Cuádriceps ─────────────────────────────────────────
  { id: 'ex_s_18', name: 'Búlgaras (Sentadilla Búlgara)',    muscleGroup: 'Cuádriceps',                 equipment: 'Mancuerna',     difficulty: 'Intermedio'  },
  { id: 'ex_s_19', name: 'Prensa de Piernas',                muscleGroup: 'Cuádriceps',                 equipment: 'Máquina',       difficulty: 'Principiante' },
  { id: 'ex_s_20', name: 'Extensión de Cuádriceps',          muscleGroup: 'Cuádriceps',                 equipment: 'Máquina',       difficulty: 'Principiante' },
  { id: 'ex_s_21', name: 'Sentadilla con Barra',             muscleGroup: 'Cuádriceps',                 equipment: 'Barra',         difficulty: 'Intermedio'  },
  { id: 'ex_s_22', name: 'Sissy Squat',                      muscleGroup: 'Cuádriceps',                 equipment: 'Sin equipo',    difficulty: 'Intermedio'  },
  { id: 'ex_s_23', name: 'Adducciones',                      muscleGroup: 'Glúteos',                    equipment: 'Máquina',       difficulty: 'Principiante' },
  // ── Hombros / Bíceps ───────────────────────────────────
  { id: 'ex_s_24', name: 'Press Militar',                    muscleGroup: 'Deltoides (Hombros)',         equipment: 'Barra',         difficulty: 'Intermedio'  },
  { id: 'ex_s_25', name: 'Curl de Bíceps con Mancuerna',    muscleGroup: 'Bíceps',                     equipment: 'Mancuerna',     difficulty: 'Principiante' },
  { id: 'ex_s_26', name: 'Elevaciones Laterales',            muscleGroup: 'Deltoides (Hombros)',         equipment: 'Mancuerna',     difficulty: 'Principiante' },
  { id: 'ex_s_27', name: 'Elevaciones Frontales',            muscleGroup: 'Deltoides (Hombros)',         equipment: 'Mancuerna',     difficulty: 'Principiante' },
  { id: 'ex_s_28', name: 'Curl Martillo',                    muscleGroup: 'Bíceps',                     equipment: 'Mancuerna',     difficulty: 'Principiante' },
  { id: 'ex_s_29', name: 'Face Pull',                        muscleGroup: 'Deltoides (Hombros)',         equipment: 'Polea',         difficulty: 'Principiante' },
  { id: 'ex_s_30', name: 'Curl de Bíceps en Máquina',        muscleGroup: 'Bíceps',                     equipment: 'Máquina',       difficulty: 'Principiante' },
  // ── Glúteos Viernes ────────────────────────────────────
  { id: 'ex_s_31', name: 'Patada de Glúteo',                 muscleGroup: 'Glúteos',                    equipment: 'Máquina',       difficulty: 'Principiante' },
  { id: 'ex_s_32', name: 'RDL Unilateral (Peso Muerto)',      muscleGroup: 'Isquiotibiales (Femorales)', equipment: 'Mancuerna',     difficulty: 'Intermedio'  },
  { id: 'ex_s_33', name: 'Sentadilla con Mancuerna / Disco', muscleGroup: 'Glúteos',                    equipment: 'Mancuerna',     difficulty: 'Principiante' },
];

const SEED_WEEKLY_ROUTINES = [
  // ──────────────────────────────────────────────────────
  //  LUNES — Femoral + Glúteos (series x3)
  // ──────────────────────────────────────────────────────
  {
    id: 'rt_s_lun',
    name: 'Lunes — Femoral + Glúteos',
    description: 'Zumo, Leg Curl, Hip Thrust, Peso Muerto con Barra, Extensiones de cadera, Abducciones, Pantorrillas.',
    exercises: [
      { exerciseId: 'ex_s_01', sets: 3, reps: 12 },
      { exerciseId: 'ex_s_02', sets: 3, reps: 12 },
      { exerciseId: 'ex_s_03', sets: 4, reps: 10 },
      { exerciseId: 'ex_s_04', sets: 3, reps: 10 },
      { exerciseId: 'ex_s_05', sets: 3, reps: 15 },
      { exerciseId: 'ex_s_06', sets: 3, reps: 15 },
      { exerciseId: 'ex_s_07', sets: 3, reps: 20 },
    ]
  },
  // ──────────────────────────────────────────────────────
  //  MARTES — Espalda + Tríceps + Abs (series x4)
  // ──────────────────────────────────────────────────────
  {
    id: 'rt_s_mar',
    name: 'Martes — Espalda + Tríceps + Abs',
    description: 'Jalón al pecho, Remo, Pull Over, Dominadas. Tríceps: Copa, Extensión, Fondos. Abs x3.',
    exercises: [
      { exerciseId: 'ex_s_08', sets: 4, reps: 10 },
      { exerciseId: 'ex_s_09', sets: 4, reps: 12 },
      { exerciseId: 'ex_s_10', sets: 4, reps: 10 },
      { exerciseId: 'ex_s_11', sets: 4, reps: 12 },
      { exerciseId: 'ex_s_12', sets: 4, reps: 12 },
      { exerciseId: 'ex_s_13', sets: 4, reps: 12 },
      { exerciseId: 'ex_s_14', sets: 3, reps: 8  },
      { exerciseId: 'ex_s_15', sets: 3, reps: 15 },
      { exerciseId: 'ex_s_16', sets: 3, reps: 20 },
      { exerciseId: 'ex_s_17', sets: 3, reps: 20 },
    ]
  },
  // ──────────────────────────────────────────────────────
  //  MIÉRCOLES — Quads (series x4)
  // ──────────────────────────────────────────────────────
  {
    id: 'rt_s_mie',
    name: 'Miércoles — Quads',
    description: 'Búlgaras, Prensa + Extensión de cuádriceps, Sentadilla + Sissy. Adducciones y Pantorrillas x3.',
    exercises: [
      { exerciseId: 'ex_s_18', sets: 4, reps: 10 },
      { exerciseId: 'ex_s_19', sets: 4, reps: 12 },
      { exerciseId: 'ex_s_20', sets: 4, reps: 15 },
      { exerciseId: 'ex_s_21', sets: 4, reps: 10 },
      { exerciseId: 'ex_s_22', sets: 4, reps: 12 },
      { exerciseId: 'ex_s_23', sets: 3, reps: 15 },
      { exerciseId: 'ex_s_07', sets: 3, reps: 20 },
    ]
  },
  // ──────────────────────────────────────────────────────
  //  JUEVES — Hombros + Bíceps + Abs (series x4)
  // ──────────────────────────────────────────────────────
  {
    id: 'rt_s_jue',
    name: 'Jueves — Hombros + Bíceps + Abs',
    description: 'Press Militar, Elevaciones laterales y frontales, Face Pull, Curl bíceps. Dominadas x3. Abs x3.',
    exercises: [
      { exerciseId: 'ex_s_24', sets: 4, reps: 10 },
      { exerciseId: 'ex_s_25', sets: 4, reps: 12 },
      { exerciseId: 'ex_s_26', sets: 4, reps: 15 },
      { exerciseId: 'ex_s_27', sets: 4, reps: 15 },
      { exerciseId: 'ex_s_28', sets: 4, reps: 12 },
      { exerciseId: 'ex_s_29', sets: 4, reps: 15 },
      { exerciseId: 'ex_s_30', sets: 4, reps: 12 },
      { exerciseId: 'ex_s_14', sets: 3, reps: 8  },
      { exerciseId: 'ex_s_15', sets: 3, reps: 15 },
      { exerciseId: 'ex_s_16', sets: 3, reps: 20 },
      { exerciseId: 'ex_s_17', sets: 3, reps: 20 },
    ]
  },
  // ──────────────────────────────────────────────────────
  //  VIERNES — Glúteos (series x4)
  // ──────────────────────────────────────────────────────
  {
    id: 'rt_s_vie',
    name: 'Viernes — Glúteos',
    description: 'Hip Thrust, Patada de Glúteo + Extensiones de cadera, RDL Unilateral, Sentadilla con disco. Abducciones y Pantorrillas x3.',
    exercises: [
      { exerciseId: 'ex_s_03', sets: 4, reps: 10 },
      { exerciseId: 'ex_s_31', sets: 4, reps: 15 },
      { exerciseId: 'ex_s_05', sets: 4, reps: 15 },
      { exerciseId: 'ex_s_32', sets: 4, reps: 10 },
      { exerciseId: 'ex_s_33', sets: 4, reps: 12 },
      { exerciseId: 'ex_s_06', sets: 3, reps: 15 },
      { exerciseId: 'ex_s_07', sets: 3, reps: 20 },
    ]
  },
];

/**
 * Inserta los ejercicios y rutinas semilla si la base de datos está vacía.
 * Usa put() con IDs fijos para ser idempotente (se puede llamar siempre).
 */
async function seedDatabase() {
  const existingExercises = await GymDB.exercises.getAll();
  const existingIds = new Set(existingExercises.map(e => e.id));

  // Insertar ejercicios base si no existen
  if (existingExercises.length === 0) {
    console.log('Insertando ejercicios semilla base...');
    for (const ex of SEED_EXERCISES) {
      await GymDB.exercises.add(ex);
    }
    console.log(`✅ Ejercicios base: ${SEED_EXERCISES.length} insertados.`);
  }

  // Insertar ejercicios del programa semanal si no existen (idempotente por ID)
  let insertedEx = 0;
  for (const ex of SEED_WEEKLY_EXERCISES) {
    if (!existingIds.has(ex.id)) {
      await GymDB.exercises.add(ex);
      insertedEx++;
    }
  }
  if (insertedEx > 0) {
    console.log(`✅ Ejercicios semanales: ${insertedEx} nuevos insertados.`);
  }

  // Insertar rutinas (base + programa semanal) si no existen — idempotente por ID
  const existingRoutines = await GymDB.routines.getAll();
  const existingRoutineIds = new Set(existingRoutines.map(r => r.id));

  const allSeedRoutines = [...SEED_ROUTINES, ...SEED_WEEKLY_ROUTINES];
  let insertedRt = 0;
  for (const rt of allSeedRoutines) {
    if (!existingRoutineIds.has(rt.id)) {
      await GymDB.routines.add(rt);
      insertedRt++;
    }
  }

  if (insertedRt > 0) {
    console.log(`✅ Rutinas: ${insertedRt} nuevas insertadas.`);
  } else {
    console.log('Rutinas: ya existen, seed omitido.');
  }
}
