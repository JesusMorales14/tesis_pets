export interface DiseaseInfo {
  nombre: string;
  descripcion: string;
  requiereAtencionInmediata: boolean;
  prevencion: string[];
  cuidados: string[];
  queObservar: string[];
  nivelCuidado: 'bajo' | 'medio' | 'alto' | 'critico';
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
  },
};

export function getDiseaseInfo(diagnostico: string): DiseaseInfo {
  const key = diagnostico.toLowerCase().replace(/\s+/g, '_');
  return DB[key] ?? DEFAULT;
}
