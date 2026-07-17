export interface EmergencyScenario {
  id: string;
  title: string;
  icon: string;
  color: string;
  shortDescription: string;
  recognize: string[];
  doNow: string[];
  doNotDo: string[];
  goNowIf: string;
}

export const EMERGENCY_SCENARIOS: EmergencyScenario[] = [
  {
    id: 'atragantamiento',
    title: 'Atragantamiento',
    icon: 'warning-outline',
    color: '#e05b5b',
    shortDescription: 'Un objeto o alimento bloquea las vías respiratorias.',
    recognize: [
      'Se rasca o araña la boca con las patas.',
      'Tose o tiene arcadas sin expulsar nada.',
      'Respiración ruidosa, con dificultad marcada, o ausente.',
      'Encías empiezan a verse azuladas.',
    ],
    doNow: [
      'Abre su boca con cuidado y revisa si el objeto es visible; retíralo solo si lo puedes tomar con los dedos sin empujarlo más adentro.',
      'Si no lo alcanzas, en perros/gatos pequeños puedes levantarlo con la cabeza hacia abajo y dar palmadas firmes entre los omóplatos.',
      'En animales grandes que no puedan levantarse, aplica compresiones firmes en ambos costados del abdomen, justo detrás de las últimas costillas (maniobra tipo Heimlich veterinaria).',
      'Traslada a la clínica de inmediato aunque logres retirar el objeto, para descartar lesiones internas.',
    ],
    doNotDo: [
      'No metas los dedos a ciegas ni intentes sacar el objeto con pinzas si no lo ves bien — puedes empujarlo más adentro.',
      'No pierdas tiempo intentándolo por más de 1 minuto si no hay resultado: sal hacia la clínica de inmediato.',
    ],
    goNowIf:
      'Si no respira, si las encías están azules/moradas, o si pierde el conocimiento — es una emergencia crítica, ve inmediatamente.',
  },
  {
    id: 'envenenamiento',
    title: 'Envenenamiento / Ingestión de tóxicos',
    icon: 'flask-outline',
    color: '#7b7b7b',
    shortDescription: 'Ingirió veneno para roedores, chocolate, plantas tóxicas, medicamentos u otro tóxico.',
    recognize: [
      'Vómitos o diarrea repentinos, a veces con sangre.',
      'Temblores, convulsiones o debilidad extrema.',
      'Babeo excesivo o encías pálidas.',
      'Envase de un producto tóxico mordido o vacío cerca de la mascota.',
    ],
    doNow: [
      'Identifica y guarda el envase o resto del producto ingerido — el veterinario necesita saber exactamente qué fue.',
      'Anota la hora aproximada de la ingestión y la cantidad si es posible estimarla.',
      'Llama a la clínica de inmediato y describe el tóxico antes de trasladarte, para que te indiquen si conviene inducir el vómito o no (depende del tóxico).',
      'Si tiene el producto en el pelaje o la piel, lava la zona con agua abundante.',
    ],
    doNotDo: [
      'Nunca induzcas el vómito por tu cuenta sin indicación veterinaria: con algunos tóxicos (cáusticos, derivados de petróleo) el vómito empeora el daño.',
      'No le des leche, sal, ni remedios caseros — no neutralizan la mayoría de los tóxicos y pueden retrasar el tratamiento real.',
    ],
    goNowIf:
      'Cualquier sospecha de ingestión de raticida, anticongelante, chocolate en cantidad, xilitol (chicles/dulces sin azúcar) o medicamentos humanos es emergencia inmediata, tenga o no síntomas todavía.',
  },
  {
    id: 'sangrado',
    title: 'Sangrado y heridas',
    icon: 'bandage-outline',
    color: '#e05b8f',
    shortDescription: 'Herida abierta, corte profundo o sangrado que no se detiene.',
    recognize: [
      'Sangre visible que empapa la venda o el suelo continuamente.',
      'Herida profunda con tejido expuesto.',
      'Debilidad o encías pálidas por pérdida de sangre.',
    ],
    doNow: [
      'Aplica presión firme y directa sobre la herida con una gasa o tela limpia durante al menos 5 minutos sin retirarla para revisar.',
      'Si empapa la tela, coloca otra encima sin quitar la primera.',
      'Eleva la zona afectada por encima del nivel del corazón si es posible.',
      'Cubre con una venda (no demasiado apretada) y trasládalo a la clínica.',
    ],
    doNotDo: [
      'No apliques alcohol, agua oxigenada ni polvos caseros directamente sobre heridas profundas — irritan el tejido.',
      'No retires objetos empalados (astillas grandes, clavos) — inmovilízalos y deja que el veterinario los retire.',
      'No aprietes un torniquete salvo hemorragia masiva en una extremidad que no cede con presión directa.',
    ],
    goNowIf:
      'El sangrado no cede tras 5-10 minutos de presión directa, la herida es profunda o extensa, o hay signos de debilidad/encías pálidas.',
  },
  {
    id: 'golpe_calor',
    title: 'Golpe de calor',
    icon: 'sunny-outline',
    color: '#f0c040',
    shortDescription: 'Sobrecalentamiento por exposición al sol, encierro en auto o ejercicio intenso en calor.',
    recognize: [
      'Jadeo muy intenso y descontrolado.',
      'Encías rojo intenso o azuladas, saliva espesa.',
      'Debilidad, tambaleo o colapso.',
      'Vómitos, diarrea, a veces con sangre.',
    ],
    doNow: [
      'Retira a la mascota del calor de inmediato, a un lugar fresco y con sombra o aire acondicionado.',
      'Moja el cuerpo (no la cabeza) con agua fresca (NO helada) en el cuello, axilas e ingles, y usa un ventilador si tienes.',
      'Ofrece agua fresca en pequeñas cantidades si está consciente; no lo obligues a beber.',
      'Trasládalo al veterinario de inmediato aunque parezca mejorar — el daño interno puede continuar horas después.',
    ],
    doNotDo: [
      'No uses agua helada ni hielo directo — la vasoconstricción brusca dificulta que el cuerpo libere el calor interno.',
      'No lo cubras con toallas mojadas sin recambiarlas — atrapan el calor.',
      'Nunca dejes una mascota sola dentro de un vehículo, ni con las ventanas entreabiertas.',
    ],
    goNowIf:
      'Temperatura corporal muy elevada, colapso, convulsiones o falta de respuesta — es una emergencia con riesgo de muerte incluso si mejora aparentemente.',
  },
  {
    id: 'convulsiones',
    title: 'Convulsiones',
    icon: 'pulse-outline',
    color: '#8f5be0',
    shortDescription: 'Episodio de movimientos musculares involuntarios, con o sin pérdida de conciencia.',
    recognize: [
      'Rigidez, sacudidas o "pedaleo" de las patas.',
      'Pérdida de control de esfínteres.',
      'Babeo excesivo y mandíbula apretada.',
      'Puede no responder a estímulos durante el episodio.',
    ],
    doNow: [
      'Aleja muebles y objetos con los que se pueda golpear; despeja el área alrededor.',
      'No la sujetes con fuerza; deja que el episodio siga su curso mientras la proteges de golpes.',
      'Cronometra la duración exacta de la convulsión.',
      'Cuando termine, mantenla en un lugar oscuro y silencioso, y trasládala al veterinario.',
    ],
    doNotDo: [
      'No metas las manos ni objetos en su boca — durante una convulsión NO puede tragarse la lengua, y podrías ser mordido accidentalmente.',
      'No la muevas innecesariamente durante el episodio salvo que esté en peligro (escaleras, agua, cerca de vidrio).',
    ],
    goNowIf:
      'La convulsión dura más de 5 minutos, se repiten varias en poco tiempo (racimo), o no recupera la conciencia entre episodios — emergencia crítica inmediata.',
  },
  {
    id: 'dificultad_respiratoria',
    title: 'Dificultad respiratoria severa',
    icon: 'cloud-outline',
    color: '#5b8af7',
    shortDescription: 'Respiración con esfuerzo marcado, muy rápida o insuficiente.',
    recognize: [
      'Respira con el cuello estirado y la boca abierta.',
      'Movimiento abdominal exagerado al respirar.',
      'Encías o lengua azuladas/moradas (cianosis).',
      'Se niega a recostarse o busca posiciones para respirar mejor.',
    ],
    doNow: [
      'Mantén a la mascota calmada y en un ambiente fresco y ventilado — el estrés empeora la dificultad respiratoria.',
      'Evita manipularla más de lo necesario; llévala en una posición cómoda para ella, sin forzar postura.',
      'Traslado inmediato a la clínica más cercana; llama antes para que estén preparados al llegar.',
    ],
    doNotDo: [
      'No la fuerces a caminar, correr o subir escaleras.',
      'No le des agua ni comida si está luchando por respirar (riesgo de aspiración).',
    ],
    goNowIf:
      'Cualquier dificultad respiratoria marcada, encías azuladas o respiración con la boca abierta en un gato (los gatos casi nunca respiran así de forma normal) es emergencia inmediata.',
  },
  {
    id: 'traumatismo',
    title: 'Traumatismo / Atropello',
    icon: 'car-outline',
    color: '#5bc4e0',
    shortDescription: 'Golpe fuerte, caída de altura o atropello.',
    recognize: [
      'Cojera, incapacidad para apoyar una extremidad.',
      'Dolor intenso al tocar alguna zona del cuerpo.',
      'Sangrado externo o interno (encías pálidas sin herida visible).',
      'Dificultad para respirar tras el golpe.',
    ],
    doNow: [
      'Antes de acercarte, ten cuidado: un animal con dolor puede morder incluso a su dueño; aproxímate con calma y voz suave.',
      'Si es posible, desliza a la mascota sobre una superficie rígida y plana (tabla, manta firme) para moverla sin flexionar la columna.',
      'Cúbrela con una manta para mantener su temperatura y reducir el shock.',
      'Trasládala de inmediato, incluso si "parece estar bien" — el daño interno no siempre es visible al momento.',
    ],
    doNotDo: [
      'No la muevas tirando de patas o cola.',
      'No le des analgésicos humanos — muchos son tóxicos para perros y gatos.',
      'No asumas que está bien solo porque camina; el shock puede enmascarar lesiones graves en la primera media hora.',
    ],
    goNowIf:
      'Cualquier atropello o caída de altura significativa requiere evaluación veterinaria inmediata, incluso sin signos visibles.',
  },
  {
    id: 'torsion_gastrica',
    title: 'Distensión / torsión gástrica',
    icon: 'alert-circle-outline',
    color: '#e0965b',
    shortDescription: 'El estómago se hincha y puede girar sobre sí mismo — típica en perros grandes de pecho profundo tras comer mucho o hacer ejercicio después de comer.',
    recognize: [
      'Abdomen visiblemente hinchado y duro al tacto.',
      'Intentos repetidos de vomitar sin lograr expulsar nada (arcadas secas).',
      'Inquietud extrema, no puede quedarse quieto ni acostarse cómodo.',
      'Salivación excesiva y respiración acelerada.',
    ],
    doNow: [
      'No hay primeros auxilios efectivos en casa para esta condición — requiere cirugía de urgencia.',
      'Traslado inmediato a la clínica más cercana, sin demora.',
      'Llama en el camino para que preparen quirófano; esta condición puede ser mortal en pocas horas.',
    ],
    doNotDo: [
      'No le des agua ni comida.',
      'No intentes hacerlo vomitar ni presionar el abdomen.',
      'No esperes "a ver si mejora" — el deterioro es muy rápido.',
    ],
    goNowIf:
      'Abdomen hinchado + arcadas sin vómito en un perro grande es SIEMPRE una emergencia crítica inmediata, sin excepción.',
  },
  {
    id: 'reaccion_alergica',
    title: 'Reacción alérgica severa',
    icon: 'body-outline',
    color: '#2dbe7a',
    shortDescription: 'Picadura de insecto, contacto con alérgeno o reacción a medicamento con hinchazón facial repentina.',
    recognize: [
      'Hinchazón repentina del hocico, párpados u orejas.',
      'Ronchas o placas rojas que aparecen de golpe en la piel.',
      'Dificultad para respirar o tragar en casos graves.',
      'Vómitos o diarrea que acompañan la hinchazón.',
    ],
    doNow: [
      'Si viste el aguijón de una abeja, retíralo raspando con una tarjeta (no lo aprietes con pinzas, puede liberar más veneno).',
      'Aplica frío local (paño con hielo envuelto) en la zona hinchada si es localizada.',
      'Observa de cerca la respiración durante los siguientes 30-60 minutos.',
      'Contacta al veterinario — muchas reacciones alérgicas requieren antihistamínico o corticoide en dosis veterinaria correcta.',
    ],
    doNotDo: [
      'No le des antihistamínicos humanos sin confirmar dosis y producto seguro con el veterinario — algunos son tóxicos en ciertas presentaciones.',
      'No ignores una hinchazón facial "porque no le molesta" — puede progresar a dificultad respiratoria.',
    ],
    goNowIf:
      'Dificultad para respirar o tragar, hinchazón que avanza rápido, o colapso — es una emergencia anafiláctica, ve de inmediato.',
  },
  {
    id: 'colapso',
    title: 'Pérdida de conocimiento / colapso',
    icon: 'body-outline',
    color: '#c0392b',
    shortDescription: 'La mascota se desploma o no responde a estímulos.',
    recognize: [
      'No responde a su nombre, tacto ni sonidos.',
      'Respiración muy débil, irregular o ausente.',
      'Encías muy pálidas, azuladas o grisáceas.',
      'Pulso débil o imperceptible.',
    ],
    doNow: [
      'Verifica si respira: observa el movimiento del tórax o acerca tu mano/mejilla al hocico.',
      'Colócala de lado, con el cuello ligeramente extendido para mantener la vía aérea abierta.',
      'Si no respira y tienes entrenamiento, puedes iniciar compresiones torácicas mientras alguien más llama a la clínica — pide indicación telefónica del veterinario si es posible.',
      'Traslado inmediato, manteniéndola abrigada durante el trayecto.',
    ],
    doNotDo: [
      'No le des nada por la boca (agua, comida, medicamentos) si está inconsciente — riesgo de asfixia.',
      'No pierdas tiempo esperando "a que reaccione" — cada minuto cuenta.',
    ],
    goNowIf:
      'Cualquier pérdida de conocimiento es siempre una emergencia crítica inmediata — llama a la clínica mientras te trasladas.',
  },
];

export const UNIVERSAL_RED_FLAGS: string[] = [
  'Dificultad para respirar o respiración con la boca abierta en un gato.',
  'Encías pálidas, azuladas, moradas o grises.',
  'Incapacidad para levantarse o pérdida de conocimiento.',
  'Convulsión que dura más de 5 minutos o se repite varias veces.',
  'Abdomen hinchado y duro, con o sin arcadas secas.',
  'Sangrado que no se detiene tras 5-10 minutos de presión directa.',
  'Sospecha de haber ingerido veneno, medicamentos humanos o chocolate.',
  'Dolor extremo: se queja, gruñe al ser tocado, o adopta posturas anormales.',
  'Temperatura corporal muy alta (golpe de calor) o muy baja (hipotermia).',
  'Traumatismo reciente (atropello, caída, pelea) aunque parezca estar bien.',
  'Intentos de vomitar sin lograrlo, especialmente en perros grandes.',
  'Parto prolongado (más de 2 horas de esfuerzo sin nacer una cría).',
];

export const FIRST_AID_KIT: string[] = [
  'Gasas estériles, venda elástica y esparadrapo hipoalergénico.',
  'Solución salina estéril para limpiar heridas y ojos.',
  'Guantes desechables.',
  'Termómetro digital de uso rectal (temperatura normal: 38-39.2 °C aprox.).',
  'Manta ligera para transportar o abrigar en shock.',
  'Bozal blando o venda para improvisar uno (incluso el animal más dócil puede morder con dolor).',
  'Tarjeta con el teléfono de tu veterinario y de una clínica de emergencia 24h.',
  'Copia de la cartilla de vacunación.',
  'Pinzas de punta roma (para retirar espinas, garrapatas o aguijones, no objetos profundos).',
];
