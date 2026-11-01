export interface DiseaseInfo {
  nombre: string;
  descripcion: string;
  requiereAtencionInmediata: boolean;
  prevencion: string[];
  cuidados: string[];
  queObservar: string[];
  nivelCuidado: 'bajo' | 'medio' | 'alto' | 'critico';
  alimentosRecomendados: string[];
  alimentosEvitar: string[];
}

const DEFAULT: DiseaseInfo = {
  nombre: 'Diagnóstico detectado',
  descripcion:
    'El modelo de IA identificó un patrón de síntomas compatible con esta condición. Consulta a tu veterinario para confirmar el diagnóstico y recibir tratamiento adecuado.',
  requiereAtencionInmediata: false,
  prevencion: [
    'Mantén las vacunas al día.',
    'Lleva a tu mascota a chequeos veterinarios regulares.',
    'Proporciona una dieta balanceada y agua fresca diariamente.',
    'Mantén un ambiente limpio y libre de parásitos.',
  ],
  cuidados: [
    'Sigue las indicaciones del veterinario.',
    'Administra los medicamentos en las dosis y horarios indicados.',
    'Mantén al animal en reposo según lo recomendado.',
  ],
  queObservar: [
    'Cambios en el apetito o en la ingesta de agua.',
    'Variaciones en el comportamiento habitual.',
    'Aparición de nuevos síntomas o empeoramiento de los actuales.',
  ],
  nivelCuidado: 'medio',
  alimentosRecomendados: [
    'Alimento balanceado de buena calidad acorde a la especie y edad.',
    'Proteína magra cocida (pollo, pavo) en porciones moderadas.',
    'Agua fresca y limpia disponible en todo momento.',
  ],
  alimentosEvitar: [
    'Restos de comida humana, especialmente alimentos condimentados.',
    'Chocolate, uvas, pasas, cebolla, ajo y xilitol.',
    'Alimentos crudos sin supervisión veterinaria.',
  ],
};

const DB: Record<string, DiseaseInfo> = {
  /* ─── ALERGIAS ─────────────────────────────────────────────────────── */
  alergias_estacionales: {
    nombre: 'Alergias Estacionales',
    descripcion:
      'Reacción del sistema inmune ante alérgenos ambientales como polen, ácaros o moho. Se manifiesta principalmente en piel y ojos con picazón intensa, enrojecimiento y lagrimeo.',
    requiereAtencionInmediata: false,
    prevencion: [
      'Limpia regularmente el pelaje de tu mascota tras paseos.',
      'Usa purificadores de aire en el hogar.',
      'Evita zonas con alta concentración de polen en temporada alta.',
      'Consulta al veterinario para pruebas de alergia específica.',
    ],
    cuidados: [
      'Baños frecuentes con champú hipoalergénico.',
      'Antihistamínicos o corticoides indicados por el veterinario.',
      'Evitar el rascado excesivo para prevenir infecciones secundarias.',
    ],
    queObservar: [
      'Rascado persistente en cara, patas y abdomen.',
      'Enrojecimiento u ojos llorosos que empeoran en ciertas temporadas.',
      'Infecciones de piel recurrentes por rascado.',
    ],
    nivelCuidado: 'bajo',
    alimentosRecomendados: [
      'Dieta hipoalergénica con proteína novel (venado, pato o conejo).',
      'Alimento con ácidos grasos omega-3 (aceite de pescado) para salud de la piel.',
      'Alimento premium con proteína hidrolizada (bajo supervisión veterinaria).',
      'Frutas permitidas: manzana sin semillas, arándanos, sandía sin semillas.',
    ],
    alimentosEvitar: [
      'Pollo y res si se sospecha alergia alimentaria (proteínas comunes).',
      'Trigo, maíz y soja (cereales frecuentemente alergénicos).',
      'Lácteos y derivados.',
      'Alimentos procesados con conservantes y colorantes artificiales.',
    ],
  },

  alergias: {
    nombre: 'Reacción Alérgica',
    descripcion:
      'Respuesta del sistema inmune ante una sustancia externa. Puede manifestarse en piel, ojos o tracto respiratorio con síntomas variables según el alérgeno.',
    requiereAtencionInmediata: false,
    prevencion: [
      'Identifica y elimina el alérgeno del entorno.',
      'Mantén el hogar limpio y ventilado.',
      'Consulta al veterinario para identificar la causa específica.',
    ],
    cuidados: [
      'Tratamiento antihistamínico o corticoide según indicación médica.',
      'Monitorear posibles reacciones anafilácticas (dificultad respiratoria).',
      'Dieta de eliminación si se sospecha alergia alimentaria.',
    ],
    queObservar: [
      'Hinchazón facial o de mucosas (emergencia).',
      'Dificultad para respirar.',
      'Urticaria o ronchas en la piel.',
    ],
    nivelCuidado: 'medio',
    alimentosRecomendados: [
      'Dieta de eliminación: una sola proteína novel + un carbohidrato (p. ej. venado y papa).',
      'Alimento hipoalergénico comercial con proteína hidrolizada.',
      'Aceite de pescado como suplemento de omega-3 para la piel.',
      'Verduras cocidas: calabaza, zanahoria, calabacín.',
    ],
    alimentosEvitar: [
      'Proteínas comunes hasta descartar alergia alimentaria (pollo, res, huevo).',
      'Cereales con gluten (trigo, cebada).',
      'Lácteos en todas sus formas.',
      'Premios o snacks comerciales con múltiples ingredientes.',
    ],
  },

  /* ─── DERMATITIS ──────────────────────────────────────────────────── */
  dermatitis_atopica: {
    nombre: 'Dermatitis Atópica',
    descripcion:
      'Enfermedad inflamatoria crónica de la piel asociada a predisposición genética y respuesta exagerada ante alérgenos. Cursa con picazón crónica, eritema y lesiones cutáneas.',
    requiereAtencionInmediata: false,
    prevencion: [
      'Control ambiental de alérgenos (polvo, ácaros, hongos).',
      'Hidratación regular de la piel con productos veterinarios.',
      'Dieta formulada para piel sensible rica en omega-3.',
      'Evitar humedad excesiva en el área de descanso.',
    ],
    cuidados: [
      'Inmunoterapia específica (vacuna antialérgica) indicada por especialista.',
      'Esteroides tópicos o sistémicos para control de brotes.',
      'Champús medicados con clorhexidina o miconazol.',
      'Revisiones periódicas para evitar infecciones secundarias.',
    ],
    queObservar: [
      'Infecciones bacterianas o fúngicas sobre las lesiones.',
      'Otitis recurrente asociada a la alergia.',
      'Alopecia progresiva por rascado crónico.',
    ],
    nivelCuidado: 'medio',
    alimentosRecomendados: [
      'Alimento dermatológico rico en omega-3 y omega-6 (aceite de pescado, linaza).',
      'Proteína de fácil digestión: salmón, cordero o pato.',
      'Suplemento de biotina y zinc para regeneración de la piel.',
      'Calabaza cocida y batata como fuentes de fibra y vitamina A.',
    ],
    alimentosEvitar: [
      'Proteínas que puedan ser alérgenos (pollo, res, huevo si se sospecha reacción).',
      'Alimentos con colorantes y conservantes artificiales.',
      'Trigo y maíz (pueden empeorar la inflamación).',
      'Embutidos, frituras y restos de comida humana.',
    ],
  },

  dermatitis: {
    nombre: 'Dermatitis',
    descripcion:
      'Inflamación de la piel que puede tener múltiples causas: alérgica, por contacto, microbiana o parasitaria. Se caracteriza por enrojecimiento, picazón y lesiones cutáneas.',
    requiereAtencionInmediata: false,
    prevencion: [
      'Control antiparasitario regular (pulgas, garrapatas, sarna).',
      'Evitar contacto con sustancias irritantes.',
      'Mantener la higiene y el pelaje limpio y seco.',
    ],
    cuidados: [
      'Diagnóstico de la causa subyacente antes del tratamiento.',
      'Antibióticos o antifúngicos si hay infección secundaria.',
      'Elizabethan collar (collar isabelino) para evitar rascado.',
    ],
    queObservar: [
      'Extensión de las lesiones a nuevas zonas del cuerpo.',
      'Pus, costras amarillentas o mal olor (infección secundaria).',
      'Pérdida de apetito asociada al malestar.',
    ],
    nivelCuidado: 'medio',
    alimentosRecomendados: [
      'Dieta rica en ácidos grasos omega-3: salmón, sardinas cocidas.',
      'Alimento para piel sensible con proteína hidrolizada.',
      'Zanahoria y calabaza cocida (ricas en betacaroteno para la piel).',
      'Suplemento de aceite de pescado.',
    ],
    alimentosEvitar: [
      'Alimentos alergénicos comunes: pollo, res, maíz y trigo (hasta descartar alergia).',
      'Comida chatarra o restos de comida humana.',
      'Lácteos y derivados.',
      'Premios con colorantes artificiales.',
    ],
  },

  /* ─── GASTROENTERITIS ──────────────────────────────────────────────── */
  gastroenteritis: {
    nombre: 'Gastroenteritis',
    descripcion:
      'Inflamación del estómago e intestinos causada por virus, bacterias, parásitos o intoxicación. Cursa con vómitos, diarrea, anorexia y posible deshidratación.',
    requiereAtencionInmediata: false,
    prevencion: [
      'No ofrecer alimentos en mal estado o restos de comida humana.',
      'Control antiparasitario regular.',
      'Evitar cambios bruscos de dieta.',
      'Mantener el área de alimentación limpia.',
    ],
    cuidados: [
      'Dieta blanda (arroz con pollo hervido) durante 48-72 horas.',
      'Asegurar hidratación: ofrecer agua frecuentemente.',
      'Si hay sangre en heces o vómito, acudir al veterinario de inmediato.',
      'Probióticos para restablecer la flora intestinal.',
    ],
    queObservar: [
      'Signos de deshidratación (encías secas, piel sin elasticidad).',
      'Sangre en vómito o heces.',
      'Más de 5 episodios de vómito o diarrea en 24 horas.',
      'Distensión abdominal o dolor al palpar el abdomen.',
    ],
    nivelCuidado: 'medio',
    alimentosRecomendados: [
      'Dieta blanda: arroz blanco bien cocido con pollo hervido sin piel ni huesos.',
      'Caldo de pollo casero sin sal ni condimentos (tibio).',
      'Calabaza cocida (rica en fibra soluble, ayuda a regular las heces).',
      'Probióticos veterinarios para restaurar la flora intestinal.',
      'Agua de arroz como complemento hidratante.',
    ],
    alimentosEvitar: [
      'Alimentos grasos, frituras y embutidos.',
      'Lácteos (la lactosa empeora la diarrea).',
      'Huesos cocidos o crudos.',
      'Alimento seco normal hasta que remitan los síntomas.',
      'Restos de comida humana, especialmente condimentada.',
    ],
  },

  /* ─── PARVOVIROSIS ─────────────────────────────────────────────────── */
  parvovirosis: {
    nombre: 'Parvovirosis',
    descripcion:
      'Enfermedad viral altamente contagiosa causada por el Parvovirus canino. Ataca el sistema digestivo y el sistema inmune, provocando vómitos severos, diarrea hemorrágica y riesgo de muerte.',
    requiereAtencionInmediata: true,
    prevencion: [
      'Vacunación completa y refuerzos anuales.',
      'Evitar contacto con perros no vacunados.',
      'Desinfección del entorno con hipoclorito de sodio diluido.',
      'No llevar cachorros a lugares con alta densidad canina antes de completar la vacunación.',
    ],
    cuidados: [
      'Hospitalización inmediata: requiere fluidoterapia IV.',
      'Antibióticos para prevenir infecciones secundarias.',
      'Antieméticos y protectores gastrointestinales.',
      'Aislamiento estricto del animal infectado.',
    ],
    queObservar: [
      'Diarrea con sangre intensa y vómito incoercible.',
      'Decaimiento extremo y fiebre alta.',
      'Deshidratación severa en pocas horas.',
    ],
    nivelCuidado: 'critico',
    alimentosRecomendados: [
      'Ayuno inicial según indicación del veterinario hasta controlar vómitos.',
      'Reintroducción gradual con dieta blanda: arroz con pollo hervido en porciones muy pequeñas.',
      'Caldo de pollo casero sin sal para hidratación y estímulo del apetito.',
      'Alimento húmedo de alta digestibilidad (gastrointestinal veterinario).',
      'Suero oral veterinario para reponer electrolitos.',
    ],
    alimentosEvitar: [
      'Alimento seco convencional durante la recuperación (irrita el tracto digestivo).',
      'Lácteos y derivados.',
      'Alimentos grasos o con alto contenido de fibra insoluble.',
      'Huesos y golosinas comerciales.',
      'Cualquier alimento hasta que el veterinario autorice la realimentación.',
    ],
  },

  parvovirus: {
    nombre: 'Parvovirus',
    descripcion:
      'Enfermedad viral altamente contagiosa que afecta el tracto gastrointestinal. Sin tratamiento urgente puede ser fatal, especialmente en cachorros.',
    requiereAtencionInmediata: true,
    prevencion: [
      'Vacunación completa con refuerzos anuales.',
      'No permitir contacto con animales enfermos.',
      'Desinfectar superficies y comederos regularmente.',
    ],
    cuidados: [
      'Atención veterinaria urgente e inmediata.',
      'Fluidoterapia intravenosa para combatir la deshidratación.',
      'Antibioterapia y soporte nutricional.',
      'Cuarentena del animal infectado.',
    ],
    queObservar: [
      'Vómitos con sangre.',
      'Diarrea hemorrágica de olor fétido.',
      'Letargia extrema y colapso.',
    ],
    nivelCuidado: 'critico',
    alimentosRecomendados: [
      'Ayuno terapéutico hasta que el veterinario indique lo contrario.',
      'Dieta blanda gradual: arroz blanco con pollo hervido desmenuzado.',
      'Alimento húmedo gastrointestinal de prescripción veterinaria.',
      'Agua en pequeñas cantidades frecuentes o suero oral.',
    ],
    alimentosEvitar: [
      'Todo alimento sólido mientras persistan los vómitos.',
      'Leche y lácteos.',
      'Alimentos ricos en grasas.',
      'Premios o snacks comerciales durante la recuperación.',
    ],
  },

  /* ─── MOQUILLO / DISTEMPER ─────────────────────────────────────────── */
  moquillo: {
    nombre: 'Moquillo Canino',
    descripcion:
      'Enfermedad viral sistémica que afecta el sistema respiratorio, digestivo y nervioso. Altamente contagiosa, con alta tasa de mortalidad en animales no vacunados.',
    requiereAtencionInmediata: true,
    prevencion: [
      'Vacunación obligatoria desde cachorro con refuerzos anuales.',
      'Evitar contacto con animales callejeros o enfermos.',
      'Desinfectar regularmente el entorno del animal.',
    ],
    cuidados: [
      'No existe tratamiento específico antiviral: soporte sintomático.',
      'Hospitalización para control de síntomas neurológicos y respiratorios.',
      'Antibióticos para infecciones bacterianas secundarias.',
      'Aislamiento estricto para prevenir contagio.',
    ],
    queObservar: [
      'Convulsiones o movimientos involuntarios.',
      'Secreción nasal y ocular espesa amarillenta.',
      'Engrosamiento de almohadillas plantares (signo clásico).',
      'Neumonía secundaria.',
    ],
    nivelCuidado: 'critico',
    alimentosRecomendados: [
      'Alimento húmedo de alta digestibilidad y alto contenido calórico.',
      'Pollo hervido desmenuzado o carne magra cocida.',
      'Caldo de pollo tibio sin sal para estimular el apetito.',
      'Suplementos vitamínicos (especialmente vitaminas A, C y complejo B).',
      'Alimento blando si hay dificultad para tragar.',
    ],
    alimentosEvitar: [
      'Alimento seco duro si hay afectación respiratoria o dificultad para tragar.',
      'Lácteos (empeoran síntomas digestivos).',
      'Alimentos fríos que puedan empeorar la tos.',
      'Restos de comida humana condimentada.',
    ],
  },

  distemper: {
    nombre: 'Distemper (Moquillo)',
    descripcion:
      'Enfermedad viral multisistémica del perro con afectación respiratoria, digestiva y nerviosa. Requiere atención veterinaria urgente.',
    requiereAtencionInmediata: true,
    prevencion: [
      'Vacunación desde las 6-8 semanas de vida.',
      'Completar el esquema vacunal y mantener refuerzos.',
    ],
    cuidados: [
      'Tratamiento de soporte hospitalario.',
      'Control de convulsiones con anticonvulsivantes.',
      'Fisioterapia en secuelas neurológicas.',
    ],
    queObservar: [
      'Tics, temblores o parálisis progresiva.',
      'Dificultad respiratoria.',
      'Ceguera o alteraciones visuales.',
    ],
    nivelCuidado: 'critico',
    alimentosRecomendados: [
      'Dieta blanda altamente calórica para contrarrestar la pérdida de peso.',
      'Pollo o pavo hervido con arroz blanco.',
      'Suplemento de vitaminas del complejo B para soporte neurológico.',
      'Alimento húmedo de prescripción para recuperación.',
    ],
    alimentosEvitar: [
      'Alimento seco duro durante la fase aguda.',
      'Lácteos y derivados.',
      'Alimentos grasos o difíciles de digerir.',
      'Huesos de cualquier tipo.',
    ],
  },

  /* ─── LEISHMANIASIS ────────────────────────────────────────────────── */
  leishmaniasis: {
    nombre: 'Leishmaniasis',
    descripcion:
      'Enfermedad parasitaria transmitida por la picadura del flebótomo (mosquito de la arena). Afecta piel, ganglios, hígado, bazo y riñones. Crónica y de difícil erradicación.',
    requiereAtencionInmediata: false,
    prevencion: [
      'Usar collares o pipetas repelentes de flebótomos.',
      'Evitar paseos al amanecer y al atardecer (horas de mayor actividad del vector).',
      'Vacuna contra la leishmaniasis disponible en zonas endémicas.',
      'Instalar mosquiteras finas en el hogar.',
    ],
    cuidados: [
      'Tratamiento largo con antimoniales o miltefosina bajo supervisión veterinaria.',
      'Controles analíticos periódicos (función renal y hepática).',
      'Protección solar si hay lesiones cutáneas.',
      'Tratamiento de por vida en muchos casos.',
    ],
    queObservar: [
      'Pérdida de peso progresiva y masa muscular.',
      'Lesiones en el morro (nariz), orejas o almohadillas.',
      'Crecimiento exagerado de uñas (onicogriposis).',
      'Epistaxis (sangrado nasal) o uveítis (inflamación ocular).',
    ],
    nivelCuidado: 'alto',
    alimentosRecomendados: [
      'Dieta renal baja en fósforo si hay daño renal (consultada con el veterinario).',
      'Alimento con proteína de alta calidad y fácil digestión (salmón, pavo).',
      'Aceite de pescado (omega-3) para reducir la inflamación.',
      'Antioxidantes naturales: arándanos, espinaca cocida (pequeñas cantidades).',
    ],
    alimentosEvitar: [
      'Dietas con exceso de proteína si hay insuficiencia renal.',
      'Alimentos altos en fósforo: vísceras, sardinas enlatadas.',
      'Restos de comida humana con sal y condimentos.',
      'Golosinas comerciales de baja calidad.',
    ],
  },

  /* ─── LEPTOSPIROSIS ────────────────────────────────────────────────── */
  leptospirosis: {
    nombre: 'Leptospirosis',
    descripcion:
      'Enfermedad bacteriana zoonótica (transmisible a humanos) que afecta hígado, riñones y otros órganos. Se contagia por orina de animales infectados o agua contaminada.',
    requiereAtencionInmediata: true,
    prevencion: [
      'Vacunación anual contra leptospira.',
      'Evitar que la mascota beba de charcos o ríos estancados.',
      'Controlar roedores en el entorno.',
      'No permitir el contacto con orina de animales desconocidos.',
    ],
    cuidados: [
      'Hospitalización con fluidoterapia y antibioterapia IV (penicilina o doxiciclina).',
      'Soporte renal y hepático intensivo.',
      'Medidas de bioseguridad para el personal que cuida al animal (zoonosis).',
    ],
    queObservar: [
      'Orina de color oscuro (cola) o reducción drástica de orina.',
      'Ictericia (piel y mucosas amarillentas).',
      'Dolor muscular intenso y fiebre alta.',
    ],
    nivelCuidado: 'critico',
    alimentosRecomendados: [
      'Dieta blanda de fácil digestión: arroz con pollo hervido.',
      'Alimento hepático/renal veterinario según órgano más afectado.',
      'Hidratación abundante con agua fresca o suero oral.',
      'Pequeñas porciones frecuentes para no sobrecargar el hígado.',
    ],
    alimentosEvitar: [
      'Dieta alta en proteínas (sobrecarga hepática y renal).',
      'Alimentos grasos y embutidos.',
      'Vísceras (hígado, riñón) y carnes rojas en exceso.',
      'Alimentos con sal añadida.',
    ],
  },

  /* ─── INSUFICIENCIA RENAL ──────────────────────────────────────────── */
  insuficiencia_renal: {
    nombre: 'Insuficiencia Renal',
    descripcion:
      'Pérdida progresiva de la función filtratoria de los riñones. Puede ser aguda (por tóxicos o infección) o crónica (degenerativa). Frecuente en animales mayores.',
    requiereAtencionInmediata: false,
    prevencion: [
      'Asegurar ingesta de agua abundante diariamente.',
      'Evitar medicamentos nefrotóxicos sin supervisión veterinaria.',
      'Dieta con control de fósforo y proteína en animales predispuestos.',
      'Controles analíticos anuales en animales mayores de 7 años.',
    ],
    cuidados: [
      'Dieta renal especial baja en fósforo y proteínas.',
      'Fluidoterapia para mantener la función renal.',
      'Medicamentos para controlar la hipertensión y proteinuria.',
      'Monitoreo frecuente de creatinina y BUN en sangre.',
    ],
    queObservar: [
      'Incremento marcado en consumo de agua y orina.',
      'Pérdida de peso y masa muscular progresiva.',
      'Vómitos matutinos frecuentes.',
      'Ulceras bucales o aliento urémico (olor a amoníaco).',
    ],
    nivelCuidado: 'alto',
    alimentosRecomendados: [
      'Alimento renal veterinario bajo en fósforo y proteína controlada (Hill\'s k/d, Royal Canin Renal).',
      'Arroz blanco cocido como fuente de carbohidratos de fácil digestión.',
      'Clara de huevo cocida (proteína de alta calidad con poco fósforo).',
      'Aceite de pescado (omega-3) para proteger los riñones.',
      'Agua fresca abundante en todo momento.',
    ],
    alimentosEvitar: [
      'Alimentos ricos en fósforo: vísceras (hígado, riñón), huesos, sardinas.',
      'Exceso de proteína animal (carne roja, embutidos).',
      'Alimentos con sal añadida o sodio elevado.',
      'Leche y quesos (altos en fósforo y proteína).',
      'Comida humana con condimentos.',
    ],
  },

  falla_renal: {
    nombre: 'Falla Renal',
    descripcion:
      'Deterioro grave de la función renal que impide la eliminación adecuada de desechos metabólicos. Requiere manejo veterinario continuo.',
    requiereAtencionInmediata: true,
    prevencion: [
      'Hidratación constante y dieta adecuada.',
      'Evitar plantas tóxicas para los riñones (lirios, uvas para gatos).',
      'Revisiones bioquímicas periódicas.',
    ],
    cuidados: [
      'Fluidoterapia IV urgente.',
      'Dieta renal estricta.',
      'Posible diálisis en casos graves.',
    ],
    queObservar: [
      'Anuria (sin producción de orina).',
      'Convulsiones o coma urémico.',
      'Edema generalizado.',
    ],
    nivelCuidado: 'critico',
    alimentosRecomendados: [
      'Alimento renal de prescripción veterinaria (bajo en fósforo y proteína moderada).',
      'Clara de huevo cocida como fuente proteica de alta calidad.',
      'Arroz blanco y batata cocida como carbohidratos seguros.',
      'Suplemento de omega-3 (aceite de pescado) para protección renal.',
    ],
    alimentosEvitar: [
      'Carnes rojas y vísceras en exceso (alto fósforo y nitrógeno).',
      'Huesos, sardinas y alimentos ricos en minerales.',
      'Alimentos con mucha sal.',
      'Uvas, pasas y lirios (tóxicos para los riñones, especialmente en gatos).',
    ],
  },

  /* ─── DIABETES ─────────────────────────────────────────────────────── */
  diabetes_mellitus: {
    nombre: 'Diabetes Mellitus',
    descripcion:
      'Trastorno metabólico caracterizado por niveles elevados de glucosa en sangre debido a deficiencia o resistencia a la insulina. Frecuente en perros y gatos mayores, especialmente con sobrepeso.',
    requiereAtencionInmediata: false,
    prevencion: [
      'Mantener el peso ideal con dieta balanceada y ejercicio.',
      'Esterilización en gatas para reducir el riesgo de diabetes gestacional.',
      'Controles glucémicos periódicos en animales de riesgo.',
      'Evitar el exceso de hidratos de carbono en la dieta.',
    ],
    cuidados: [
      'Insulinoterapia subcutánea diaria (la dosis la fija el veterinario).',
      'Dieta específica para diabéticos con horario fijo de comidas.',
      'Monitoreo de glucosa en casa con glucómetro veterinario.',
      'Revisiones veterinarias cada 3-6 meses.',
    ],
    queObservar: [
      'Hipoglucemia: temblores, debilidad, convulsiones (emergencia).',
      'Cetoacidosis diabética: vómitos, aliento a manzana, depresión (emergencia).',
      'Cataratas de desarrollo rápido en perros diabéticos.',
      'Infecciones urinarias recurrentes.',
    ],
    nivelCuidado: 'alto',
    alimentosRecomendados: [
      'Alimento para diabéticos veterinario alto en fibra y bajo en carbohidratos simples.',
      'Proteína magra: pollo, pavo o pescado cocido sin piel.',
      'Verduras bajas en almidón: brócoli, judías verdes, calabacín (cocidos).',
      'Comidas en horarios fijos y porciones medidas (coincidiendo con la insulina).',
    ],
    alimentosEvitar: [
      'Alimentos ricos en azúcares y carbohidratos simples (pan, galletas, arroz blanco).',
      'Frutas con alto índice glucémico: uvas, plátano maduro, dátiles.',
      'Premios comerciales con azúcar o jarabe de maíz.',
      'Alimento semi-húmedo (contiene mucho azúcar como conservante).',
      'Comidas irregulares o fuera de horario.',
    ],
  },

  diabetes: {
    nombre: 'Diabetes',
    descripcion:
      'Desregulación del metabolismo de la glucosa que requiere manejo veterinario permanente con insulina y dieta controlada.',
    requiereAtencionInmediata: false,
    prevencion: [
      'Control de peso y dieta balanceada.',
      'Ejercicio regular y moderado.',
      'Análisis de sangre anuales en animales mayores.',
    ],
    cuidados: [
      'Insulina según dosis veterinaria.',
      'Comidas en horarios fijos.',
      'Registro diario del comportamiento y apetito.',
    ],
    queObservar: [
      'Episodios de debilidad o pérdida de consciencia.',
      'Cambios bruscos en el apetito.',
      'Infecciones frecuentes.',
    ],
    nivelCuidado: 'alto',
    alimentosRecomendados: [
      'Dieta alta en fibra y baja en carbohidratos simples.',
      'Proteína de calidad: pollo, pescado blanco cocido.',
      'Verduras cocidas: judías verdes, calabacín, brócoli.',
      'Alimento diabético comercial de prescripción veterinaria.',
    ],
    alimentosEvitar: [
      'Azúcares, dulces y alimentos con jarabe de maíz.',
      'Pan, galletas y harinas refinadas.',
      'Frutas muy dulces (uvas, plátano).',
      'Comida humana procesada.',
    ],
  },

  /* ─── HIPOTIROIDISMO ───────────────────────────────────────────────── */
  hipotiroidismo: {
    nombre: 'Hipotiroidismo',
    descripcion:
      'Producción insuficiente de hormonas tiroideas. Común en perros de mediana y avanzada edad. Causa lentitud metabólica, aumento de peso, letargia y cambios en el pelaje.',
    requiereAtencionInmediata: false,
    prevencion: [
      'No hay prevención específica; control con análisis de T4 a partir de los 5 años.',
      'Dieta equilibrada para evitar obesidad asociada.',
    ],
    cuidados: [
      'Levotiroxina oral de por vida (hormona tiroidea sintética).',
      'Control analítico cada 6 meses para ajustar dosis.',
      'Dieta hipocalórica si hay sobrepeso.',
    ],
    queObservar: [
      'Alopecia simétrica bilateral sin picazón.',
      'Intolerancia al frío y búsqueda constante de calor.',
      'Engrosamiento y consistencia pastosa de la piel (mixedema).',
      'Bradicardia (pulso lento).',
    ],
    nivelCuidado: 'medio',
    alimentosRecomendados: [
      'Dieta hipocalórica alta en proteína para control de peso.',
      'Alimento con L-carnitina para favorecer el metabolismo de las grasas.',
      'Pescado cocido (rico en yodo natural y omega-3).',
      'Verduras bajas en calorías: calabacín, judías verdes, pepino.',
    ],
    alimentosEvitar: [
      'Alimentos altos en calorías y grasas (engorda fácilmente).',
      'Exceso de carbohidratos: arroz blanco, pan, galletas.',
      'Premios calóricos en exceso.',
      'Soja en grandes cantidades (puede interferir con la absorción de tiroxina).',
    ],
  },

  /* ─── HIPERTIROIDISMO ──────────────────────────────────────────────── */
  hipertiroidismo: {
    nombre: 'Hipertiroidismo',
    descripcion:
      'Exceso de producción de hormonas tiroideas. La causa más frecuente en gatos es un adenoma tiroideo benigno. Provoca hiperactividad, pérdida de peso y problemas cardíacos.',
    requiereAtencionInmediata: false,
    prevencion: [
      'Sin prevención conocida; revisiones anuales en gatos mayores de 8 años.',
      'Dietas bajas en yodo pueden retardar la progresión.',
    ],
    cuidados: [
      'Metimazol (antitiiroideo) oral o tópico en oídos.',
      'Cirugía (tiroidectomía) o tratamiento con yodo radioactivo.',
      'Control de la presión arterial si hay hipertensión asociada.',
      'Revisión cardiológica para descartar miocardiopatía.',
    ],
    queObservar: [
      'Pérdida de peso pese a apetito voraz.',
      'Vómitos crónicos y diarrea.',
      'Pelaje descuidado o áspero.',
      'Hipertensión y problemas oculares secundarios.',
    ],
    nivelCuidado: 'alto',
    alimentosRecomendados: [
      'Dieta baja en yodo (Hill\'s y/d) como alternativa o complemento al tratamiento médico.',
      'Alimento altamente calórico para contrarrestar la pérdida de peso.',
      'Proteína de alta calidad: pollo, pavo, conejo cocido.',
      'Porciones más frecuentes y más pequeñas.',
    ],
    alimentosEvitar: [
      'Alimentos ricos en yodo: pescado, mariscos, algas.',
      'Leche y derivados lácteos (contienen yodo).',
      'Alimentos con sal yodada.',
      'Comida humana con condimentos.',
    ],
  },

  /* ─── CONJUNTIVITIS ────────────────────────────────────────────────── */
  conjuntivitis: {
    nombre: 'Conjuntivitis',
    descripcion:
      'Inflamación de la conjuntiva (membrana que recubre el ojo) por infección, alergia o irritante. Muy frecuente en perros y gatos. Cursa con secreción, enrojecimiento y molestia ocular.',
    requiereAtencionInmediata: false,
    prevencion: [
      'Mantener el área periocular limpia y seca.',
      'Evitar corrientes de aire directo en los ojos.',
      'Vacunación adecuada (la herpesvirosis felina causa conjuntivitis crónica).',
      'Tratamiento oportuno de infecciones respiratorias en gatos.',
    ],
    cuidados: [
      'Limpieza de secreciones con suero fisiológico estéril.',
      'Colirio antibiótico o antiviral según la causa.',
      'Evitar que el animal se frote los ojos.',
      'Seguimiento hasta resolución completa.',
    ],
    queObservar: [
      'Secreción purulenta amarillo-verdosa (infección bacteriana).',
      'Opacidad o nube en la córnea (úlcera, urgencia).',
      'Tercer párpado prominente persistente.',
      'Fotofobia marcada o lagrimeo excesivo.',
    ],
    nivelCuidado: 'bajo',
    alimentosRecomendados: [
      'Dieta balanceada rica en vitamina A para salud ocular: zanahoria, batata cocida.',
      'Alimento con omega-3 (aceite de pescado) para reducir inflamación.',
      'Alimento de buena calidad acorde a la especie.',
      'Arándanos (antioxidantes para salud ocular) en pequeñas cantidades.',
    ],
    alimentosEvitar: [
      'Alimentos alergénicos si la conjuntivitis es de origen alérgico.',
      'Comida humana procesada y con conservantes.',
      'Lácteos (pueden empeorar la secreción en animales sensibles).',
    ],
  },

  /* ─── OTITIS ───────────────────────────────────────────────────────── */
  otitis: {
    nombre: 'Otitis',
    descripcion:
      'Inflamación del canal auditivo externo, medio o interno. Causada por bacterias, hongos (Malassezia), parásitos (ácaros) o cuerpos extraños. Muy común en razas con orejas caídas.',
    requiereAtencionInmediata: false,
    prevencion: [
      'Limpieza semanal del canal auditivo con limpiador veterinario.',
      'Secar bien las orejas tras baños o nados.',
      'Control antiparasitario regular.',
      'Revisión de orejas en cada visita veterinaria.',
    ],
    cuidados: [
      'Limpieza profunda del canal auditivo por el veterinario.',
      'Gotas óticas antibióticas, antifúngicas o antiparasitarias según etiología.',
      'Tratamiento de la enfermedad subyacente (alergia, hipotiroidismo).',
      'Evitar introducir objetos en el oído.',
    ],
    queObservar: [
      'Inclinación persistente de la cabeza hacia un lado (otitis media/interna).',
      'Pérdida de equilibrio o caminar en círculos.',
      'Sangrado o mal olor intenso del oído.',
      'Rascado compulsivo que causa heridas.',
    ],
    nivelCuidado: 'medio',
    alimentosRecomendados: [
      'Dieta hipoalergénica si la otitis es de origen alérgico.',
      'Alimento rico en omega-3 y omega-6 para salud de piel y mucosas.',
      'Probióticos para fortalecer el sistema inmunitario.',
      'Alimento de buena calidad sin cereales si hay sospecha de alergia.',
    ],
    alimentosEvitar: [
      'Alimentos alergénicos: trigo, maíz, pollo (si se sospecha alergia como causa).',
      'Azúcares y carbohidratos simples (favorecen proliferación de levaduras como Malassezia).',
      'Lácteos.',
      'Premios con colorantes y conservantes artificiales.',
    ],
  },

  /* ─── ARTRITIS ─────────────────────────────────────────────────────── */
  artritis: {
    nombre: 'Artritis / Artrosis',
    descripcion:
      'Degeneración progresiva del cartílago articular que causa inflamación, dolor y limitación del movimiento. Común en perros grandes y animales senior.',
    requiereAtencionInmediata: false,
    prevencion: [
      'Controlar el peso para reducir la carga sobre las articulaciones.',
      'Ejercicio regular y moderado (natación es ideal).',
      'Suplementos de condroitina y glucosamina desde edad media.',
      'Camas ortopédicas y rampas para evitar saltar.',
    ],
    cuidados: [
      'Antiinflamatorios no esteroideos (AINEs) veterinarios.',
      'Fisioterapia y rehabilitación física.',
      'Acupuntura veterinaria como complemento.',
      'Cirugía articular en casos avanzados.',
    ],
    queObservar: [
      'Cojera que empeora tras el reposo o con el frío.',
      'Dificultad para subir/bajar escaleras o saltar.',
      'Crujidos articulares al mover la extremidad.',
      'Lamido excesivo de una articulación.',
    ],
    nivelCuidado: 'medio',
    alimentosRecomendados: [
      'Alimento para articulaciones con glucosamina y condroitina incluidos.',
      'Aceite de pescado (omega-3) como antiinflamatorio natural.',
      'Proteína magra de calidad: pollo, pavo, pescado cocido.',
      'Alimento control de peso si hay sobrepeso (menos carga articular).',
      'Mejillón de labio verde (suplemento natural para articulaciones).',
    ],
    alimentosEvitar: [
      'Alimentos altos en calorías que promuevan el sobrepeso.',
      'Cereales inflamatorios en exceso (trigo, maíz).',
      'Premios calóricos y golosinas en exceso.',
      'Alimentos con exceso de sodio (promueven retención de líquidos).',
    ],
  },

  /* ─── EPILEPSIA ────────────────────────────────────────────────────── */
  epilepsia: {
    nombre: 'Epilepsia',
    descripcion:
      'Trastorno neurológico crónico caracterizado por crisis convulsivas recurrentes de causa cerebral. Puede ser idiopática (genética) o secundaria a otra enfermedad.',
    requiereAtencionInmediata: false,
    prevencion: [
      'No existe prevención en epilepsia idiopática.',
      'Tratar las causas subyacentes (tumores, hidrocefalia, toxinas).',
      'Evitar desencadenantes identificados: estrés, luces estroboscópicas.',
    ],
    cuidados: [
      'Anticonvulsivantes de por vida (fenobarbital, bromuro de potasio).',
      'Registro del diario de crisis para ajustar dosis.',
      'Análisis hepáticos periódicos (fenobarbital es hepatotóxico a largo plazo).',
      'Ambiente seguro: sin bordes afilados ni escaleras sin protección.',
    ],
    queObservar: [
      'Status epilepticus: convulsión mayor a 5 minutos o series sin recuperación (emergencia).',
      'Cluster seizures: más de 2 convulsiones en 24 horas.',
      'Cambios en el comportamiento entre convulsiones.',
      'Pérdida de visión o desorientación post-ictal prolongada.',
    ],
    nivelCuidado: 'alto',
    alimentosRecomendados: [
      'Dieta cetogénica veterinaria (alta en grasa, baja en carbohidratos) bajo supervisión.',
      'Alimento con ácidos grasos de cadena media (MCT) que tienen efecto anticonvulsivante.',
      'Aceite de coco (fuente de MCT) en pequeñas cantidades.',
      'Alimento de alta calidad con proteína de fácil digestión.',
    ],
    alimentosEvitar: [
      'Alimentos con rosemary extract (romero) en altas concentraciones (puede ser proconvulsivante).',
      'Exceso de carbohidratos simples y azúcares.',
      'Chocolate y cafeína (tóxicos y proconvulsivantes).',
      'Cambios bruscos de dieta que generen estrés metabólico.',
    ],
  },

  epilepsia_canina: {
    nombre: 'Epilepsia Canina',
    descripcion:
      'Forma idiopática de epilepsia más frecuente en perros de raza pura. Generalmente se manifiesta entre los 1 y 5 años de edad. Requiere tratamiento médico de por vida.',
    requiereAtencionInmediata: false,
    prevencion: [
      'Sin prevención en la forma idiopática hereditaria.',
      'Evitar parejas reproductoras con antecedentes de epilepsia en razas predispuestas.',
    ],
    cuidados: [
      'Medicación anticonvulsivante diaria sin omitir dosis.',
      'Cámara de vigilancia nocturna para detectar crisis nocturnas.',
      'Identificar y evitar factores desencadenantes.',
    ],
    queObservar: [
      'Convulsiones en racimo (cluster).',
      'Comportamiento errático o agresión post-ictal.',
      'Pérdida de consciencia sin recuperación rápida.',
    ],
    nivelCuidado: 'alto',
    alimentosRecomendados: [
      'Dieta con aceite de coco o MCT (ácidos grasos de cadena media) como suplemento.',
      'Alimento alto en grasa buena y bajo en carbohidratos (cetogénico veterinario).',
      'Proteína de calidad: salmón, pollo, pavo.',
      'Comidas regulares y en horario fijo para mantener niveles estables de glucosa.',
    ],
    alimentosEvitar: [
      'Azúcares y carbohidratos refinados (picos de glucosa pueden desencadenar crisis).',
      'Alimentos con extracto de romero en altas cantidades.',
      'Chocolate, café y cualquier fuente de cafeína.',
      'Aditivos y conservantes artificiales en exceso.',
    ],
  },

  /* ─── NEUMONÍA ─────────────────────────────────────────────────────── */
  neumonia: {
    nombre: 'Neumonía',
    descripcion:
      'Inflamación del parénquima pulmonar causada por bacterias, virus, hongos o aspiración. Produce fiebre, tos productiva, dificultad respiratoria y decaimiento marcado.',
    requiereAtencionInmediata: true,
    prevencion: [
      'Vacunación contra agentes respiratorios (Bordetella, moquillo, adenovirus).',
      'Evitar que el animal aspire vómito o líquidos.',
      'Tratar oportunamente infecciones respiratorias leves.',
      'Ambientes cálidos y sin corrientes de aire en animales debilitados.',
    ],
    cuidados: [
      'Antibioterapia de amplio espectro.',
      'Nebulización y fisioterapia respiratoria.',
      'Oxigenoterapia si hay hipoxia.',
      'Hospitalización en casos graves.',
    ],
    queObservar: [
      'Cianosis (mucosas azuladas): emergencia respiratoria.',
      'Frecuencia respiratoria mayor a 40 rpm en reposo.',
      'Tos con secreción verdosa o con sangre.',
      'Fiebre superior a 39.5°C.',
    ],
    nivelCuidado: 'critico',
    alimentosRecomendados: [
      'Alimento húmedo altamente calórico y palatable para mantener la energía.',
      'Pollo hervido desmenuzado o carne magra cocida en porciones pequeñas.',
      'Caldo de pollo tibio sin sal para hidratar y estimular el apetito.',
      'Suplemento de vitamina C y E como soporte inmunológico.',
    ],
    alimentosEvitar: [
      'Alimento seco duro (puede causar tos e incomodidad).',
      'Alimentos fríos (empeoran la tos).',
      'Lácteos (aumentan producción de mucosidad).',
      'Alimentos que generen polvo o migas (riesgo de aspiración).',
    ],
  },

  neumonia_bacteriana: {
    nombre: 'Neumonía Bacteriana',
    descripcion:
      'Infección bacteriana del pulmón que requiere tratamiento antibiótico sistémico urgente. Puede comprometer gravemente la función respiratoria.',
    requiereAtencionInmediata: true,
    prevencion: [
      'Vacunación completa.',
      'Evitar el contacto con animales enfermos.',
      'Atención temprana de infecciones de vías respiratorias altas.',
    ],
    cuidados: [
      'Antibióticos IV o IM en fase aguda.',
      'Fluidoterapia y soporte nutricional.',
      'Radiografía de seguimiento para confirmar resolución.',
    ],
    queObservar: [
      'Empeoramiento brusco de la respiración.',
      'Cianosis o mucosas pálidas.',
      'Colapso o pérdida de consciencia.',
    ],
    nivelCuidado: 'critico',
    alimentosRecomendados: [
      'Alimento húmedo de alta energía para evitar pérdida de peso.',
      'Proteína de alta calidad: pollo, pavo, pescado cocido.',
      'Caldo de huesos tibio sin sal para hidratación.',
      'Suplemento vitamínico (complejo B y vitamina C).',
    ],
    alimentosEvitar: [
      'Alimento seco crujiente durante la fase aguda.',
      'Lácteos (aumentan mucosidad).',
      'Alimentos con polvo o migas finas.',
      'Comida fría directa del refrigerador.',
    ],
  },

  /* ─── HEPATITIS ────────────────────────────────────────────────────── */
  hepatitis: {
    nombre: 'Hepatitis',
    descripcion:
      'Inflamación hepática que puede ser viral, tóxica, autoinmune o parasitaria. Afecta la síntesis de proteínas, la detoxificación y la producción de bilis.',
    requiereAtencionInmediata: false,
    prevencion: [
      'Vacunación contra hepatitis infecciosa canina (adenovirus).',
      'Evitar intoxicaciones por plantas tóxicas, medicamentos sin prescripción o micotoxinas.',
      'Control antiparasitario regular (Leishmania, Ehrlichia).',
    ],
    cuidados: [
      'Dieta hepática baja en proteínas y sodio.',
      'Hepatoprotectores (ácido ursodesoxicólico, silimarina).',
      'Corticoides en hepatitis autoinmune.',
      'Controles analíticos (ALT, AST, bilirrubina) cada 3 meses.',
    ],
    queObservar: [
      'Ictericia (piel, mucosas y escleras amarillentas).',
      'Ascitis (acumulación de líquido en abdomen).',
      'Encefalopatía hepática: desorientación, andar en círculos, presión de cabeza.',
      'Orina oscura como té.',
    ],
    nivelCuidado: 'alto',
    alimentosRecomendados: [
      'Alimento hepático veterinario bajo en proteína y sodio (Hill\'s l/d, Royal Canin Hepatic).',
      'Arroz blanco cocido como fuente de carbohidratos fáciles de metabolizar.',
      'Proteína de alta calidad en cantidades controladas: clara de huevo, pollo.',
      'Verduras cocidas: calabaza, zanahoria (fuentes de vitaminas sin sobrecargar el hígado).',
    ],
    alimentosEvitar: [
      'Exceso de proteínas animales (generan amoníaco que el hígado no puede procesar).',
      'Carnes rojas y vísceras.',
      'Alimentos grasos y embutidos.',
      'Alimentos con cobre añadido (tóxico para hígados dañados, especialmente en ciertas razas).',
      'Comida humana con sal y condimentos.',
    ],
  },

  /* ─── PANCREATITIS ─────────────────────────────────────────────────── */
  pancreatitis: {
    nombre: 'Pancreatitis',
    descripcion:
      'Inflamación del páncreas que puede ser aguda o crónica. Las enzimas pancreáticas se activan prematuramente y dañan el propio órgano. Muy dolorosa y potencialmente grave.',
    requiereAtencionInmediata: true,
    prevencion: [
      'Evitar alimentos grasos, restos de comida humana y embutidos.',
      'No administrar corticoides sin supervisión veterinaria.',
      'Control del peso en animales obesos.',
      'Evitar cambios bruscos de dieta.',
    ],
    cuidados: [
      'Ayuno terapéutico de 24-48 horas seguido de dieta hipograsa.',
      'Fluidoterapia IV para hidratación y analgesia.',
      'Antieméticos y analgésicos potentes.',
      'Dieta pancreática de por vida en forma crónica.',
    ],
    queObservar: [
      'Posición de rezo (pecho en el suelo, cuartos traseros elevados): dolor abdominal severo.',
      'Vómito incoercible.',
      'Fiebre elevada y abdomen rígido al tacto.',
      'Ictericia si hay afectación del conducto biliar.',
    ],
    nivelCuidado: 'critico',
    alimentosRecomendados: [
      'Dieta ultra baja en grasa de prescripción veterinaria (Hill\'s i/d Low Fat).',
      'Pechuga de pollo hervida sin piel ni grasa.',
      'Arroz blanco bien cocido en porciones pequeñas.',
      'Clara de huevo cocida (proteína sin grasa).',
      'Calabaza cocida (fibra suave y baja en grasa).',
    ],
    alimentosEvitar: [
      'Cualquier alimento graso: embutidos, piel de pollo, tocino, mantequilla.',
      'Restos de comida humana (principal causa de pancreatitis en perros).',
      'Aceites y grasas añadidas.',
      'Lácteos enteros (altos en grasa).',
      'Alimento comercial con más del 10% de grasa.',
    ],
  },

  /* ─── ANEMIA ────────────────────────────────────────────────────────── */
  anemia: {
    nombre: 'Anemia',
    descripcion:
      'Reducción en la cantidad de glóbulos rojos o hemoglobina, disminuyendo la capacidad de transporte de oxígeno. Puede ser regenerativa (responde a tratamiento) o no regenerativa.',
    requiereAtencionInmediata: false,
    prevencion: [
      'Control antiparasitario para prevenir anemia por pulgas o garrapatas.',
      'Dieta nutritiva y completa.',
      'Evitar intoxicaciones por cebolla, ajo o paracetamol (hemolíticos).',
    ],
    cuidados: [
      'Tratamiento de la causa subyacente (parásitos, enfermedad crónica, toxinas).',
      'Transfusión sanguínea en anemia grave.',
      'Suplemento de hierro, vitamina B12 o eritropoyetina según el tipo.',
    ],
    queObservar: [
      'Mucosas blancas o muy pálidas: requiere valoración urgente.',
      'Colapso al mínimo esfuerzo.',
      'Orina color vino tinto (hemolisis masiva: emergencia).',
      'Taquicardia y soplo cardiaco funcional por la anemia.',
    ],
    nivelCuidado: 'alto',
    alimentosRecomendados: [
      'Hígado de pollo o res cocido en pequeñas cantidades (rico en hierro y B12).',
      'Carne roja magra cocida (fuente de hierro hemo de fácil absorción).',
      'Sardinas cocidas sin sal (hierro y vitamina B12).',
      'Alimento premium rico en hierro y vitaminas del complejo B.',
      'Huevo cocido (fuente de hierro y proteína).',
    ],
    alimentosEvitar: [
      'Cebolla y ajo en cualquier forma (destruyen los glóbulos rojos).',
      'Paracetamol (especialmente tóxico en gatos, causa hemólisis).',
      'Lácteos (el calcio interfiere con la absorción de hierro).',
      'Uvas y pasas (tóxicas para perros).',
    ],
  },

  /* ─── LEUCEMIA FELINA ──────────────────────────────────────────────── */
  leucemia_felina: {
    nombre: 'Leucemia Felina (FeLV)',
    descripcion:
      'Infección retroviral crónica exclusiva de gatos que suprime el sistema inmune y puede causar tumores linfoides. Transmisible entre gatos por saliva, leche y contacto estrecho.',
    requiereAtencionInmediata: false,
    prevencion: [
      'Vacunación contra FeLV en gatos con acceso al exterior o contacto con otros gatos.',
      'Test de detección antes de introducir un nuevo gato en el hogar.',
      'Mantener a los gatos FeLV+ en interior y separados de gatos sanos.',
    ],
    cuidados: [
      'No existe tratamiento curativo: manejo paliativo y de calidad de vida.',
      'Inmunoestimulantes e interferón felino como apoyo.',
      'Tratamiento de infecciones oportunistas.',
      'Controles cada 3-6 meses para detectar complicaciones.',
    ],
    queObservar: [
      'Linfomas: masas en cuello, abdomen o mediastino.',
      'Anemia severa no regenerativa.',
      'Infecciones recurrentes por inmunosupresión.',
      'Pérdida de peso acelerada.',
    ],
    nivelCuidado: 'alto',
    alimentosRecomendados: [
      'Alimento premium altamente calórico y palatable para evitar pérdida de peso.',
      'Proteína de alta calidad y fácil digestión: pollo, pavo, salmón.',
      'Suplemento de omega-3 para soporte inmunológico.',
      'Antioxidantes: vitamina E y selenio en la dieta.',
      'Alimento húmedo si hay úlceras orales o anorexia.',
    ],
    alimentosEvitar: [
      'Carne cruda o alimentos sin cocinar (alto riesgo de infección por sistema inmune debilitado).',
      'Lácteos no pasteurizados.',
      'Alimento de baja calidad o restos de comida humana.',
      'Alimentos con conservantes y aditivos que sobrecarguen el sistema.',
    ],
  },

  leucemia: {
    nombre: 'Leucemia',
    descripcion:
      'Enfermedad oncohematológica que afecta la producción de células sanguíneas en la médula ósea. Requiere diagnóstico especializado y manejo oncológico.',
    requiereAtencionInmediata: false,
    prevencion: [
      'Vacunación (FeLV en gatos).',
      'Controles analíticos periódicos en animales adultos.',
    ],
    cuidados: [
      'Quimioterapia según protocolo veterinario oncológico.',
      'Soporte nutricional y control de infecciones.',
      'Seguimiento hematológico frecuente.',
    ],
    queObservar: [
      'Hemorragias espontáneas (petequias, equimosis).',
      'Ganglios linfáticos muy aumentados.',
      'Debilidad extrema y palidez de mucosas.',
    ],
    nivelCuidado: 'critico',
    alimentosRecomendados: [
      'Dieta altamente calórica y palatable para combatir la caquexia (pérdida de masa).',
      'Proteína de alta calidad: pollo, pescado, huevo cocido.',
      'Omega-3 (aceite de pescado) con propiedades antitumorales.',
      'Alimento húmedo si hay dificultad para comer.',
    ],
    alimentosEvitar: [
      'Carne y alimentos crudos (riesgo de infección por inmunosupresión).',
      'Carbohidratos simples en exceso (las células tumorales consumen glucosa).',
      'Alimentos de baja calidad nutricional.',
      'Conservantes y colorantes artificiales.',
    ],
  },

  /* ─── FIP / PERITONITIS INFECCIOSA FELINA ──────────────────────────── */
  peritonitis_infecciosa_felina: {
    nombre: 'Peritonitis Infecciosa Felina (FIP)',
    descripcion:
      'Enfermedad viral grave causada por una mutación del coronavirus felino. Puede presentarse en forma húmeda (ascitis/efusión pleural) o seca (granulomas en órganos). Hasta hace poco considerada fatal.',
    requiereAtencionInmediata: true,
    prevencion: [
      'Reducir estrés en hogares multigatunos.',
      'Cuarentena de gatos nuevos antes de integrarlos.',
      'Higiene estricta de bandejas sanitarias.',
    ],
    cuidados: [
      'GS-441524 (antiviral) es el tratamiento más eficaz disponible actualmente.',
      'Tratamiento de soporte: drenaje de efusiones, corticoides.',
      'Manejo veterinario especializado en medicina felina.',
    ],
    queObservar: [
      'Abdomen muy distendido con líquido (forma húmeda).',
      'Dificultad respiratoria por líquido pleural.',
      'Síntomas neurológicos: convulsiones, ataxia.',
      'Fiebre persistente sin respuesta a antibióticos.',
    ],
    nivelCuidado: 'critico',
    alimentosRecomendados: [
      'Alimento húmedo altamente calórico y palatable (el gato suele perder apetito).',
      'Proteína de alta calidad y fácil digestión: pollo, pavo.',
      'Estimulantes del apetito naturales: calentar el alimento para intensificar el aroma.',
      'Suplemento de vitaminas B y antioxidantes.',
    ],
    alimentosEvitar: [
      'Alimento crudo (sistema inmune comprometido).',
      'Lácteos y derivados.',
      'Alimentos difíciles de digerir o con mucha fibra insoluble.',
      'Comida humana procesada.',
    ],
  },

  fip: {
    nombre: 'FIP (Peritonitis Infecciosa Felina)',
    descripcion:
      'Enfermedad grave causada por mutación del coronavirus felino. Afecta exclusivamente a gatos y puede comprometer múltiples órganos.',
    requiereAtencionInmediata: true,
    prevencion: [
      'Reducir hacinamiento y estrés en hogares con varios gatos.',
      'Higiene estricta del entorno.',
    ],
    cuidados: [
      'Tratamiento antiviral específico (GS-441524).',
      'Control veterinario especializado continuo.',
      'Soporte nutricional y control de síntomas.',
    ],
    queObservar: [
      'Distensión abdominal brusca.',
      'Ictericia y dificultad para respirar.',
      'Deterioro neurológico progresivo.',
    ],
    nivelCuidado: 'critico',
    alimentosRecomendados: [
      'Alimento húmedo de alta palatabilidad y densidad calórica.',
      'Proteína de calidad: pollo, salmón cocido.',
      'Calentar el alimento para mejorar aroma y apetito.',
      'Omega-3 para soporte inmunológico.',
    ],
    alimentosEvitar: [
      'Carne cruda y alimentos sin pasteurizar.',
      'Lácteos.',
      'Alimento seco si el gato tiene dificultad para comer.',
      'Alimentos de baja calidad.',
    ],
  },

  /* ─── PANLEUCOPENIA ────────────────────────────────────────────────── */
  panleucopenia: {
    nombre: 'Panleucopenia Felina',
    descripcion:
      'Enfermedad viral muy contagiosa del gato (equivalente al parvovirus canino). Afecta el tracto gastrointestinal y la médula ósea. Alta mortalidad en gatitos no vacunados.',
    requiereAtencionInmediata: true,
    prevencion: [
      'Vacunación obligatoria desde las 6-8 semanas.',
      'Desinfección del entorno con hipoclorito de sodio.',
      'Cuarentena de gatos recién llegados.',
    ],
    cuidados: [
      'Hospitalización urgente con fluidoterapia IV.',
      'Tratamiento de soporte: antieméticos, antibióticos, nutrición.',
      'Aislamiento estricto para evitar contagios.',
    ],
    queObservar: [
      'Diarrea hemorrágica y vómitos incoercibles.',
      'Mucosas pálidas y deshidratación grave.',
      'Colapso y temperatura corporal baja (hipotermia).',
    ],
    nivelCuidado: 'critico',
    alimentosRecomendados: [
      'Ayuno hasta que el veterinario autorice la realimentación.',
      'Reintroducción gradual con dieta blanda: pollo hervido con arroz en cantidades mínimas.',
      'Alimento húmedo gastrointestinal de prescripción veterinaria.',
      'Suero oral o caldo de pollo sin sal para rehidratación.',
    ],
    alimentosEvitar: [
      'Todo alimento sólido mientras persistan los vómitos.',
      'Lácteos.',
      'Alimentos grasos o pesados.',
      'Alimento crudo (sistema inmune devastado).',
    ],
  },

  /* ─── RINOTRAQUEITIS ───────────────────────────────────────────────── */
  rinotraqueitis: {
    nombre: 'Rinotraqueítis Viral Felina',
    descripcion:
      'Infección del tracto respiratorio superior del gato causada por el Herpesvirus felino tipo 1. Muy contagiosa y con tendencia a la recaída por latencia viral.',
    requiereAtencionInmediata: false,
    prevencion: [
      'Vacunación trivalente (FHV-1, FCV, FPV) desde cachorro.',
      'Minimizar el estrés que reactiva el virus latente.',
      'Separar gatos enfermos de sanos en hogares multigatunos.',
    ],
    cuidados: [
      'Antivirales (famciclovir) en episodios graves.',
      'Antibióticos para infecciones bacterianas secundarias.',
      'Limpiar secreciones oculares y nasales con suero fisiológico.',
      'Nebulización para fluidificar secreciones.',
    ],
    queObservar: [
      'Estornudos frecuentes con secreción verdosa.',
      'Úlceras corneales (queratitis herpética): urgencia oftálmica.',
      'Pérdida de apetito por obstrucción nasal.',
      'Fiebre persistente mayor a 39.5°C.',
    ],
    nivelCuidado: 'medio',
    alimentosRecomendados: [
      'Alimento húmedo muy aromático (calentado) para estimular el apetito pese a congestión nasal.',
      'Proteína de alta calidad: pollo, atún cocido, salmón.',
      'Suplemento de lisina (aminoácido que ayuda a combatir el herpesvirus felino).',
      'Caldo de pollo tibio sin sal para hidratar y estimular el olfato.',
    ],
    alimentosEvitar: [
      'Alimento seco solo (el gato pierde olfato y no se interesa).',
      'Alimentos fríos (reducen palatabilidad).',
      'Lácteos (aumentan mucosidad).',
      'Alimento con arginina en exceso (puede favorecer al herpesvirus, consultar al veterinario).',
    ],
  },

  /* ─── CALICIVIRUS ──────────────────────────────────────────────────── */
  calicivirus: {
    nombre: 'Calicivirus Felino',
    descripcion:
      'Infección viral que afecta el tracto respiratorio superior y la cavidad oral del gato. Causa úlceras orales, estornudos y, en cepas virulentas sistémicas, puede ser grave.',
    requiereAtencionInmediata: false,
    prevencion: [
      'Vacunación trivalente felina (incluye calicivirus).',
      'Higiene de comederos y bebederos.',
      'Evitar contacto con gatos con síntomas respiratorios.',
    ],
    cuidados: [
      'Tratamiento sintomático: antinflamatorios, analgésicos.',
      'Cuidados de las úlceras orales.',
      'Soporte nutricional si hay anorexia por dolor al comer.',
      'Antibióticos si hay coinfección bacteriana.',
    ],
    queObservar: [
      'Cepas virulentas sistémicas: edema facial, fiebre alta, ictericia (emergencia).',
      'Úlceras extensas en lengua que impiden comer.',
      'Neumonía secundaria.',
    ],
    nivelCuidado: 'medio',
    alimentosRecomendados: [
      'Alimento húmedo blando o paté (evita dolor por úlceras bucales).',
      'Caldo de pollo tibio licuado para alimentación cuando hay úlceras graves.',
      'Alimento húmedo de alta palatabilidad calentado para estimular apetito.',
      'Suplemento de vitaminas A y C para regeneración de mucosas.',
    ],
    alimentosEvitar: [
      'Alimento seco crujiente (irrita las úlceras y causa dolor al comer).',
      'Alimentos ácidos o cítricos.',
      'Comida fría (reduce palatabilidad y causa molestia).',
      'Alimentos duros como huesos o premios crocantes.',
    ],
  },

  /* ─── RABIA ─────────────────────────────────────────────────────────── */
  rabia: {
    nombre: 'Rabia',
    descripcion:
      'Enfermedad viral del sistema nervioso central, zoonótica y siempre mortal una vez con síntomas. Transmitida por mordedura de animales infectados. De reporte obligatorio.',
    requiereAtencionInmediata: true,
    prevencion: [
      'Vacunación antirrábica obligatoria anual por ley.',
      'Evitar contacto con animales silvestres.',
      'Reportar cualquier mordedura de animal desconocido a las autoridades sanitarias.',
    ],
    cuidados: [
      'No existe tratamiento efectivo una vez con síntomas clínicos.',
      'Cuarentena legal obligatoria del animal sospechoso.',
      'Contactar inmediatamente a las autoridades de salud pública.',
    ],
    queObservar: [
      'Cambios drásticos de comportamiento: agresión o mansedumbre inusual.',
      'Dificultad para tragar (hidrofobia en algunas especies).',
      'Parálisis progresiva ascendente.',
      'Manotazos al aire o convulsiones.',
    ],
    nivelCuidado: 'critico',
    alimentosRecomendados: [
      'No aplica: la rabia una vez con síntomas clínicos es mortal y no tiene tratamiento.',
      'Durante la cuarentena (animal sospechoso sin síntomas): dieta habitual balanceada.',
      'Agua fresca disponible en todo momento.',
    ],
    alimentosEvitar: [
      'No aplica tratamiento dietético para la rabia.',
      'Si el animal está en cuarentena: evitar alimentos crudos y restos humanos.',
    ],
  },

  /* ─── DIABETES MELLITUS (canina / felina) ──────────────────────────── */
  diabetes_mellitus_canina: {
    nombre: 'Diabetes Mellitus Canina',
    descripcion:
      'Trastorno metabólico causado por deficiencia de insulina. El cuerpo no puede usar la glucosa de la sangre como energía, así que la orina y bebe en exceso mientras pierde peso pese a comer más. Frecuente en perros de mediana edad con sobrepeso.',
    requiereAtencionInmediata: false,
    prevencion: [
      'Mantener el peso ideal con dieta balanceada y ejercicio regular.',
      'Controles glucémicos periódicos a partir de los 7 años.',
      'Evitar el exceso de carbohidratos y premios calóricos.',
    ],
    cuidados: [
      'Insulinoterapia subcutánea diaria (la dosis la fija el veterinario).',
      'Dieta específica para diabéticos con horarios de comida fijos.',
      'Monitoreo de glucosa en casa con glucómetro veterinario.',
      'Revisiones veterinarias cada 3-6 meses.',
    ],
    queObservar: [
      'Hipoglucemia: temblores, debilidad, convulsiones (emergencia).',
      'Cetoacidosis diabética: vómitos, aliento dulzón, decaimiento (emergencia).',
      'Cataratas de desarrollo rápido.',
      'Infecciones urinarias recurrentes.',
    ],
    nivelCuidado: 'alto',
    alimentosRecomendados: [
      'Alimento para diabéticos alto en fibra y bajo en carbohidratos simples (Hill\'s w/d, Royal Canin Diabetic).',
      'Proteína magra: pollo, pavo o pescado cocido.',
      'Verduras bajas en almidón: brócoli, judías verdes, calabacín.',
      'Comidas en horarios fijos y porciones medidas (coincidiendo con la insulina).',
    ],
    alimentosEvitar: [
      'Alimentos con azúcares añadidos y carbohidratos simples.',
      'Frutas con alto índice glucémico: uvas, plátano maduro.',
      'Premios comerciales con jarabe de maíz o azúcar.',
      'Alimento semi-húmedo (contiene azúcar como conservante).',
      'Comidas irregulares o fuera de horario (descontrolan la glucosa).',
    ],
  },

  diabetes_mellitus_felina: {
    nombre: 'Diabetes Mellitus Felina',
    descripcion:
      'Trastorno metabólico por deficiencia o resistencia a la insulina, muy asociado a la obesidad felina. El gato bebe y orina en exceso, come más de lo normal y pierde peso progresivamente.',
    requiereAtencionInmediata: false,
    prevencion: [
      'Control estricto del peso: la obesidad es el principal factor de riesgo en gatos.',
      'Dieta baja en carbohidratos y alta en proteína.',
      'Controles de glucosa en gatos mayores de 8 años.',
    ],
    cuidados: [
      'Insulinoterapia subcutánea según pauta veterinaria.',
      'Dieta felina específica para diabéticos.',
      'Curvas de glucosa periódicas para ajustar la dosis.',
      'En algunos casos puede lograrse remisión con control estricto temprano.',
    ],
    queObservar: [
      'Debilidad en los cuartos traseros (neuropatía diabética).',
      'Hipoglucemia: temblores, desorientación (emergencia).',
      'Pérdida de peso pese a comer bien.',
      'Letargo marcado o falta de aseo.',
    ],
    nivelCuidado: 'alto',
    alimentosRecomendados: [
      'Dieta felina alta en proteína y baja en carbohidratos (lo opuesto a la dieta canina).',
      'Alimento húmedo para diabéticos (suele tener menos carbohidratos que el seco).',
      'Proteína animal de calidad: pollo, pavo, pescado.',
      'Comidas en horarios fijos y porciones controladas.',
    ],
    alimentosEvitar: [
      'Alimento seco con alto porcentaje de cereales y carbohidratos.',
      'Premios con azúcar o almidón.',
      'Leche y lácteos (lactosa = azúcar).',
      'Comida humana, especialmente dulces y pan.',
      'Alimento semi-húmedo comercial (alto en azúcares).',
    ],
  },

  /* ─── HIPOTIROIDISMO CANINO ─────────────────────────────────────────── */
  hipotiroidismo_canino: {
    nombre: 'Hipotiroidismo Canino',
    descripcion:
      'Producción insuficiente de hormonas tiroideas. Muy común en perros de mediana y avanzada edad. Causa lentitud metabólica: aumento de peso sin comer más, letargo y pelaje deslucido.',
    requiereAtencionInmediata: false,
    prevencion: [
      'No hay prevención específica; control con análisis de T4 a partir de los 5 años.',
      'Dieta equilibrada para evitar la obesidad asociada.',
    ],
    cuidados: [
      'Levotiroxina oral de por vida (hormona tiroidea sintética).',
      'Control analítico cada 6 meses para ajustar la dosis.',
      'Dieta hipocalórica si hay sobrepeso.',
    ],
    queObservar: [
      'Alopecia simétrica bilateral sin picazón.',
      'Intolerancia al frío y búsqueda constante de calor.',
      'Piel engrosada o de aspecto pastoso (mixedema).',
      'Aumento de peso sin cambio en la dieta.',
    ],
    nivelCuidado: 'medio',
    alimentosRecomendados: [
      'Alimento control de peso con L-carnitina para metabolismo de grasas.',
      'Proteína magra de calidad: pescado blanco, pollo sin piel.',
      'Verduras bajas en calorías: judías verdes, calabacín, pepino.',
      'Aceite de pescado para salud de piel y pelaje.',
    ],
    alimentosEvitar: [
      'Alimentos hipercalóricos (el perro engorda con facilidad).',
      'Exceso de carbohidratos: arroz blanco, pan, pasta.',
      'Premios calóricos y golosinas frecuentes.',
      'Soja en grandes cantidades (puede interferir con la levotiroxina).',
    ],
  },

  /* ─── CUSHING CANINO (hiperadrenocorticismo) ───────────────────────── */
  cushing_canino: {
    nombre: 'Enfermedad de Cushing Canina',
    descripcion:
      'Exceso crónico de cortisol, casi siempre por un tumor hipofisario o adrenal benigno. Provoca sed y micción excesivas, apetito voraz, abdomen péndulo y jadeo, con adelgazamiento de la piel y pérdida de pelo.',
    requiereAtencionInmediata: false,
    prevencion: [
      'No tiene prevención conocida; diagnóstico temprano con análisis hormonales específicos.',
      'Evitar el uso prolongado de corticoides sin supervisión (causa Cushing iatrogénico).',
    ],
    cuidados: [
      'Tratamiento con trilostano o mitotano según indicación veterinaria.',
      'Control hormonal periódico (test de ACTH) para ajustar dosis.',
      'Cirugía en casos de tumor adrenal localizado.',
    ],
    queObservar: [
      'Abdomen distendido y péndulo ("panza de Cushing").',
      'Jadeo excesivo incluso en reposo.',
      'Piel fina, frágil o con moretones fáciles.',
      'Infecciones urinarias recurrentes por orina diluida.',
    ],
    nivelCuidado: 'alto',
    alimentosRecomendados: [
      'Dieta moderada en grasas y alta en proteína de calidad para mantener masa muscular.',
      'Alimento con antioxidantes (vitaminas E y C).',
      'Verduras cocidas: brócoli, calabaza, espinaca (en moderación).',
      'Alimento control de peso si hay obesidad asociada.',
    ],
    alimentosEvitar: [
      'Alimentos con exceso de sal (el Cushing ya causa retención de líquidos).',
      'Dietas altas en grasas.',
      'Premios calóricos (el apetito voraz hace que pida más comida, no ceder).',
      'Comida humana procesada y embutidos.',
    ],
  },

  /* ─── OSTEOARTRITIS CANINA ──────────────────────────────────────────── */
  osteoartritis_canina: {
    nombre: 'Osteoartritis Canina',
    descripcion:
      'Degeneración progresiva y crónica del cartílago articular, distinta de la displasia de cadera (que es de origen congénito): aquí el desgaste se acumula con la edad o el uso. Causa rigidez, cojera y dolor sin fiebre.',
    requiereAtencionInmediata: false,
    prevencion: [
      'Controlar el peso para reducir la carga sobre las articulaciones.',
      'Ejercicio regular y moderado (la natación es ideal).',
      'Suplementos de condroitina y glucosamina desde edad media.',
      'Camas ortopédicas y rampas para evitar saltos.',
    ],
    cuidados: [
      'Antiinflamatorios no esteroideos (AINEs) veterinarios.',
      'Fisioterapia y rehabilitación física.',
      'Acupuntura veterinaria como complemento.',
      'Cirugía articular en casos avanzados.',
    ],
    queObservar: [
      'Rigidez marcada al levantarse que mejora al caminar.',
      'Cojera que empeora con el frío o tras el reposo.',
      'Dificultad para subir/bajar escaleras o saltar.',
      'Lamido excesivo de una articulación.',
    ],
    nivelCuidado: 'medio',
    alimentosRecomendados: [
      'Alimento para articulaciones con glucosamina y condroitina incorporados.',
      'Aceite de pescado (omega-3) como antiinflamatorio natural.',
      'Mejillón de labio verde (suplemento natural para cartílago).',
      'Alimento control de peso con L-carnitina si hay sobrepeso.',
      'Cúrcuma en pequeñas cantidades como antiinflamatorio natural (consultar con el veterinario).',
    ],
    alimentosEvitar: [
      'Alimentos altos en calorías que favorezcan el sobrepeso.',
      'Cereales proinflamatorios en exceso (trigo, maíz).',
      'Premios calóricos frecuentes.',
      'Alimentos con exceso de sodio (favorecen retención de líquidos e inflamación).',
    ],
  },

  /* ─── INSUFICIENCIA CARDÍACA CONGESTIVA CANINA ─────────────────────── */
  insuficiencia_cardiaca_canina: {
    nombre: 'Insuficiencia Cardíaca Congestiva Canina',
    descripcion:
      'El corazón pierde la capacidad de bombear sangre eficazmente, generando acumulación de líquido en pulmones o abdomen. Frecuente en perros mayores y en razas pequeñas con enfermedad valvular degenerativa.',
    requiereAtencionInmediata: true,
    prevencion: [
      'Chequeos cardíacos anuales en razas predispuestas (Cavalier King Charles, Poodle, Dachshund).',
      'Control del peso para no sobrecargar el corazón.',
      'Ejercicio moderado y constante, evitando el sedentarismo extremo.',
    ],
    cuidados: [
      'Tratamiento con diuréticos, IECA y pimobendán según indicación veterinaria.',
      'Dieta baja en sodio.',
      'Control estricto del ejercicio: ni exceso ni sedentarismo.',
      'Ecocardiografías periódicas para seguimiento.',
    ],
    queObservar: [
      'Tos nocturna o tras el reposo (signo de alarma temprana).',
      'Respiración rápida o dificultosa incluso en reposo.',
      'Desmayos o debilidad tras el ejercicio.',
      'Encías azuladas (cianosis): emergencia inmediata.',
    ],
    nivelCuidado: 'critico',
    alimentosRecomendados: [
      'Alimento cardíaco veterinario bajo en sodio (Hill\'s h/d, Royal Canin Cardiac).',
      'Proteína de alta calidad para mantener masa muscular: pollo, pescado cocido.',
      'Omega-3 (aceite de pescado) con efecto cardioprotector.',
      'Taurina y L-carnitina como suplementos (especialmente en razas predispuestas).',
    ],
    alimentosEvitar: [
      'Alimentos con alto contenido de sal/sodio (embutidos, quesos, comida humana).',
      'Premios comerciales salados.',
      'Agua en exceso no controlado (puede empeorar la retención de líquidos, seguir indicación del veterinario).',
      'Alimento seco convencional con alto sodio.',
    ],
  },

  /* ─── PANCREATITIS CANINA ───────────────────────────────────────────── */
  pancreatitis_canina: {
    nombre: 'Pancreatitis Canina',
    descripcion:
      'Inflamación del páncreas, aguda o crónica, en la que las enzimas pancreáticas se activan prematuramente y dañan el propio órgano. Muy dolorosa y potencialmente grave, a menudo desencadenada por comidas grasas.',
    requiereAtencionInmediata: true,
    prevencion: [
      'Evitar alimentos grasos, restos de comida humana y embutidos.',
      'No administrar corticoides sin supervisión veterinaria.',
      'Control del peso en animales obesos.',
      'Evitar cambios bruscos de dieta.',
    ],
    cuidados: [
      'Ayuno terapéutico breve seguido de dieta hipograsa.',
      'Fluidoterapia IV para hidratación y analgesia.',
      'Antieméticos y analgésicos potentes.',
      'Dieta pancreática de por vida si se cronifica.',
    ],
    queObservar: [
      'Posición de rezo (pecho en el suelo, cuartos traseros elevados): dolor abdominal severo.',
      'Vómito incoercible.',
      'Fiebre elevada y abdomen rígido al tacto.',
      'Decaimiento marcado y rechazo total del alimento.',
    ],
    nivelCuidado: 'critico',
    alimentosRecomendados: [
      'Dieta ultra baja en grasa: Hill\'s i/d Low Fat o Royal Canin Gastrointestinal Low Fat.',
      'Pechuga de pollo hervida sin piel ni grasa, desmenuzada.',
      'Arroz blanco cocido en porciones pequeñas.',
      'Clara de huevo cocida (proteína pura sin grasa).',
      'Calabaza cocida (fibra soluble y baja en grasa).',
    ],
    alimentosEvitar: [
      'Cualquier alimento graso: embutidos, piel de pollo, tocino, queso, mantequilla.',
      'Restos de comida humana (la causa #1 de pancreatitis en perros).',
      'Aceites y grasas añadidas.',
      'Yema de huevo (alta en grasa).',
      'Alimento comercial con más del 10% de grasa.',
    ],
  },

  /* ─── HIPERTIROIDISMO FELINO ────────────────────────────────────────── */
  hipertiroidismo_felino: {
    nombre: 'Hipertiroidismo Felino',
    descripcion:
      'Exceso de hormonas tiroideas, casi siempre por un adenoma tiroideo benigno. Muy común en gatos mayores de 8 años. Provoca hiperactividad, adelgazamiento pese a comer más y puede derivar en problemas cardíacos.',
    requiereAtencionInmediata: false,
    prevencion: [
      'Sin prevención conocida; revisiones anuales en gatos mayores de 8 años.',
      'Palpación del cuello en cada visita veterinaria.',
    ],
    cuidados: [
      'Metimazol (antitiroideo) oral o en gel tópico para el oído.',
      'Tratamiento con yodo radioactivo (cura definitiva) o cirugía.',
      'Control de la presión arterial y revisión cardiológica periódica.',
      'Dieta terapéutica baja en yodo como alternativa en algunos casos.',
    ],
    queObservar: [
      'Pérdida de peso pese a apetito voraz (signo más característico).',
      'Hiperactividad, maullidos excesivos o irritabilidad.',
      'Vómitos o diarrea ocasionales.',
      'Pelaje deslucido o falta de aseo.',
    ],
    nivelCuidado: 'alto',
    alimentosRecomendados: [
      'Dieta baja en yodo como tratamiento complementario (Hill\'s y/d Thyroid Care).',
      'Alimento altamente calórico para compensar la pérdida de peso.',
      'Proteína de alta calidad: pollo, pavo, conejo.',
      'Porciones pequeñas y frecuentes para mantener la energía.',
    ],
    alimentosEvitar: [
      'Alimentos ricos en yodo: pescado, mariscos, algas marinas.',
      'Leche y derivados lácteos (contienen yodo).',
      'Alimentos con sal yodada.',
      'Premios comerciales que contengan pescado o marisco.',
    ],
  },

  /* ─── ENFERMEDAD PERIODONTAL FELINA ─────────────────────────────────── */
  enfermedad_periodontal_felina: {
    nombre: 'Enfermedad Periodontal Felina',
    descripcion:
      'Inflamación e infección de las encías y estructuras que sostienen los dientes, por acumulación de sarro. Extremadamente común en gatos adultos y puede volverse dolorosa al punto de impedir la alimentación normal.',
    requiereAtencionInmediata: false,
    prevencion: [
      'Cepillado dental regular con pasta veterinaria.',
      'Alimentos y premios formulados para el control de sarro.',
      'Limpiezas dentales profesionales periódicas bajo anestesia.',
    ],
    cuidados: [
      'Limpieza dental profesional con extracción de piezas dañadas si es necesario.',
      'Antibióticos si hay infección activa.',
      'Analgésicos para el manejo del dolor oral.',
      'Dieta blanda temporal durante la recuperación.',
    ],
    queObservar: [
      'Mal aliento marcado y persistente.',
      'Babeo excesivo o sangrado de encías.',
      'Rechazo al alimento seco o dejar caer la comida al masticar.',
      'Encías muy rojas o inflamadas, a veces con pus.',
    ],
    nivelCuidado: 'medio',
    alimentosRecomendados: [
      'Alimento húmedo o paté durante la recuperación post-limpieza.',
      'Alimento dental diseñado para reducir sarro (Royal Canin Dental, Hill\'s t/d).',
      'Proteína blanda: pollo hervido desmenuzado, pescado cocido sin espinas.',
      'Premios dentales veterinarios para mantenimiento.',
    ],
    alimentosEvitar: [
      'Alimento seco duro durante la fase aguda de dolor o post-extracción.',
      'Huesos cocidos o crudos (riesgo de fractura dental).',
      'Alimentos pegajosos que se adhieran a los dientes.',
      'Dulces y alimentos con azúcar (favorecen la placa bacteriana).',
    ],
  },

  /* ─── CONJUNTIVITIS FELINA ──────────────────────────────────────────── */
  conjuntivitis_felina: {
    nombre: 'Conjuntivitis Felina',
    descripcion:
      'Inflamación de la conjuntiva (membrana que recubre el ojo), muy frecuente en gatos por infecciones virales (herpesvirus felino), bacterianas o alérgicas. Cursa con secreción, enrojecimiento y molestia ocular, generalmente sin fiebre ni compromiso respiratorio.',
    requiereAtencionInmediata: false,
    prevencion: [
      'Vacunación adecuada (el herpesvirus felino es la causa más común de conjuntivitis recurrente).',
      'Mantener el área periocular limpia y seca.',
      'Reducir el estrés en gatos con brotes recurrentes de herpesvirus.',
    ],
    cuidados: [
      'Limpieza de secreciones con suero fisiológico estéril.',
      'Colirio antibiótico o antiviral según la causa.',
      'Evitar que el gato se frote los ojos (collar isabelino si es necesario).',
      'Seguimiento hasta resolución completa.',
    ],
    queObservar: [
      'Secreción purulenta amarillo-verdosa (infección bacteriana).',
      'Opacidad o nube en la córnea (úlcera, urgencia).',
      'Tercer párpado prominente persistente.',
      'Si aparece tos, estornudos o fiebre, podría tratarse de rinotraqueitis viral felina en vez de conjuntivitis simple.',
    ],
    nivelCuidado: 'bajo',
    alimentosRecomendados: [
      'Dieta rica en vitamina A para salud ocular: hígado de pollo cocido (moderación), zanahoria.',
      'Suplemento de lisina si la causa es herpesvirus felino.',
      'Alimento con omega-3 para reducir la inflamación.',
      'Alimento de buena calidad para fortalecer el sistema inmune.',
    ],
    alimentosEvitar: [
      'Alimentos alergénicos si la conjuntivitis es de origen alérgico.',
      'Comida procesada de baja calidad.',
      'Lácteos (pueden empeorar secreciones).',
      'Exceso de hígado (hipervitaminosis A es tóxica).',
    ],
  },
};

/** Ficha de la guía de Salud (pestaña 3), con solo los campos que se usan aquí. */
export interface HealthGuideEntry {
  displayName: string;
  description: string;
  urgency: 'baja' | 'media' | 'alta' | 'critica';
  symptoms: { name: string }[];
  prevention: string[];
  homeCare: string[];
  whenToVet: string;
}

const URGENCY_TO_CARE: Record<HealthGuideEntry['urgency'], DiseaseInfo['nivelCuidado']> = {
  baja: 'bajo', media: 'medio', alta: 'alto', critica: 'critico',
};

function fromHealthGuide(g: HealthGuideEntry): DiseaseInfo {
  return {
    nombre: g.displayName,
    descripcion: g.description,
    requiereAtencionInmediata: g.urgency === 'alta' || g.urgency === 'critica',
    prevencion: g.prevention,
    cuidados: g.homeCare,
    queObservar: [...g.symptoms.map((s) => s.name), g.whenToVet],
    nivelCuidado: URGENCY_TO_CARE[g.urgency],
    // La guía no trae recomendaciones de alimentación por enfermedad.
    alimentosRecomendados: DEFAULT.alimentosRecomendados,
    alimentosEvitar: DEFAULT.alimentosEvitar,
  };
}

/**
 * Ficha para la pantalla de resultado. No todas las enfermedades que el
 * modelo puede predecir tienen ficha propia aquí; para esas se usa la de la
 * guía de Salud (que sí cubre todas) antes de caer en la genérica.
 */
export function getDiseaseInfo(diagnostico: string, guide?: HealthGuideEntry): DiseaseInfo {
  const key = diagnostico.toLowerCase().replace(/\s+/g, '_');
  return DB[key] ?? (guide ? fromHealthGuide(guide) : DEFAULT);
}
