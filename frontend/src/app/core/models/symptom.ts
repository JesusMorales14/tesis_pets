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
