/** Modelos de la guía de salud (enfermedades y cuidados generales). */

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
  | 'toxicologico'
  | 'endocrino'
  | 'ocular'
  | 'dental';

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
