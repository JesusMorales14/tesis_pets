/**
 * Guía de referencia para que el dueño elija la gravedad correcta de cada
 * síntoma. Sin esto, "leve/moderado/grave" es subjetivo y dos dueños
 * describiendo el mismo cuadro clínico podrían elegir niveles distintos —
 * lo cual degrada directamente la precisión del modelo, que fue entrenado
 * con una escala de severidad consistente (ver backend/data/SOURCES.md).
 * Las descripciones son señales observables sin entrenamiento veterinario,
 * no diagnósticos.
 */
export interface SeverityGuide {
  leve: string;
  moderado: string;
  grave: string;
}

export const SEVERITY_GUIDES: Record<string, SeverityGuide> = {
  // Neurológicos
  espasmos: {
    leve: 'Contracciones breves y aisladas.',
    moderado: 'Se repiten varias veces en el día.',
    grave: 'Continuos o junto con otros signos neurológicos.',
  },
  convulsiones: {
    leve: 'Un episodio corto (segundos) y no volvió a pasar.',
    moderado: 'Más de un episodio en el día.',
    grave: 'Dura más de 2-3 minutos, o hay varias seguidas sin recuperarse — emergencia.',
  },
  desorientacion: {
    leve: 'Se choca con algo ocasionalmente o duda al caminar.',
    moderado: 'Camina en círculos o no reconoce su entorno seguido.',
    grave: 'No reconoce a su dueño ni su casa.',
  },
  temblores: {
    leve: 'Tiembla un poco y se le pasa solo.',
    moderado: 'Tiembla de forma visible y repetida.',
    grave: 'Temblores fuertes y constantes que no paran.',
  },
  confusion: {
    leve: 'Se ve distraído o tarda en reaccionar.',
    moderado: 'No responde a su nombre ni a estímulos habituales.',
    grave: 'No reacciona a nada, parece "ausente".',
  },

  // Respiratorios
  tos_seca: {
    leve: 'Tose pocas veces al día.',
    moderado: 'Tose seguido, varias veces por hora.',
    grave: 'Tos constante que no lo deja descansar.',
  },
  tos: {
    leve: 'Tose pocas veces al día.',
    moderado: 'Tose seguido, varias veces por hora.',
    grave: 'Tos constante que no lo deja descansar.',
  },
  jadeo_excesivo: {
    leve: 'Jadea más de lo normal después de hacer ejercicio.',
    moderado: 'Jadea incluso en reposo.',
    grave: 'Jadea con la boca muy abierta y no logra calmarse.',
  },
  respiracion_rapida: {
    leve: 'Respira un poco más rápido de lo normal.',
    moderado: 'Se nota el pecho moverse rápido incluso en reposo.',
    grave: 'Respira con mucho esfuerzo, boca abierta, se le ven las costillas moverse.',
  },
  cianosis: {
    leve: 'Tono azulado leve y pasajero en labios o lengua.',
    moderado: 'Color azulado visible que no se quita rápido.',
    grave: 'Labios, lengua o encías claramente azules o morados — siempre es una emergencia.',
  },
  asfixia_aparente: {
    leve: 'Se ahoga un momento pero se recupera solo.',
    moderado: 'Episodios cortos repetidos de dificultad para respirar.',
    grave: 'Lucha visiblemente por respirar, no logra recuperar el aire — emergencia.',
  },

  // Digestivos
  vomitos: {
    leve: 'Una vez en el día; después come y actúa normal.',
    moderado: 'Varias veces en el día; se ve decaído después.',
    grave: 'Vomita todo lo que come o bebe, no retiene nada.',
  },
  diarrea: {
    leve: 'Heces un poco blandas, una sola vez.',
    moderado: 'Diarrea líquida varias veces al día.',
    grave: 'Diarrea constante, con sangre o moco, o con signos de deshidratación.',
  },
  nauseas: {
    leve: 'Se relame o traga seguido, sin llegar a vomitar.',
    moderado: 'Arcadas ocasionales sin vomitar.',
    grave: 'Náuseas constantes que le impiden comer.',
  },
  gases: {
    leve: 'Gases ocasionales.',
    moderado: 'Gases frecuentes con molestia notoria.',
    grave: 'Abdomen inflamado y con dolor evidente.',
  },
  arcadas_frecuentes: {
    leve: 'Arcadas aisladas.',
    moderado: 'Arcadas repetidas en el día.',
    grave: 'Arcadas constantes, con o sin vómito.',
  },
  dificultad_comer: {
    leve: 'Come un poco menos de lo normal.',
    moderado: 'Apenas prueba la comida.',
    grave: 'No ha comido nada en más de un día.',
  },
  heces_con_sangre: {
    leve: 'Hilos o manchas de sangre ocasionales.',
    moderado: 'Sangre visible mezclada en varias deposiciones.',
    grave: 'Heces con mucha sangre o casi completamente sanguinolentas — busca atención inmediata.',
  },
  heces_negras: {
    leve: 'Heces algo más oscuras de lo normal.',
    moderado: 'Heces claramente negras y con aspecto alquitranado.',
    grave: 'Heces negras junto con debilidad o vómito — puede indicar sangrado interno.',
  },
  estreñimiento: {
    leve: 'Tarda un poco más en defecar.',
    moderado: 'Lleva más de un día sin defecar, con esfuerzo visible.',
    grave: 'Varios días sin defecar, con dolor o vómito.',
  },
  distension_abdominal: {
    leve: 'Abdomen un poco más lleno de lo usual.',
    moderado: 'Abdomen visiblemente hinchado.',
    grave: 'Abdomen muy hinchado y duro, con dolor al tocarlo.',
  },
  dolor_abdominal: {
    leve: 'Se queja un poco al tocarle la panza.',
    moderado: 'Evita que le toquen el abdomen, se encorva.',
    grave: 'Se queja fuerte o reacciona mal al tocarle el abdomen.',
  },
  mal_aliento: {
    leve: 'Aliento algo desagradable.',
    moderado: 'Mal aliento fuerte y persistente.',
    grave: 'Aliento muy fuerte junto con babeo o dificultad para comer.',
  },

  // Peso y apetito
  perdida_peso: {
    leve: 'Se ve un poco más delgado.',
    moderado: 'Pérdida de peso notoria en pocas semanas.',
    grave: 'Pérdida de peso severa; se le notan las costillas o la columna.',
  },
  aumento_peso: {
    leve: 'Un poco más pesado de lo usual.',
    moderado: 'Aumento de peso notorio.',
    grave: 'Sobrepeso evidente que le dificulta moverse.',
  },
  aumento_apetito: {
    leve: 'Come un poco más de lo normal.',
    moderado: 'Pide comida constantemente.',
    grave: 'Voracidad extrema; come y sigue actuando como si tuviera hambre.',
  },
  aumento_sed: {
    leve: 'Toma agua un poco más seguido.',
    moderado: 'Vacía su bebedero mucho más rápido de lo normal.',
    grave: 'Bebe agua de forma constante y exagerada.',
  },

  // Circulatorios
  fiebre: {
    leve: 'Se siente un poco más caliente al tacto y sigue activo.',
    moderado: 'Caliente al tacto, decaído, busca lugares frescos.',
    grave: 'Muy caliente, tiembla, muy débil.',
  },
  encias_palidas: {
    leve: 'Encías un poco más claras de lo normal.',
    moderado: 'Encías notablemente pálidas o blanquecinas.',
    grave: 'Encías casi blancas — señal de emergencia.',
  },
  encias_rojas: {
    leve: 'Encías un poco más rojas de lo normal.',
    moderado: 'Encías rojas e inflamadas de forma visible.',
    grave: 'Encías muy rojas, inflamadas o que sangran.',
  },
  llenado_capilar_lento: {
    leve: 'Al presionar suavemente la encía, el color tarda un poco más de 2 segundos en volver.',
    moderado: 'El color tarda claramente varios segundos en volver.',
    grave: 'El color no vuelve o tarda mucho — emergencia.',
  },
  intolerancia_ejercicio: {
    leve: 'Se cansa un poco antes de lo normal.',
    moderado: 'Se cansa rápido y quiere parar seguido.',
    grave: 'No puede hacer actividad mínima sin agotarse o jadear fuerte.',
  },

  // Piel y pelaje
  picazon: {
    leve: 'Se rasca de vez en cuando.',
    moderado: 'Se rasca seguido, con inquietud visible.',
    grave: 'Se rasca sin parar y se lastima al hacerlo.',
  },
  perdida_pelo: {
    leve: 'Pierde un poco más de pelo de lo normal.',
    moderado: 'Zonas visibles con menos pelo.',
    grave: 'Zonas grandes sin pelo o calvas.',
  },
  piel_enrojecida: {
    leve: 'Una zona pequeña un poco rojiza.',
    moderado: 'Varias zonas rojas o inflamadas.',
    grave: 'Piel muy roja, inflamada y caliente al tacto.',
  },
  heridas_piel: {
    leve: 'Una herida pequeña y superficial.',
    moderado: 'Herida más grande o varias heridas pequeñas.',
    grave: 'Heridas grandes, abiertas, o con mal aspecto.',
  },
  costras: {
    leve: 'Una o dos costras pequeñas.',
    moderado: 'Varias costras en distintas zonas.',
    grave: 'Costras extensas, con mal olor o supuración.',
  },
  mal_olor_piel: {
    leve: 'Olor un poco distinto al habitual.',
    moderado: 'Olor notorio y desagradable.',
    grave: 'Olor muy fuerte, señal de infección.',
  },

  // Oculares
  ojos_llorosos: {
    leve: 'Un poco de lagrimeo ocasional.',
    moderado: 'Lagrimeo constante.',
    grave: 'Lagrimeo abundante con el ojo muy irritado.',
  },
  secrecion_ocular: {
    leve: 'Un poco de legaña por la mañana.',
    moderado: 'Secreción visible durante el día.',
    grave: 'Secreción abundante, espesa o de color amarillo/verde.',
  },
  ojos_rojos: {
    leve: 'Un ligero enrojecimiento.',
    moderado: 'Ojo visiblemente rojo.',
    grave: 'Ojo muy rojo e hinchado, o lo mantiene cerrado por molestia.',
  },
  pupilas_dilatadas: {
    leve: 'Pupilas un poco más grandes de lo normal.',
    moderado: 'Pupilas dilatadas de forma notoria.',
    grave: 'Pupilas muy dilatadas, sin reacción a la luz.',
  },

  // Urinarios
  orina_frecuente: {
    leve: 'Orina un poco más seguido.',
    moderado: 'Pide salir a orinar muy seguido o tiene accidentes.',
    grave: 'Intenta orinar constantemente, con muy poca cantidad cada vez.',
  },
  dificultad_orinar: {
    leve: 'Tarda un poco más en empezar a orinar.',
    moderado: 'Hace esfuerzo visible para orinar.',
    grave: 'Puja mucho y sale poca o nada de orina — puede ser una emergencia.',
  },
  sangre_en_orina: {
    leve: 'Un tono rosado apenas perceptible.',
    moderado: 'Orina claramente rosada o con sangre.',
    grave: 'Orina con mucha sangre.',
  },
  orina_oscura: {
    leve: 'Orina un poco más oscura de lo normal.',
    moderado: 'Orina notablemente oscura (color té).',
    grave: 'Orina muy oscura, casi marrón.',
  },

  // Conducta
  letargo: {
    leve: 'Un poco menos jugetón o activo de lo normal.',
    moderado: 'Duerme la mayor parte del día, poco interés en jugar o pasear.',
    grave: 'No se levanta, casi no responde a estímulos.',
  },
  agresividad: {
    leve: 'Algo más irritable de lo normal.',
    moderado: 'Gruñe o reacciona mal ante el contacto.',
    grave: 'Intenta morder o atacar sin motivo aparente.',
  },
  ansiedad: {
    leve: 'Un poco más inquieto de lo normal.',
    moderado: 'Jadeo, temblor o inquietud visible sin causa aparente.',
    grave: 'Pánico; intenta escapar o se lastima por la ansiedad.',
  },
  aislamiento: {
    leve: 'Busca estar solo un poco más de lo usual.',
    moderado: 'Se esconde la mayor parte del día.',
    grave: 'Se esconde por completo y evita todo contacto.',
  },

  // Locomotor
  dolor_al_moverse: {
    leve: 'Duda un poco antes de saltar o subir escaleras.',
    moderado: 'Se queja o cojea al moverse.',
    grave: 'Evita moverse por completo.',
  },
  cojera: {
    leve: 'Cojea un poco al empezar a caminar y luego mejora.',
    moderado: 'Cojea de forma visible y constante.',
    grave: 'No apoya la pata en absoluto.',
  },
  rigidez_articular: {
    leve: 'Se le nota algo tieso al levantarse, mejora al caminar.',
    moderado: 'Rigidez visible que dura un rato.',
    grave: 'Rigidez marcada que no mejora; le cuesta moverse todo el día.',
  },

  // Oído
  sacudida_cabeza: {
    leve: 'Sacude la cabeza de vez en cuando.',
    moderado: 'Sacude la cabeza seguido y se rasca la oreja.',
    grave: 'Sacude la cabeza constantemente, con dolor evidente o mal olor en el oído.',
  },
};

const FALLBACK_GUIDE: SeverityGuide = {
  leve: 'Apenas lo notas; tu mascota sigue actuando con normalidad.',
  moderado: 'Es visible y afecta parte de su actividad diaria.',
  grave: 'Es intenso, constante, o le impide comer, moverse o descansar con normalidad.',
};

export function getSeverityGuide(symptomKey: string): SeverityGuide {
  return SEVERITY_GUIDES[symptomKey] ?? FALLBACK_GUIDE;
}
