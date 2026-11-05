import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { SelectedSymptom } from '@core/services/diagnosis-flow';

interface SeverityView {
  label: string;
  cls: 'leve' | 'moderado' | 'grave';
  icon: string;
}

const SEVERITY: Record<number, SeverityView> = {
  1: { label: 'Leve', cls: 'leve', icon: 'remove-circle-outline' },
  2: { label: 'Moderado', cls: 'moderado', icon: 'alert-circle-outline' },
  3: { label: 'Grave', cls: 'grave', icon: 'warning-outline' },
};
const UNKNOWN: SeverityView = { label: '', cls: 'leve', icon: 'ellipse-outline' };

/** Síntomas que reportó el dueño y por qué pesaron en la predicción. */
@Component({
  selector: 'app-reported-symptoms',
  templateUrl: './reported-symptoms.html',
  styleUrls: ['./reported-symptoms.scss'],
  standalone: true,
  imports: [IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportedSymptomsComponent {
  readonly symptoms = input.required<SelectedSymptom[]>();

  protected severity(value: number): SeverityView {
    return SEVERITY[value] ?? UNKNOWN;
  }
}
