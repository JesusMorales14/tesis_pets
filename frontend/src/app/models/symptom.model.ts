export interface Symptom {
  key: string;
  label: string;
  species: 'both' | 'perro' | 'gato';
}

export interface SymptomCategory {
  groupKey: string;
  label: string;
  icon: string;
  symptoms: Symptom[];
}

export const SEVERITY_LABELS: Record<number, string> = {
  0: 'Sin síntoma',
  1: 'Leve',
  2: 'Moderado',
  3: 'Grave',
};

export const SYMPTOM_GROUPS: SymptomCategory[] = [
  {
    groupKey: 'neurologicos',
    label: 'Neurológicos',
    icon: 'pulse-outline',
    symptoms: [
      { key: 'espasmos', label: 'Espasmos', species: 'both' },
      { key: 'convulsiones', label: 'Convulsiones', species: 'both' },
      { key: 'desorientacion', label: 'Desorientación', species: 'both' },
      { key: 'temblores', label: 'Temblores', species: 'both' },
      { key: 'confusion', label: 'Confusión', species: 'both' },
    ],
  },
  {
    groupKey: 'respiratorios',
    label: 'Respiratorios',
    icon: 'cloud-outline',
    symptoms: [
      { key: 'tos_seca', label: 'Tos seca', species: 'perro' },
      { key: 'tos', label: 'Tos', species: 'both' },
      { key: 'jadeo_excesivo', label: 'Jadeo excesivo', species: 'both' },
      {
        key: 'respiracion_rapida',
        label: 'Respiración rápida',
        species: 'both',
      },
      { key: 'cianosis', label: 'Cianosis', species: 'both' },
      { key: 'asfixia_aparente', label: 'Asfixia aparente', species: 'both' },
    ],
  },
  {
    groupKey: 'digestivos',
    label: 'Digestivos',
    icon: 'nutrition-outline',
    symptoms: [
      { key: 'vomitos', label: 'Vómitos', species: 'both' },
      { key: 'diarrea', label: 'Diarrea', species: 'both' },
      { key: 'nauseas', label: 'Náuseas', species: 'both' },
      { key: 'gases', label: 'Gases', species: 'both' },
      {
        key: 'arcadas_frecuentes',
        label: 'Arcadas frecuentes',
        species: 'both',
      },
      {
        key: 'dificultad_comer',
        label: 'Dificultad para comer',
        species: 'both',
      },
      { key: 'heces_con_sangre', label: 'Heces con sangre', species: 'both' },
      { key: 'heces_negras', label: 'Heces negras', species: 'both' },
      { key: 'estreñimiento', label: 'Estreñimiento', species: 'both' },
    ],
  },
  {
    groupKey: 'circulatorios',
    label: 'Circulatorios',
    icon: 'heart-outline',
    symptoms: [
      { key: 'fiebre', label: 'Fiebre', species: 'both' },
      { key: 'encias_palidas', label: 'Encías pálidas', species: 'both' },
      { key: 'encias_rojas', label: 'Encías rojas', species: 'both' },
      {
        key: 'llenado_capilar_lento',
        label: 'Llenado capilar lento',
        species: 'both',
      },
    ],
  },
  {
    groupKey: 'piel',
    label: 'Piel y pelaje',
    icon: 'body-outline',
    symptoms: [
      { key: 'picazon', label: 'Picazón', species: 'both' },
      { key: 'perdida_pelo', label: 'Pérdida de pelo', species: 'both' },
      { key: 'piel_enrojecida', label: 'Piel enrojecida', species: 'both' },
      { key: 'heridas_piel', label: 'Heridas en piel', species: 'both' },
      { key: 'costras', label: 'Costras', species: 'both' },
      { key: 'mal_olor_piel', label: 'Mal olor en piel', species: 'both' },
    ],
  },
  {
    groupKey: 'oculares',
    label: 'Oculares',
    icon: 'eye-outline',
    symptoms: [
      { key: 'ojos_llorosos', label: 'Ojos llorosos', species: 'both' },
      { key: 'secrecion_ocular', label: 'Secreción ocular', species: 'both' },
      { key: 'ojos_rojos', label: 'Ojos rojos', species: 'both' },
      { key: 'pupilas_dilatadas', label: 'Pupilas dilatadas', species: 'both' },
    ],
  },
  {
    groupKey: 'urinarios',
    label: 'Urinarios',
    icon: 'water-outline',
    symptoms: [
      { key: 'orina_frecuente', label: 'Orina frecuente', species: 'both' },
      {
        key: 'dificultad_orinar',
        label: 'Dificultad para orinar',
        species: 'both',
      },
      { key: 'sangre_en_orina', label: 'Sangre en orina', species: 'both' },
      { key: 'orina_oscura', label: 'Orina oscura', species: 'both' },
    ],
  },
  {
    groupKey: 'conducta',
    label: 'Conducta',
    icon: 'alert-circle-outline',
    symptoms: [
      { key: 'letargo', label: 'Letargo', species: 'both' },
      { key: 'agresividad', label: 'Agresividad', species: 'both' },
      { key: 'ansiedad', label: 'Ansiedad', species: 'both' },
      { key: 'aislamiento', label: 'Aislamiento', species: 'both' },
    ],
  },
  {
    groupKey: 'locomotor',
    label: 'Locomotor',
    icon: 'footsteps-outline',
    symptoms: [
      { key: 'dolor_al_moverse', label: 'Dolor al moverse', species: 'both' },
    ],
  },
];
