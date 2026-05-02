export type Species = 'perro' | 'gato' | 'ambos';
export type Urgency = 'baja' | 'media' | 'alta' | 'critica';
export type Category =
  | 'infeccioso'
  | 'parasitario'
  | 'respiratorio'
  | 'digestivo'
  | 'dermatologico'
  | 'ortopedico'
  | 'renal'
  | 'cardiaco'
  | 'toxicologico';

export interface Symptom {
  name: string;
  severity: 'leve' | 'moderada' | 'grave';
}

export interface Disease {
  id: string;
  displayName: string;
  species: Species;
  category: Category;
  categoryLabel: string;
  categoryColor: string;
  icon: string;
  urgency: Urgency;
  contagious: boolean;
  shortDescription: string;
  description: string;
  symptoms: Symptom[];
  prevention: string[];
  treatment: string[];
  homeCare: string[];
  whenToVet: string;
}

export interface CareSection {
  icon: string;
  color: string;
  title: string;
  subtitle: string;
  species: Species;
  tips: string[];
}

const C: Record<Category, { label: string; color: string }> = {
  infeccioso:    { label: 'Infeccioso',    color: '#e05b5b' },
  parasitario:   { label: 'Parasitario',   color: '#8f5be0' },
  respiratorio:  { label: 'Respiratorio',  color: '#5b8af7' },
  digestivo:     { label: 'Digestivo',     color: '#f7a55b' },
  dermatologico: { label: 'Dermatológico', color: '#2dbe7a' },
  ortopedico:    { label: 'Ortopédico',    color: '#5bc4e0' },
  renal:         { label: 'Renal',         color: '#e0c75b' },
  cardiaco:      { label: 'Cardíaco',      color: '#e05b8f' },
  toxicologico:  { label: 'Toxicológico',  color: '#7b7b7b' },
};

function cat(c: Category): { categoryLabel: string; categoryColor: string } {
  return { categoryLabel: C[c].label, categoryColor: C[c].color };
}

export const DISEASES: Disease[] = [
  // ── PERRO ──────────────────────────────────────────────────────────────
  {
    id: 'parvovirus',
    displayName: 'Parvovirus Canino',
    species: 'perro',
    category: 'infeccioso',
    ...cat('infeccioso'),
    icon: 'bug-outline',
    urgency: 'critica',
    contagious: true,
    shortDescription: 'Virus letal que destruye el sistema digestivo e inmune del perro.',
    description:
      'El parvovirus canino es una enfermedad viral altamente contagiosa que ataca el tracto gastrointestinal y la médula ósea. Sin tratamiento puede ser mortal en 48–72 horas. Se transmite a través de heces contaminadas y superficies, siendo los cachorros no vacunados los más vulnerables.',
    symptoms: [
      { name: 'Vómitos frecuentes', severity: 'grave' },
      { name: 'Diarrea con sangre', severity: 'grave' },
      { name: 'Letargo severo', severity: 'grave' },
      { name: 'Fiebre alta', severity: 'moderada' },
      { name: 'Pérdida total de apetito', severity: 'moderada' },
      { name: 'Deshidratación rápida', severity: 'grave' },
      { name: 'Dolor abdominal', severity: 'moderada' },
    ],
    prevention: [
      'Vacunar con el esquema completo de Parvo (DA2PP) desde las 6–8 semanas.',
      'Evitar parques o zonas con perros desconocidos hasta completar la vacunación.',
      'Desinfectar el ambiente con hipoclorito de sodio diluido (1:30).',
      'No compartir comederos, juguetes ni accesorios con perros no vacunados.',
      'Realizar refuerzos anuales según indicación del veterinario.',
    ],
    treatment: [
      'Hospitalización inmediata con fluidoterapia intravenosa para combatir la deshidratación.',
      'Antibióticos para prevenir infecciones bacterianas secundarias.',
      'Antieméticos para controlar los vómitos y permitir la hidratación.',
      'Nutrición enteral o parenteral según tolerancia del paciente.',
      'Monitoreo constante de electrolitos, temperatura y estado de conciencia.',
    ],
    homeCare: [
      'El tratamiento en casa NO es recomendado — esta enfermedad requiere hospitalización.',
      'Una vez dado de alta, ofrecer agua frecuentemente en pequeñas cantidades.',
      'Dieta blanda (pollo cocido sin sal + arroz blanco) por al menos 2 semanas.',
      'Aislamiento total de otros perros durante la recuperación.',
      'Desinfectar todo el entorno antes del regreso al hogar.',
    ],
    whenToVet:
      'Lleva a tu perro de inmediato si presenta vómitos con sangre, diarrea hemorrágica, letargo extremo o falta de respuesta. Cada hora cuenta.',
  },
  {
    id: 'moquillo',
    displayName: 'Moquillo Canino',
    species: 'perro',
    category: 'infeccioso',
    ...cat('infeccioso'),
    icon: 'bug-outline',
    urgency: 'critica',
    contagious: true,
    shortDescription: 'Enfermedad viral sistémica que afecta múltiples órganos y el sistema nervioso.',
    description:
      'El moquillo canino es causado por el virus Paramyxovirus. Afecta el sistema respiratorio, digestivo y nervioso central. Es altamente contagioso por secreciones nasales y oculares, y puede dejar secuelas neurológicas permanentes. La vacunación es la única prevención efectiva.',
    symptoms: [
      { name: 'Secreción nasal y ocular purulenta', severity: 'grave' },
      { name: 'Fiebre bifásica', severity: 'moderada' },
      { name: 'Tos y dificultad respiratoria', severity: 'moderada' },
      { name: 'Convulsiones y espasmos musculares', severity: 'grave' },
      { name: 'Vómitos y diarrea', severity: 'moderada' },
      { name: 'Engrosamiento de almohadillas', severity: 'leve' },
      { name: 'Desorientación y pérdida de equilibrio', severity: 'grave' },
    ],
    prevention: [
      'Vacunar con la combinación DA2PP desde cachorro con refuerzos anuales.',
      'Evitar el contacto con animales salvajes (zorros, mapaches) que son reservorios.',
      'No llevar cachorros sin vacunar a refugios o criaderos.',
      'Mantener el sistema inmune fuerte con buena nutrición y desparasitación.',
    ],
    treatment: [
      'No existe tratamiento antiviral específico; el manejo es de soporte.',
      'Antibióticos para infecciones bacterianas secundarias.',
      'Anticonvulsivantes si hay manifestaciones neurológicas.',
      'Fluidoterapia, antieméticos y expectorantes según síntomas.',
      'Aislamiento estricto del paciente para evitar contagio.',
    ],
    homeCare: [
      'Limpieza suave de secreciones oculares y nasales con gasa estéril húmeda 3–4 veces al día.',
      'Ambiente cálido, silencioso y sin estrés para reducir convulsiones.',
      'Supervisión constante ante aparición de nuevos signos neurológicos.',
      'Seguir el protocolo de antibióticos y medicamentos al pie de la letra.',
    ],
    whenToVet:
      'Ante cualquier convulsión, secreción ocular/nasal purulenta, tos persistente o pérdida de coordinación, acude urgentemente al veterinario.',
  },
  {
    id: 'leptospirosis',
    displayName: 'Leptospirosis',
    species: 'perro',
    category: 'infeccioso',
    ...cat('infeccioso'),
    icon: 'water-outline',
    urgency: 'alta',
    contagious: false,
    shortDescription: 'Infección bacteriana transmitida por agua contaminada que daña riñones e hígado.',
    description:
      'La leptospirosis es causada por bacterias del género Leptospira, presentes en agua y suelo contaminados con orina de animales infectados (roedores, ganado). Puede transmitirse a humanos (zoonosis). Afecta principalmente riñones, hígado y sistema vascular.',
    symptoms: [
      { name: 'Fiebre súbita', severity: 'moderada' },
      { name: 'Vómitos y diarrea', severity: 'moderada' },
      { name: 'Ictericia (piel y ojos amarillos)', severity: 'grave' },
      { name: 'Orina oscura o con sangre', severity: 'grave' },
      { name: 'Dolor muscular intenso', severity: 'moderada' },
      { name: 'Letargo y debilidad', severity: 'moderada' },
      { name: 'Encias pálidas', severity: 'grave' },
    ],
    prevention: [
      'Vacunar anualmente contra los serovares más prevalentes en tu región.',
      'Evitar que el perro beba de charcos, ríos o agua estancada.',
      'Controlar la presencia de roedores en el hogar y el entorno.',
      'Usar ropa de protección al limpiar orina de mascotas enfermas.',
      'Mantener el patio limpio y sin acumulación de agua.',
    ],
    treatment: [
      'Antibióticos (doxiciclina o penicilina) durante 2–4 semanas.',
      'Fluidoterapia intensiva para apoyar la función renal.',
      'Soporte hepático con hepatoprotectores.',
      'Diálisis en casos de falla renal severa.',
      'Monitoreo continuo de función renal y hepática.',
    ],
    homeCare: [
      'Administrar antibióticos completos aunque mejore antes de terminar el ciclo.',
      'Ofrecer agua fresca y limpia constantemente.',
      'Dieta renal baja en proteínas si hay daño renal confirmado.',
      'Limpiar con guantes la orina del perro durante el tratamiento (riesgo de zoonosis).',
    ],
    whenToVet:
      'Ictericia visible, orina oscura o con sangre, vómitos persistentes con letargo extremo requieren atención veterinaria urgente.',
  },
  {
    id: 'ehrlichiosis',
    displayName: 'Ehrlichiosis',
    species: 'perro',
    category: 'parasitario',
    ...cat('parasitario'),
    icon: 'bug-outline',
    urgency: 'alta',
    contagious: false,
    shortDescription: 'Enfermedad transmitida por garrapatas que destruye las plaquetas sanguíneas.',
    description:
      'La ehrlichiosis es causada por Ehrlichia canis, bacteria transmitida por la garrapata café (Rhipicephalus sanguineus). Afecta las plaquetas y puede causar hemorragias severas. Tiene tres fases: aguda, subclínica y crónica, siendo la crónica la más peligrosa.',
    symptoms: [
      { name: 'Fiebre persistente', severity: 'moderada' },
      { name: 'Sangrado por nariz o encías', severity: 'grave' },
      { name: 'Hematomas espontáneos', severity: 'grave' },
      { name: 'Letargo y pérdida de peso', severity: 'moderada' },
      { name: 'Encias pálidas', severity: 'grave' },
      { name: 'Inflamación ganglionar', severity: 'leve' },
    ],
    prevention: [
      'Aplicar antiparasitarios externos (collar, pipeta o tableta) de forma regular.',
      'Revisar al perro en busca de garrapatas después de cada salida al exterior.',
      'Evitar zonas de vegetación alta sin protección antiparasitaria.',
      'Tratar el entorno del hogar con acaricidas si hay infestación.',
    ],
    treatment: [
      'Doxiciclina oral durante 28 días como tratamiento de primera línea.',
      'Transfusiones sanguíneas en casos de anemia severa.',
      'Corticosteroides para trombocitopenia inmunomediada si se requiere.',
      'Seguimiento hematológico cada 2–4 semanas hasta normalización.',
    ],
    homeCare: [
      'Completar el ciclo antibiótico de 28 días sin interrupciones.',
      'Revisar diariamente las encías y la piel en busca de nuevos sangrados.',
      'Reposo relativo; evitar ejercicio intenso que pueda causar hemorragias.',
      'Continuar la protección antiparasitaria durante y después del tratamiento.',
    ],
    whenToVet:
      'Sangrado espontáneo de cualquier origen, encias pálidas, moretones sin causa aparente o decaimiento brusco requieren consulta urgente.',
  },
  {
    id: 'babesiosis',
    displayName: 'Babesiosis',
    species: 'perro',
    category: 'parasitario',
    ...cat('parasitario'),
    icon: 'bug-outline',
    urgency: 'alta',
    contagious: false,
    shortDescription: 'Parásito transmitido por garrapatas que destruye los glóbulos rojos.',
    description:
      'La babesiosis es causada por protozoos del género Babesia que destruyen los glóbulos rojos dentro del torrente sanguíneo. Se transmite por garrapatas. Puede provocar anemia hemolítica grave, fiebre alta e ictericia. Requiere diagnóstico rápido para evitar complicaciones.',
    symptoms: [
      { name: 'Fiebre alta', severity: 'grave' },
      { name: 'Encias y mucosas pálidas', severity: 'grave' },
      { name: 'Orina rojiza o con sangre', severity: 'grave' },
      { name: 'Debilidad y colapso', severity: 'grave' },
      { name: 'Ictericia', severity: 'moderada' },
      { name: 'Taquicardia', severity: 'moderada' },
    ],
    prevention: [
      'Control riguroso de garrapatas con antiparasitarios de amplio espectro.',
      'Revisión del pelaje tras cada salida al campo o zonas boscosas.',
      'Retirar garrapatas adheridas con pinza especial sin girar ni aplastar.',
      'Mantener el jardín sin maleza alta donde proliferan las garrapatas.',
    ],
    treatment: [
      'Imidocarb dipropionato como tratamiento antiparasitario específico.',
      'Transfusión sanguínea en anemia hemolítica severa.',
      'Fluidoterapia y soporte hepático si hay ictericia.',
      'Hospitalización con monitoreo de hematocrito hasta estabilización.',
    ],
    homeCare: [
      'Reposo estricto durante al menos 2 semanas post-tratamiento.',
      'Dieta de fácil digestión y rica en hierro para recuperar glóbulos rojos.',
      'Continuar antiparasitarios externos para evitar reinfección.',
      'Control hematológico a las 2 y 4 semanas para verificar recuperación.',
    ],
    whenToVet:
      'Orina rojiza, mucosas pálidas, colapso o fiebre superior a 40 °C son emergencias que requieren atención inmediata.',
  },
  {
    id: 'dirofilariosis',
    displayName: 'Dirofilariosis (Gusano del Corazón)',
    species: 'perro',
    category: 'parasitario',
    ...cat('parasitario'),
    icon: 'heart-dislike-outline',
    urgency: 'alta',
    contagious: false,
    shortDescription: 'Parásitos que viven en el corazón y pulmones, causados por picadura de mosquito.',
    description:
      'Dirofilaria immitis es un gusano que se aloja en el corazón y arterias pulmonares del perro. Se transmite exclusivamente por mosquitos. Los síntomas tardan meses o años en aparecer. Sin tratamiento provoca insuficiencia cardíaca. La prevención mensual es mucho más segura que el tratamiento.',
    symptoms: [
      { name: 'Tos crónica', severity: 'moderada' },
      { name: 'Intolerancia al ejercicio', severity: 'moderada' },
      { name: 'Respiración acelerada', severity: 'grave' },
      { name: 'Abdomen distendido', severity: 'grave' },
      { name: 'Pérdida de peso progresiva', severity: 'moderada' },
      { name: 'Letargo persistente', severity: 'moderada' },
    ],
    prevention: [
      'Administrar preventivo mensual (ivermectina, milbemicina) todo el año.',
      'Reducir la exposición a mosquitos en zonas de alta incidencia.',
      'Realizar prueba de antígeno anual aunque el perro use preventivo.',
      'No interrumpir el preventivo mensual en ninguna época del año.',
    ],
    treatment: [
      'Protocolo de melarsomine (adulticida) en 3 inyecciones con reposo estricto.',
      'Doxiciclina previa para debilitar las microfilarias.',
      'Tratamiento de insuficiencia cardíaca si ya existe daño.',
      'Reposo absoluto de 6–8 semanas durante el tratamiento adulticida.',
      'Control radiológico y ecocardiograma para evaluar la respuesta.',
    ],
    homeCare: [
      'Reposo ABSOLUTO durante todo el tratamiento — la actividad puede causar embolias fatales.',
      'Confinamiento en jaula o espacio pequeño para evitar movimiento.',
      'Evitar el estrés y excitación del animal durante semanas.',
      'Continuar el preventivo mensual tras completar el tratamiento.',
    ],
    whenToVet:
      'Tos que no cede, dificultad respiratoria en reposo, abdomen hinchado o síncope (desmayo) requieren evaluación urgente.',
  },
  {
    id: 'tos_de_las_perreras',
    displayName: 'Tos de las Perreras',
    species: 'perro',
    category: 'respiratorio',
    ...cat('respiratorio'),
    icon: 'partly-sunny-outline',
    urgency: 'media',
    contagious: true,
    shortDescription: 'Infección respiratoria altamente contagiosa entre perros en grupos.',
    description:
      'La tos de las perreras (traqueobronquitis infecciosa) es causada principalmente por Bordetella bronchiseptica y el virus parainfluenza. Se contagia por el aire o contacto directo. Es muy frecuente en criaderos, guarderías y parques. Generalmente se resuelve sola, pero puede complicarse en cachorros y animales inmunodeprimidos.',
    symptoms: [
      { name: 'Tos seca y persistente en accesos', severity: 'moderada' },
      { name: 'Arcadas post-tos', severity: 'leve' },
      { name: 'Secreción nasal clara', severity: 'leve' },
      { name: 'Estornudos frecuentes', severity: 'leve' },
      { name: 'Apetito conservado (leve afectación general)', severity: 'leve' },
    ],
    prevention: [
      'Vacunar contra Bordetella (intranasal o inyectable) si el perro va a criaderos o guarderías.',
      'Evitar contacto con perros con tos activa.',
      'Mantener buena ventilación en espacios donde conviven varios perros.',
      'Vacunar contra parainfluenza como parte de la polivalente anual.',
    ],
    treatment: [
      'Reposo en ambiente cálido y sin corrientes de aire.',
      'Antibióticos (doxiciclina o amoxicilina) si hay componente bacteriano.',
      'Antitusivos solo bajo prescripción veterinaria para aliviar el malestar.',
      'La mayoría se recupera en 1–3 semanas sin tratamiento intensivo.',
    ],
    homeCare: [
      'Vaporizaciones con agua caliente en el baño durante 10 min, 2 veces al día.',
      'Mantener el cuello del perro sin collar durante la tos (usar arnés).',
      'Ofrecer agua tibia para humedecer la garganta.',
      'Evitar salidas a lugares con otros perros hasta que cese la tos.',
    ],
    whenToVet:
      'Si la tos dura más de 10 días, hay fiebre, dificultad respiratoria, pérdida de apetito o secreción nasal verde/amarilla.',
  },
  {
    id: 'neumonia_canina',
    displayName: 'Neumonía Canina',
    species: 'perro',
    category: 'respiratorio',
    ...cat('respiratorio'),
    icon: 'cellular-outline',
    urgency: 'alta',
    contagious: false,
    shortDescription: 'Inflamación pulmonar que compromete la respiración y requiere tratamiento urgente.',
    description:
      'La neumonía canina puede ser de origen bacteriano, viral, por aspiración o fúngico. Causa inflamación de los pulmones con acumulación de líquido. Los perros jóvenes, ancianos e inmunodeprimidos son los más vulnerables. Sin tratamiento adecuado puede ser fatal.',
    symptoms: [
      { name: 'Respiración rápida y superficial', severity: 'grave' },
      { name: 'Tos productiva (con flema)', severity: 'moderada' },
      { name: 'Fiebre alta', severity: 'grave' },
      { name: 'Cianosis (encías azuladas)', severity: 'grave' },
      { name: 'Letargo y debilidad extrema', severity: 'grave' },
      { name: 'Pérdida de apetito', severity: 'moderada' },
    ],
    prevention: [
      'Mantener el esquema de vacunación al día (especialmente moquillo y adenovirus).',
      'Evitar la exposición a corrientes de aire frío y humedad en cachorros.',
      'Tratar rápidamente cualquier infección respiratoria antes de que progrese.',
      'No permitir que el perro coma en posiciones que faciliten la aspiración.',
    ],
    treatment: [
      'Antibióticos de amplio espectro durante 3–6 semanas según el agente causal.',
      'Oxigenoterapia en casos de dificultad respiratoria grave.',
      'Nebulizaciones con solución salina o broncodilatadores.',
      'Fisioterapia respiratoria (golpes suaves en el tórax) para movilizar secreciones.',
      'Hospitalización y monitoreo radiológico.',
    ],
    homeCare: [
      'Ambiente cálido, seco y libre de humo o aerosoles.',
      'Nebulizaciones caseras en baño con vapor 2 veces al día.',
      'Administrar el antibiótico COMPLETO aunque mejore antes.',
      'Revisión veterinaria de seguimiento a los 7 y 21 días.',
    ],
    whenToVet:
      'Encías azuladas, respiración con la boca abierta, inmovilidad o fiebre mayor a 39.5 °C son señales de emergencia.',
  },
  {
    id: 'otitis_canina',
    displayName: 'Otitis Canina',
    species: 'perro',
    category: 'dermatologico',
    ...cat('dermatologico'),
    icon: 'ear-outline',
    urgency: 'media',
    contagious: false,
    shortDescription: 'Inflamación del oído que causa dolor intenso, picazón y secreción.',
    description:
      'La otitis es una de las consultas más frecuentes en perros. Puede ser de origen bacteriano, fúngico (Malassezia), parasitario (ácaros) o alérgico. Las razas con orejas caídas (Cocker, Basset) son más propensas. Sin tratamiento crónico puede avanzar al oído medio e interno.',
    symptoms: [
      { name: 'Rascado constante de las orejas', severity: 'moderada' },
      { name: 'Sacudidas frecuentes de cabeza', severity: 'leve' },
      { name: 'Secreción oscura o purulenta', severity: 'moderada' },
      { name: 'Mal olor en las orejas', severity: 'leve' },
      { name: 'Dolor al tocar la cabeza', severity: 'moderada' },
      { name: 'Enrojecimiento del canal auditivo', severity: 'moderada' },
    ],
    prevention: [
      'Revisar y limpiar las orejas semanalmente con solución limpiadora específica.',
      'Secar bien las orejas tras el baño o la natación.',
      'Controlar las alergias alimentarias o ambientales que predisponen a otitis.',
      'Retirar el exceso de pelo en el canal auditivo (bajo supervisión veterinaria).',
    ],
    treatment: [
      'Limpieza profunda del canal auditivo en la consulta.',
      'Gotas óticas antibióticas, antifúngicas o antiparasitarias según el agente.',
      'Antiinflamatorios para aliviar el dolor y la inflamación.',
      'Tratamiento sistémico (oral) en casos de otitis media o crónica.',
    ],
    homeCare: [
      'Aplicar las gotas según indicación: habitualmente 1–2 veces al día durante 7–14 días.',
      'Limpiar el exceso de secreción antes de aplicar el medicamento.',
      'Nunca introducir bastoncillos de algodón en el canal auditivo.',
      'Revisar el interior de la oreja semanalmente durante el tratamiento.',
    ],
    whenToVet:
      'Inclinación persistente de la cabeza, pérdida de equilibrio, dolor intenso o falta de respuesta al tratamiento en 5 días.',
  },
  // ── COMPARTIDAS ──────────────────────────────────────────────────────────
  {
    id: 'gastroenteritis',
    displayName: 'Gastroenteritis',
    species: 'ambos',
    category: 'digestivo',
    ...cat('digestivo'),
    icon: 'medical-outline',
    urgency: 'media',
    contagious: false,
    shortDescription: 'Inflamación del estómago e intestinos que causa vómitos, diarrea y malestar.',
    description:
      'La gastroenteritis puede ser causada por virus, bacterias, parásitos, cambios bruscos de dieta o ingesta de alimentos inadecuados. Es una de las causas más frecuentes de consulta veterinaria. En la mayoría de los casos es autolimitada, pero puede ser grave en cachorros, geriátricos o animales con enfermedades previas.',
    symptoms: [
      { name: 'Vómitos repetidos', severity: 'moderada' },
      { name: 'Diarrea acuosa', severity: 'moderada' },
      { name: 'Pérdida de apetito', severity: 'leve' },
      { name: 'Letargo leve', severity: 'leve' },
      { name: 'Dolor o borborigmos abdominales', severity: 'leve' },
      { name: 'Deshidratación', severity: 'moderada' },
    ],
    prevention: [
      'No cambiar la dieta de forma brusca; hacerlo gradualmente en 7–10 días.',
      'Evitar acceso a basura, restos de comida o alimentos en mal estado.',
      'Desparasitar regularmente para eliminar parásitos intestinales.',
      'Asegurarse de que el agua esté siempre limpia y fresca.',
    ],
    treatment: [
      'Ayuno de 12–24 horas (con agua siempre disponible) para descanso digestivo.',
      'Reintroducción de dieta blanda: arroz cocido + pollo sin sal.',
      'Probióticos para restaurar la flora intestinal.',
      'Antiemeticos y antidiarreicos bajo prescripción veterinaria.',
      'Fluidoterapia subcutánea o IV si hay deshidratación significativa.',
    ],
    homeCare: [
      'Ofrecer agua en pequeñas cantidades frecuentes para prevenir deshidratación.',
      'Suero oral o electrolitos si hay diarrea intensa.',
      'Dieta blanda durante 5–7 días antes de volver a la comida habitual.',
      'Evitar premios, snacks y cambios de alimento durante la recuperación.',
    ],
    whenToVet:
      'Vómitos o diarrea con sangre, deshidratación visible (encías secas), fiebre, más de 24 h sin mejoría o si es un cachorro menor de 6 meses.',
  },
  {
    id: 'intoxicacion_alimentaria',
    displayName: 'Intoxicación Alimentaria',
    species: 'ambos',
    category: 'toxicologico',
    ...cat('toxicologico'),
    icon: 'warning-outline',
    urgency: 'alta',
    contagious: false,
    shortDescription: 'Reacción tóxica tras ingerir alimentos inadecuados, en mal estado o venenos.',
    description:
      'La intoxicación alimentaria ocurre cuando la mascota ingiere alimentos tóxicos (chocolate, uvas, cebolla, xilitol), contaminados con bacterias o en proceso de descomposición. Los síntomas pueden aparecer en minutos u horas y varían según el tóxico ingerido.',
    symptoms: [
      { name: 'Vómitos explosivos', severity: 'grave' },
      { name: 'Diarrea severa', severity: 'moderada' },
      { name: 'Temblores o convulsiones', severity: 'grave' },
      { name: 'Salivación excesiva', severity: 'moderada' },
      { name: 'Desorientación', severity: 'grave' },
      { name: 'Colapso o pérdida de conciencia', severity: 'grave' },
    ],
    prevention: [
      'No dar alimentos para humanos sin confirmar que son seguros para mascotas.',
      'Mantener chocolate, uvas, pasas, cebolla, ajo y xilitol fuera del alcance.',
      'Asegurar la basura con tapa que la mascota no pueda abrir.',
      'No dejar comida sin supervisión al alcance de la mascota.',
    ],
    treatment: [
      'Inducción al vómito solo si es reciente (<2h) y bajo indicación veterinaria.',
      'Carbón activado para absorber el tóxico en casos indicados.',
      'Fluidoterapia para acelerar la eliminación renal del tóxico.',
      'Tratamiento específico según el agente tóxico identificado.',
      'Monitoreo de función renal, hepática y neurológica.',
    ],
    homeCare: [
      'NO intentar inducir el vómito en casa sin consultar al veterinario.',
      'Llevar al veterinario una muestra o foto del alimento sospechoso.',
      'Después del tratamiento, mantener dieta blanda 5–7 días.',
      'Guardar todos los productos tóxicos bajo llave o en zonas inaccesibles.',
    ],
    whenToVet:
      'Toda sospecha de intoxicación es una emergencia. Acude de inmediato sin esperar síntomas graves.',
  },
  {
    id: 'dermatitis_alergica',
    displayName: 'Dermatitis Alérgica',
    species: 'ambos',
    category: 'dermatologico',
    ...cat('dermatologico'),
    icon: 'leaf-outline',
    urgency: 'baja',
    contagious: false,
    shortDescription: 'Reacción inflamatoria de la piel por alergias a alimentos, ambiente o contacto.',
    description:
      'La dermatitis alérgica es la causa más frecuente de picazón crónica en mascotas. Puede ser atópica (ambiental: polvo, pólenes), alimentaria o de contacto. Es una condición crónica que requiere manejo a largo plazo. Raramente se cura, pero se puede controlar muy bien con tratamiento adecuado.',
    symptoms: [
      { name: 'Picazón intensa y persistente', severity: 'moderada' },
      { name: 'Enrojecimiento de la piel', severity: 'moderada' },
      { name: 'Pérdida de pelo por rascado', severity: 'leve' },
      { name: 'Heridas y costras por autograscado', severity: 'moderada' },
      { name: 'Mal olor en piel y orejas', severity: 'leve' },
      { name: 'Ojos y nariz llorosos', severity: 'leve' },
    ],
    prevention: [
      'Identificar y eliminar el alérgeno causante (diagnóstico de alergia).',
      'Bañar con champú hipoalergénico y no enjuagar con agua de la llave si hay cloro.',
      'Usar antiparasitarios externos para eliminar pulgas (alérgeno frecuente).',
      'Dieta de exclusión bajo supervisión veterinaria si se sospecha alergia alimentaria.',
    ],
    treatment: [
      'Antihistamínicos o corticosteroides para el control del prurito.',
      'Inmunoterapia alérgica (vacuna antialérgica) para casos atópicos.',
      'Oclacitinib (Apoquel) o lokivetmab (Cytopoint) como alternativas modernas.',
      'Antibióticos o antifúngicos si hay infecciones secundarias.',
    ],
    homeCare: [
      'Baño semanal con champú específico para piel sensible o alérgica.',
      'Ácidos grasos Omega-3 y 6 en la dieta para fortalecer la barrera cutánea.',
      'Evitar el acceso a las zonas que generan la reacción alérgica.',
      'Limpiar la cama y accesorios de la mascota semanalmente.',
    ],
    whenToVet:
      'Si hay heridas abiertas, infecciones secundarias, pérdida de pelo extensa o el animal no puede descansar por el picor.',
  },
  {
    id: 'envenenamiento_rodenticidas',
    displayName: 'Envenenamiento por Raticidas',
    species: 'ambos',
    category: 'toxicologico',
    ...cat('toxicologico'),
    icon: 'skull-outline',
    urgency: 'critica',
    contagious: false,
    shortDescription: 'Intoxicación grave por ingestión de venenos para roedores — emergencia absoluta.',
    description:
      'Los raticidas anticoagulantes (brodifacoum, bromadiolona) impiden la coagulación de la sangre. Los síntomas pueden tardar 2–5 días en aparecer pero el daño ya ocurrió. Sin tratamiento, el animal muere por hemorragia interna. Es una emergencia que no admite espera.',
    symptoms: [
      { name: 'Sangrado espontáneo (nariz, encías, orina)', severity: 'grave' },
      { name: 'Heces con sangre o negras', severity: 'grave' },
      { name: 'Dificultad respiratoria por sangrado interno', severity: 'grave' },
      { name: 'Letargo extremo y debilidad', severity: 'grave' },
      { name: 'Encias pálidas', severity: 'grave' },
      { name: 'Convulsiones (raticidas neurológicos)', severity: 'grave' },
    ],
    prevention: [
      'Nunca usar raticidas en zonas accesibles para las mascotas.',
      'Usar trampas mecánicas como alternativa segura al veneno.',
      'Si se usan raticidas en el hogar, consultar al veterinario para antídoto preventivo.',
      'Educar a toda la familia sobre los riesgos de los venenos para roedores.',
    ],
    treatment: [
      'Inducción al vómito solo si es en las primeras 2 horas y bajo supervisión.',
      'Vitamina K1 inyectable e oral durante semanas como antídoto específico.',
      'Transfusiones de plasma en casos de sangrado activo grave.',
      'Hospitalización con monitoreo de tiempos de coagulación.',
      'Control de PT/PTT cada 48 h durante 4–6 semanas.',
    ],
    homeCare: [
      'LLEVAR AL VETERINARIO DE INMEDIATO — no esperar síntomas.',
      'Continuar la vitamina K1 oral durante 4–6 semanas completas.',
      'No suspender el antídoto aunque el animal parezca recuperado.',
      'Control veterinario cada 2 semanas para verificar coagulación.',
    ],
    whenToVet:
      'EMERGENCIA INMEDIATA si hay sospecha de ingestión, incluso sin síntomas. Los síntomas aparecen días después cuando el daño ya es grave.',
  },
  {
    id: 'displasia_cadera',
    displayName: 'Displasia de Cadera',
    species: 'ambos',
    category: 'ortopedico',
    ...cat('ortopedico'),
    icon: 'body-outline',
    urgency: 'media',
    contagious: false,
    shortDescription: 'Malformación de la articulación de la cadera que causa dolor crónico y cojera.',
    description:
      'La displasia de cadera es una enfermedad hereditaria y degenerativa donde la cabeza del fémur no encaja correctamente en el acetábulo. Es muy frecuente en razas grandes (Pastor Alemán, Labrador). Causa artritis progresiva y dolor crónico. Puede manejarse médicamente o con cirugía.',
    symptoms: [
      { name: 'Cojera al levantarse', severity: 'moderada' },
      { name: 'Dificultad para subir escaleras', severity: 'moderada' },
      { name: 'Postura con patas traseras juntas', severity: 'leve' },
      { name: 'Dolor al moverse o ser tocado en la cadera', severity: 'moderada' },
      { name: 'Atrofia muscular del cuarto trasero', severity: 'moderada' },
      { name: 'Intolerancia al ejercicio', severity: 'leve' },
    ],
    prevention: [
      'Seleccionar criadores que hagan pruebas de displasia en reproductores.',
      'Mantener el peso corporal ideal para no sobrecargar las articulaciones.',
      'Evitar ejercicio excesivo de impacto en cachorros de razas predispuestas.',
      'Suelos antideslizantes en el hogar para evitar resbalones.',
    ],
    treatment: [
      'Antiinflamatorios no esteroideos (AINEs) bajo prescripción veterinaria.',
      'Condroprotectores (glucosamina, condroitín, omega-3) para proteger el cartílago.',
      'Fisioterapia e hidroterapia para mantener la masa muscular.',
      'Cirugía (TPO, reemplazo total de cadera) en casos severos o jóvenes.',
    ],
    homeCare: [
      'Cama ortopédica de espuma viscoelástica para aliviar la presión articular.',
      'Rampas en lugar de escaleras para subir a sofás o vehículos.',
      'Paseos suaves y regulares en superficies blandas (evitar asfalto).',
      'Suplementos de condroprotectores diarios en la comida.',
      'Control de peso estricto — cada kilo extra acelera la artritis.',
    ],
    whenToVet:
      'Cojera que no mejora en 48 h, dolor al sentarse o levantarse, cambio en la marcha o imposibilidad de subir escalones.',
  },
  // ── GATO ─────────────────────────────────────────────────────────────────
  {
    id: 'panleucopenia',
    displayName: 'Panleucopenia Felina',
    species: 'gato',
    category: 'infeccioso',
    ...cat('infeccioso'),
    icon: 'bug-outline',
    urgency: 'critica',
    contagious: true,
    shortDescription: 'El "parvovirus de los gatos" — mortal sin tratamiento urgente.',
    description:
      'La panleucopenia felina (o distemper felino) es causada por el parvovirus felino. Destruye las células intestinales y la médula ósea, provocando inmunosupresión severa. Es altamente contagiosa y puede sobrevivir meses en el ambiente. Los gatitos sin vacunar son los más vulnerables.',
    symptoms: [
      { name: 'Vómitos y diarrea severa', severity: 'grave' },
      { name: 'Fiebre alta (luego hipotermia)', severity: 'grave' },
      { name: 'Letargo extremo', severity: 'grave' },
      { name: 'Pérdida total de apetito', severity: 'grave' },
      { name: 'Dolor abdominal intenso', severity: 'grave' },
      { name: 'Deshidratación rápida', severity: 'grave' },
    ],
    prevention: [
      'Vacunar con el esquema FVRCP completo desde las 8 semanas de vida.',
      'Mantener los refuerzos anuales o trianuales según el veterinario.',
      'Desinfectar con hipoclorito de sodio (1:32) — el virus es resistente a muchos desinfectantes.',
      'No introducir gatos nuevos sin cuarentena previa de 2 semanas.',
    ],
    treatment: [
      'Hospitalización urgente con fluidoterapia intravenosa intensiva.',
      'Antibióticos para prevenir infecciones bacterianas secundarias.',
      'Antieméticos y protectores gástricos.',
      'Nutrición enteral si el gato no come por más de 48 h.',
      'Transfusión sanguínea en casos de neutropenia severa.',
    ],
    homeCare: [
      'Tratamiento en casa NO es recomendado sin supervisión veterinaria.',
      'Post-hospitalización: dieta blanda, hidratación y aislamiento de otros gatos.',
      'Desinfectar a fondo el hogar antes de reintroducir al gato.',
      'El gato puede eliminar el virus hasta 6 semanas post-infección.',
    ],
    whenToVet:
      'Todo gatito con vómitos, diarrea y decaimiento es emergencia — la panleucopenia puede matar en 24–72 horas.',
  },
  {
    id: 'gastritis_felina',
    displayName: 'Gastritis Felina',
    species: 'gato',
    category: 'digestivo',
    ...cat('digestivo'),
    icon: 'medical-outline',
    urgency: 'media',
    contagious: false,
    shortDescription: 'Inflamación del estómago que causa vómitos frecuentes y malestar digestivo.',
    description:
      'La gastritis en gatos puede ser aguda (causas dietéticas, cuerpos extraños, tóxicos) o crónica (alergias alimentarias, enfermedades sistémicas). Los gatos son especialmente propensos a vomitar, pero vómitos frecuentes (más de 1 vez/semana) siempre merecen evaluación.',
    symptoms: [
      { name: 'Vómitos frecuentes (bilis o alimento)', severity: 'moderada' },
      { name: 'Náuseas (babeo, lamerse los labios)', severity: 'leve' },
      { name: 'Pérdida de apetito', severity: 'moderada' },
      { name: 'Letargo', severity: 'leve' },
      { name: 'Dolor a la palpación abdominal', severity: 'leve' },
    ],
    prevention: [
      'Evitar cambios bruscos de dieta.',
      'Alimentar en porciones pequeñas y frecuentes (2–3 veces al día).',
      'Mantener zonas de plantas tóxicas fuera del alcance.',
      'Cepillar regularmente para reducir la ingestión de pelo.',
    ],
    treatment: [
      'Ayuno de 12–24 h con agua disponible para descanso gástrico.',
      'Protectores gástricos (omeprazol, famotidina) bajo prescripción.',
      'Dieta blanda o prescripción gastro-intestinal.',
      'Identificación y eliminación del factor desencadenante.',
    ],
    homeCare: [
      'Comida húmeda de fácil digestión durante 5–7 días.',
      'Malta o dieta anti-bola de pelo si se detecta como causa.',
      'No ofrecer leche, embutidos ni comida humana.',
      'Control de vómitos: si ocurre más de 2 veces en un día, consultar.',
    ],
    whenToVet:
      'Vómitos con sangre, vómitos más de 3 veces en el día, pérdida de peso, decaimiento marcado o vómitos crónicos semanales.',
  },
  {
    id: 'rinotraqueitis_viral_felina',
    displayName: 'Rinotraqueítis Viral Felina',
    species: 'gato',
    category: 'respiratorio',
    ...cat('respiratorio'),
    icon: 'partly-sunny-outline',
    urgency: 'alta',
    contagious: true,
    shortDescription: 'Herpesvirus felino que causa "catarro" severo, infección ocular y neumonía.',
    description:
      'El Herpesvirus Felino tipo 1 (FHV-1) es la causa más frecuente del complejo respiratorio felino. Produce rinitis, conjuntivitis y traqueítis graves. El virus persiste latente de por vida y puede reactivarse con estrés. Los gatitos pueden desarrollar neumonía fatal.',
    symptoms: [
      { name: 'Estornudos en salva', severity: 'moderada' },
      { name: 'Secreción nasal verde/amarilla', severity: 'moderada' },
      { name: 'Conjuntivitis severa (ojos pegados)', severity: 'grave' },
      { name: 'Fiebre y letargo', severity: 'moderada' },
      { name: 'Pérdida del olfato → anorexia', severity: 'grave' },
      { name: 'Úlceras corneales', severity: 'grave' },
    ],
    prevention: [
      'Vacunar con FVRCP desde las 8 semanas con refuerzos anuales.',
      'Reducir el estrés en gatos con herpes latente (reactivación).',
      'Separar nuevos gatos durante cuarentena de 2 semanas.',
      'Desinfectar comederos, bebederos y camas regularmente.',
    ],
    treatment: [
      'Antivirales específicos (famciclovir) en casos graves.',
      'Antibióticos para infecciones bacterianas secundarias.',
      'Colirios antivirales (idoxuridina) para úlceras corneales.',
      'Estimulantes del apetito y nutrición asistida si no come.',
      'Nebulizaciones con salino para descongestionar.',
    ],
    homeCare: [
      'Limpiar la secreción nasal y ocular con gasa húmeda estéril varias veces al día.',
      'Calentar la comida para mejorar el olfato y estimular el apetito.',
      'Vaporizaciones en baño con vapor 10 min, 2 veces al día.',
      'L-lisina como suplemento para inhibir la replicación del herpesvirus.',
    ],
    whenToVet:
      'Ojos cerrados y pegados, anorexia por más de 24 h, dificultad respiratoria o fiebre alta en gatitos.',
  },
  {
    id: 'cistitis_felina',
    displayName: 'Cistitis Felina (FLUTD)',
    species: 'gato',
    category: 'renal',
    ...cat('renal'),
    icon: 'water-outline',
    urgency: 'media',
    contagious: false,
    shortDescription: 'Inflamación del tracto urinario que puede causar obstrucción mortal en machos.',
    description:
      'La cistitis felina es frecuente en gatos de interior con dieta seca y poco ejercicio. Puede ser idiopática (por estrés), bacteriana o por cálculos. En machos puede causar obstrucción uretral — una emergencia mortal. Es la enfermedad del tracto urinario más frecuente en gatos.',
    symptoms: [
      { name: 'Visitas frecuentes a la bandeja sin orinar', severity: 'grave' },
      { name: 'Sangre en orina', severity: 'grave' },
      { name: 'Lamido excesivo de genitales', severity: 'moderada' },
      { name: 'Orina fuera de la bandeja', severity: 'leve' },
      { name: 'Vocalizaciones al orinar', severity: 'moderada' },
      { name: 'Letargo y vómitos (obstrucción)', severity: 'grave' },
    ],
    prevention: [
      'Alimentación húmeda o mezcla de seca/húmeda para aumentar ingesta de agua.',
      'Fuentes de agua en movimiento (bebedero circulante) para estimular la ingesta.',
      'Reducir el estrés del ambiente (escondites, enriquecimiento ambiental).',
      'Mantener bandeja limpia — suciedad aumenta el riesgo.',
      'Dieta urinary prescrita si hay historia de cristales urinarios.',
    ],
    treatment: [
      'Analgésicos y antiespasmódicos para el dolor urinario.',
      'Antibióticos si hay infección bacteriana confirmada en urocultivo.',
      'Sondaje uretral urgente si hay obstrucción (machos).',
      'Dieta de prescripción para disolver cálculos o prevenir su formación.',
      'Manejo del estrés con feromonas o ansiolíticos si es idiopática.',
    ],
    homeCare: [
      'Ofrecer múltiples fuentes de agua fresca.',
      'Mezclar agua con la comida seca para aumentar la ingesta hídrica.',
      'Limpiar la bandeja de arena una o dos veces al día.',
      'Observar diariamente si el gato orina normalmente.',
    ],
    whenToVet:
      'EMERGENCIA si el gato (especialmente macho) lleva más de 12 h sin orinar, vomita o está letárgico — la obstrucción es mortal en 24–48 h.',
  },
  {
    id: 'sarna_felina',
    displayName: 'Sarna Felina',
    species: 'gato',
    category: 'dermatologico',
    ...cat('dermatologico'),
    icon: 'leaf-outline',
    urgency: 'media',
    contagious: true,
    shortDescription: 'Infestación por ácaros que causa picazón intensa, costras y pérdida de pelo.',
    description:
      'La sarna en gatos puede ser causada por Notoedres cati (sarna sarcóptica felina) o Demodex cati. Notoedres es altamente contagiosa y puede transmitirse a humanos (zoonosis temporal). Comienza en la cabeza y orejas y puede extenderse a todo el cuerpo si no se trata.',
    symptoms: [
      { name: 'Picazón intensa en cabeza y orejas', severity: 'grave' },
      { name: 'Costras y engrosamiento de la piel', severity: 'moderada' },
      { name: 'Pérdida de pelo', severity: 'moderada' },
      { name: 'Heridas por rascado', severity: 'moderada' },
      { name: 'Piel enrojecida y escamosa', severity: 'leve' },
    ],
    prevention: [
      'Evitar el contacto con gatos callejeros sin diagnóstico.',
      'Aplicar antiparasitarios externos regularmente.',
      'Revisar la piel del gato periódicamente en busca de costras o lesiones.',
      'En caso de infestación: tratar todos los gatos del hogar simultáneamente.',
    ],
    treatment: [
      'Selamectina, ivermectina o moxidectina tópica u oral según prescripción.',
      'Baños con champú acaricida en casos extensos.',
      'Antibióticos si hay infecciones bacterianas secundarias por rascado.',
      'Tratamiento de todos los animales en contacto y desinfección del entorno.',
    ],
    homeCare: [
      'Lavar camas, mantas y accesorios a 60 °C o más.',
      'Aspirar y desinfectar todos los rincones del hogar.',
      'No permitir el contacto con otros animales hasta la cura completa.',
      'Usar guantes al manipular al gato para evitar la zoonosis.',
    ],
    whenToVet:
      'Picazón que no cede en 48 h, heridas extensas, costras en cara/orejas o si hay más gatos que requieren evaluación.',
  },
  {
    id: 'virus_inmunodeficiencia_felina',
    displayName: 'Virus Inmunodeficiencia Felina (FIV)',
    species: 'gato',
    category: 'infeccioso',
    ...cat('infeccioso'),
    icon: 'shield-half-outline',
    urgency: 'alta',
    contagious: true,
    shortDescription: 'El "VIH de los gatos" — destruye el sistema inmune gradualmente.',
    description:
      'El FIV se transmite principalmente por mordeduras profundas entre gatos. Debilita el sistema inmunológico progresivamente, haciendo al gato susceptible a infecciones oportunistas. No tiene cura, pero los gatos pueden vivir años con buena calidad de vida con manejo adecuado.',
    symptoms: [
      { name: 'Infecciones recurrentes de distinto tipo', severity: 'grave' },
      { name: 'Pérdida de peso progresiva', severity: 'moderada' },
      { name: 'Problemas bucales (gingivitis grave)', severity: 'moderada' },
      { name: 'Fiebre intermitente', severity: 'moderada' },
      { name: 'Letargo crónico', severity: 'moderada' },
      { name: 'Diarrea crónica', severity: 'leve' },
    ],
    prevention: [
      'Mantener al gato en interior para evitar peleas y mordeduras.',
      'Castrar a los machos para reducir comportamiento territorial y peleas.',
      'Hacer prueba de FIV a todos los gatos nuevos antes de integrarlos.',
      'No compartir comederos con gatos de estado sanitario desconocido.',
    ],
    treatment: [
      'No existe cura — el manejo es de soporte y preventivo.',
      'Tratamiento agresivo de cada infección oportunista que aparezca.',
      'Antivirales (zidovudina) pueden usarse en casos seleccionados.',
      'Revisiones veterinarias cada 6 meses para detectar problemas tempranos.',
      'Dieta de alta calidad para mantener el sistema inmune.',
    ],
    homeCare: [
      'Ambiente de interior exclusivo y sin estrés.',
      'Comida de alta calidad y agua fresca siempre disponible.',
      'Higiene dental frecuente para prevenir gingivitis grave.',
      'Observación diaria para detectar cambios sutiles de comportamiento o salud.',
    ],
    whenToVet:
      'Fiebre, pérdida de peso rápida, llagas en boca, infecciones recurrentes o cualquier cambio brusco de comportamiento.',
  },
  {
    id: 'leucemia_felina',
    displayName: 'Leucemia Felina (FeLV)',
    species: 'gato',
    category: 'infeccioso',
    ...cat('infeccioso'),
    icon: 'flask-outline',
    urgency: 'alta',
    contagious: true,
    shortDescription: 'Virus oncogénico que suprime el sistema inmune y puede causar cáncer.',
    description:
      'El FeLV se transmite por contacto íntimo (saliva, lamido, compartir comederos). Es oncogénico — puede causar linfomas y leucemias. Existen vacunas preventivas. Los gatos jóvenes son los más susceptibles. Existe un estadio de remisión donde el virus queda latente.',
    symptoms: [
      { name: 'Linfonodos inflamados', severity: 'moderada' },
      { name: 'Anemia (encías pálidas)', severity: 'grave' },
      { name: 'Pérdida de peso y apetito', severity: 'moderada' },
      { name: 'Infecciones recurrentes', severity: 'moderada' },
      { name: 'Diarrea crónica', severity: 'leve' },
      { name: 'Tumores palpables', severity: 'grave' },
    ],
    prevention: [
      'Vacunar especialmente a gatos con acceso al exterior o en multi-gato.',
      'Testear a todos los gatos nuevos antes de introducirlos.',
      'Separar gatos FeLV positivos de los negativos en hogares multi-gato.',
      'Mantener en interior para evitar contacto con gatos de estado desconocido.',
    ],
    treatment: [
      'No existe cura — tratamiento de soporte y manejo de complicaciones.',
      'Quimioterapia si se desarrolla linfoma.',
      'Transfusiones para la anemia severa.',
      'Inmunomoduladores como coadyuvantes.',
      'Revisión cada 6 meses con hemograma completo.',
    ],
    homeCare: [
      'Ambiente interior limpio y sin estrés.',
      'Dieta de alta calidad y suplementos inmunes bajo supervisión.',
      'Nunca dar alimentos crudos — el sistema inmune comprometido aumenta el riesgo.',
      'Separar utensilios de gatos no infectados en el hogar.',
    ],
    whenToVet:
      'Ganglios inflamados, encías pálidas, bultos palpables, infecciones que no mejoran o decaimiento brusco.',
  },
  {
    id: 'enfermedad_renal_cronica',
    displayName: 'Enfermedad Renal Crónica',
    species: 'gato',
    category: 'renal',
    ...cat('renal'),
    icon: 'water-outline',
    urgency: 'alta',
    contagious: false,
    shortDescription: 'Deterioro progresivo del riñón — la enfermedad crónica más frecuente en gatos mayores.',
    description:
      'La ERC afecta aproximadamente al 30% de los gatos mayores de 15 años. Los riñones pierden capacidad progresivamente para filtrar toxinas. No tiene cura, pero con manejo temprano la calidad de vida puede mantenerse por años. La detección precoz con análisis es clave.',
    symptoms: [
      { name: 'Sed extrema y orina abundante', severity: 'moderada' },
      { name: 'Pérdida de peso progresiva', severity: 'grave' },
      { name: 'Vómitos frecuentes', severity: 'moderada' },
      { name: 'Pérdida de apetito', severity: 'moderada' },
      { name: 'Mal aliento (olor a amoníaco)', severity: 'leve' },
      { name: 'Pelaje opaco y descuidado', severity: 'leve' },
    ],
    prevention: [
      'Análisis de sangre y orina anual en gatos mayores de 7 años.',
      'Mantener una excelente hidratación con fuentes de agua circulantes.',
      'Dieta húmeda para aumentar la ingesta de agua.',
      'Evitar AINEs, algunos antibióticos y tóxicos renales sin prescripción.',
    ],
    treatment: [
      'Dieta renal de prescripción baja en fósforo y proteína moderada.',
      'Fluidoterapia subcutánea en casa o IV según estadio.',
      'Inhibidores del eje renina-angiotensina (benazepril) para proteger el riñón.',
      'Quelantes de fósforo y suplementos de potasio según análisis.',
      'Eritropoyetina si hay anemia renal significativa.',
    ],
    homeCare: [
      'Administrar fluidos subcutáneos en casa según protocolo del veterinario.',
      'Bebedero circulante disponible 24 h.',
      'Dieta renal exclusiva — los premios también deben ser renales.',
      'Pesaje semanal para detectar pérdida de peso.',
      'Análisis de control cada 3 meses.',
    ],
    whenToVet:
      'Vómitos diarios, anorexia de más de 24 h, decaimiento brusco, convulsiones o pérdida de peso rápida.',
  },
  {
    id: 'miocardiopatia_hipertrofica',
    displayName: 'Miocardiopatía Hipertrófica (MCH)',
    species: 'gato',
    category: 'cardiaco',
    ...cat('cardiaco'),
    icon: 'heart-outline',
    urgency: 'alta',
    contagious: false,
    shortDescription: 'Engrosamiento del músculo cardíaco — causa más frecuente de muerte cardíaca en gatos.',
    description:
      'La MCH es la cardiopatía más frecuente en gatos, especialmente en Maine Coon y Ragdoll. El músculo cardíaco se engrosa, reduciendo la capacidad de bombeo. Puede causar insuficiencia cardíaca congestiva, tromboembolismo aórtico (parálisis de patas traseras) o muerte súbita.',
    symptoms: [
      { name: 'Respiración rápida en reposo (>40 rpm)', severity: 'grave' },
      { name: 'Respiración con la boca abierta', severity: 'grave' },
      { name: 'Parálisis súbita de patas traseras', severity: 'grave' },
      { name: 'Letargo y debilidad', severity: 'moderada' },
      { name: 'Pérdida de apetito', severity: 'moderada' },
      { name: 'Intolerancia al ejercicio o estrés', severity: 'leve' },
    ],
    prevention: [
      'Cribado ecocardiográfico en razas predispuestas desde los 2 años.',
      'Evitar el estrés — puede desencadenar insuficiencia cardíaca aguda.',
      'Prueba genética (MYBPC3) en Maine Coon y Ragdoll.',
      'No usar reproductores con MCH positiva para reducir prevalencia.',
    ],
    treatment: [
      'Atenolol o diltiazem para controlar la frecuencia cardíaca.',
      'Furosemida (diurético) en casos de edema pulmonar.',
      'Clopidogrel o aspirina para prevenir tromboembolismo.',
      'Ecocardiografía de seguimiento cada 6–12 meses.',
    ],
    homeCare: [
      'Monitorear la frecuencia respiratoria en reposo — más de 40 r/min es urgente.',
      'Ambiente tranquilo, sin ruidos fuertes ni estrés.',
      'Pesar al gato semanalmente (aumento súbito indica retención de líquido).',
      'Administrar todos los medicamentos sin faltar a ninguna dosis.',
    ],
    whenToVet:
      'Respiración rápida o con boca abierta, parálisis de patas traseras, frialdad en extremidades o desmayo son emergencias cardíacas.',
  },
  {
    id: 'toxoplasmosis_felina',
    displayName: 'Toxoplasmosis Felina',
    species: 'gato',
    category: 'infeccioso',
    ...cat('infeccioso'),
    icon: 'alert-circle-outline',
    urgency: 'media',
    contagious: false,
    shortDescription: 'Parásito que puede afectar al gato y transmitirse a humanos (zoonosis importante).',
    description:
      'Toxoplasma gondii es un parásito intracelular del que el gato es el huésped definitivo. La mayoría de los gatos infectados no muestran síntomas. El riesgo mayor es para humanos inmunocomprometidos y mujeres embarazadas (malformaciones fetales). La higiene de la bandeja es clave.',
    symptoms: [
      { name: 'Fiebre (en infección activa)', severity: 'moderada' },
      { name: 'Letargo y pérdida de apetito', severity: 'leve' },
      { name: 'Problemas oculares (uveítis)', severity: 'moderada' },
      { name: 'Síntomas neurológicos en casos graves', severity: 'grave' },
      { name: 'Dificultad respiratoria', severity: 'moderada' },
    ],
    prevention: [
      'No dar carne cruda o poco cocida al gato.',
      'Limpiar la bandeja cada 24 h con guantes (los ooquistes tardan 1–5 días en volverse infectivos).',
      'Embarazadas y personas inmunocomprometidas no deben limpiar la bandeja.',
      'Mantener el gato en interior para evitar cazar presas infectadas.',
    ],
    treatment: [
      'Clindamicina durante 4 semanas como tratamiento de elección.',
      'Pirimetamina + sulfadiazina en casos neurológicos o refractarios.',
      'Tratamiento ocular específico para la uveítis.',
      'Soporte nutricional si hay pérdida de peso significativa.',
    ],
    homeCare: [
      'Higiene rigurosa de la bandeja diariamente con guantes.',
      'Completar el ciclo antibiótico completo.',
      'Monitorear ojos y comportamiento durante y tras el tratamiento.',
      'Restricción de acceso al exterior para evitar reinfección.',
    ],
    whenToVet:
      'Problemas oculares visibles, síntomas neurológicos (convulsiones, incoordinación) o fiebre que no cede en 48 h.',
  },
  {
    id: 'neumonia_felina',
    displayName: 'Neumonía Felina',
    species: 'gato',
    category: 'respiratorio',
    ...cat('respiratorio'),
    icon: 'cellular-outline',
    urgency: 'alta',
    contagious: false,
    shortDescription: 'Infección pulmonar grave que compromete la respiración y requiere tratamiento urgente.',
    description:
      'La neumonía en gatos puede ser bacteriana, viral (frecuentemente como complicación de rinotraqueítis), por aspiración o fúngica. Los gatitos y gatos geriátricos son los más vulnerables. Puede progresar rápidamente a insuficiencia respiratoria sin tratamiento.',
    symptoms: [
      { name: 'Respiración rápida y esforzada', severity: 'grave' },
      { name: 'Tos (menos frecuente que en perros)', severity: 'moderada' },
      { name: 'Fiebre alta', severity: 'moderada' },
      { name: 'Cianosis (encías azules)', severity: 'grave' },
      { name: 'Letargo extremo y anorexia', severity: 'grave' },
      { name: 'Postura con codos separados para respirar', severity: 'grave' },
    ],
    prevention: [
      'Vacunar con FVRCP para prevenir complicaciones de rinotraqueítis.',
      'Tratamiento precoz de infecciones respiratorias antes de progresar.',
      'Evitar corrientes de aire, humedad y frío en gatitos y geriátricos.',
      'Diagnóstico rápido de cualquier dificultad respiratoria.',
    ],
    treatment: [
      'Antibióticos de amplio espectro durante 3–6 semanas.',
      'Oxigenoterapia urgente en casos de disnea grave.',
      'Nebulizaciones con solución salina para humidificar las vías.',
      'Estimulantes del apetito y nutrición asistida.',
      'Hospitalización con monitoreo radiológico.',
    ],
    homeCare: [
      'Nebulizaciones en baño con vapor 10 min, 2–3 veces al día.',
      'Ambiente cálido y libre de humo, aerosoles y polvo.',
      'Calentar la comida húmeda para estimular el olfato y el apetito.',
      'No suspender antibióticos antes del tiempo prescrito.',
    ],
    whenToVet:
      'Respiración con la boca abierta, encías azuladas, postración o fiebre mayor a 39.5 °C en reposo — emergencia inmediata.',
  },
  {
    id: 'dermatitis_por_pulgas',
    displayName: 'Dermatitis por Pulgas (DAPP)',
    species: 'gato',
    category: 'dermatologico',
    ...cat('dermatologico'),
    icon: 'bug-outline',
    urgency: 'baja',
    contagious: false,
    shortDescription: 'Reacción alérgica intensa a la saliva de pulgas — incluso una sola picadura basta.',
    description:
      'La dermatitis alérgica a la picadura de pulgas (DAPP) es la causa más frecuente de picazón en gatos. El gato es alérgico a proteínas de la saliva de la pulga, y una sola picadura puede desencadenar semanas de picazón. El control de pulgas es el único tratamiento definitivo.',
    symptoms: [
      { name: 'Picazón intensa (zona lumbar/base de cola)', severity: 'grave' },
      { name: 'Pérdida de pelo simétrica en lomo y vientre', severity: 'moderada' },
      { name: 'Costras miliares (pequeñas costritas)', severity: 'moderada' },
      { name: 'Lamido excesivo del abdomen', severity: 'moderada' },
      { name: 'Heridas por mordisqueo', severity: 'leve' },
    ],
    prevention: [
      'Antiparasitario externo mensual (selamectina, fluralaner) durante TODO el año.',
      'Tratar a TODOS los animales del hogar simultáneamente.',
      'Desinfectar el entorno: aspirar y usar insecticida ambiental.',
      'Lavar camas y textiles a 60 °C mensualmente.',
    ],
    treatment: [
      'Eliminación de pulgas del animal y del entorno (imprescindible).',
      'Corticosteroides a dosis decreciente para el prurito agudo.',
      'Antibióticos si hay infecciones secundarias por rascado.',
      'Champú antipulgas seguido de antiparasitario de larga duración.',
    ],
    homeCare: [
      'Aplicar el antiparasitario exactamente al mes, sin retraso.',
      'Aspirar diariamente el hogar durante el tratamiento.',
      'Aplicar el antiparasitario ambiental en rincones, camas y tapicería.',
      'Recordar que el 95% de las pulgas están en el entorno, no en el animal.',
    ],
    whenToVet:
      'Pérdida de pelo extensa, heridas infectadas, anemia en gatitos (las pulgas consumen sangre) o falta de respuesta al antiparasitario.',
  },
];

export const CARE_GUIDE: CareSection[] = [
  {
    icon: 'nutrition-outline',
    color: '#f7a55b',
    title: 'Nutrición y Alimentación',
    subtitle: 'La base de una vida larga y saludable',
    species: 'ambos',
    tips: [
      'Elige alimento balanceado de calidad con carne real como primer ingrediente.',
      'Adapta la porción al peso, edad y nivel de actividad — consulta con tu veterinario.',
      'Ofrece agua fresca limpia en todo momento; cámbiala al menos una vez al día.',
      'Evita cambios bruscos de dieta — hazlo gradualmente en 7–10 días.',
      'Nunca ofrecer: chocolate, uvas, pasas, cebolla, ajo, xilitol ni alcohol.',
      'Los premios no deben superar el 10% de las calorías diarias.',
    ],
  },
  {
    icon: 'shield-checkmark-outline',
    color: '#e05b5b',
    title: 'Vacunación y Desparasitación',
    subtitle: 'Protección esencial frente a enfermedades graves',
    species: 'ambos',
    tips: [
      'Vacuna según el calendario indicado por tu veterinario desde cachorro/gatito.',
      'Los refuerzos anuales mantienen la inmunidad activa y efectiva.',
      'Desparasitación interna cada 3 meses en adultos; mensual en cachorros.',
      'Antiparasitario externo mensual o trimestral según el producto elegido.',
      'Lleva un registro escrito de todas las vacunas y desparasitaciones.',
    ],
  },
  {
    icon: 'fitness-outline',
    color: '#5b8af7',
    title: 'Ejercicio y Actividad',
    subtitle: 'Mente sana en cuerpo sano',
    species: 'perro',
    tips: [
      'Mínimo 2 paseos al día adaptados a la raza y edad del perro.',
      'El ejercicio reduce ansiedad, obesidad y problemas de comportamiento.',
      'Enriquecimiento mental: juegos de olfato, entrenamiento y juguetes interactivos.',
      'Evita ejercicio intenso después de comer (riesgo de torsión gástrica en razas grandes).',
      'Cachorros menores de 1 año: evita saltos y carreras largas para proteger las articulaciones.',
    ],
  },
  {
    icon: 'paw-outline',
    color: '#8f5be0',
    title: 'Enriquecimiento Felino',
    subtitle: 'El bienestar interior del gato',
    species: 'gato',
    tips: [
      'Proporciona rascadores verticales y horizontales para cubrir necesidades naturales.',
      'Juega activamente con el gato al menos 15–20 minutos dos veces al día.',
      'Lugares en altura (árboles de gato, estantes) reducen el estrés felino.',
      'Múltiples bandejas: una por gato más una extra, limpias a diario.',
      'Las ventanas con vistas y comederos para pájaros son "TV de gatos" gratis.',
    ],
  },
  {
    icon: 'cut-outline',
    color: '#2dbe7a',
    title: 'Higiene y Aseo',
    subtitle: 'Prevención de muchas enfermedades cutáneas',
    species: 'ambos',
    tips: [
      'Baño mensual en perros de pelo corto; quincenal en los de pelo largo.',
      'Cepillado semanal o diario según la longitud del pelaje.',
      'Limpieza de orejas semanal con solución específica — sin bastoncillos.',
      'Corte de uñas cada 3–4 semanas o cuando suenen al caminar en suelo duro.',
      'Limpieza ocular con gasa húmeda estéril si hay legañas.',
    ],
  },
  {
    icon: 'happy-outline',
    color: '#e05b8f',
    title: 'Salud Dental',
    subtitle: 'El 80% de los perros tienen problemas dentales a los 3 años',
    species: 'ambos',
    tips: [
      'Cepilla los dientes con pasta dental específica para mascotas (mínimo 3 veces/semana).',
      'Nunca usar pasta dental humana — el flúor es tóxico para mascotas.',
      'Premios dentales y juguetes de goma dura como complemento.',
      'Limpieza profesional anual bajo anestesia si hay sarro acumulado.',
      'La mala higiene dental causa infecciones que afectan corazón, riñones e hígado.',
    ],
  },
  {
    icon: 'calendar-outline',
    color: '#5bc4e0',
    title: 'Visitas Veterinarias',
    subtitle: 'La prevención es siempre más barata que el tratamiento',
    species: 'ambos',
    tips: [
      'Revisión general anual hasta los 7 años; semestral en mayores.',
      'Análisis de sangre y orina anual a partir de los 7 años.',
      'No esperes síntomas graves — el veterinario puede detectar problemas preclínicos.',
      'Lleva un historial de comportamiento, hábitos y cambios observados.',
      'Esterilización: reduce el riesgo de cánceres reproductivos y problemas de conducta.',
    ],
  },
  {
    icon: 'heart-outline',
    color: '#e05b5b',
    title: 'Bienestar Emocional',
    subtitle: 'Las mascotas sienten estrés, ansiedad y tristeza',
    species: 'ambos',
    tips: [
      'Establece rutinas estables de comida, paseos y juego.',
      'Nunca castigues físicamente — genera miedo y agresividad.',
      'Refuerzo positivo: premia los comportamientos deseados inmediatamente.',
      'Identifica señales de estrés: lamido excesivo, agresividad, inapetencia.',
      'Consulta a un etólogo si hay problemas de comportamiento persistentes.',
    ],
  },
];
