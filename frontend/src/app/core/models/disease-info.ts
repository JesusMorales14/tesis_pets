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
