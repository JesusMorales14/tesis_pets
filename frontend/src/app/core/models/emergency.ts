/** Modelos de la guía de primeros auxilios. */

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
