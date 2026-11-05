import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { getSeverityGuide } from '@core/data/severity-guides.data';

export type SeverityValue = 0 | 1 | 2 | 3;

interface SeverityOption {
  value: Exclude<SeverityValue, 0>;
  label: string;
  cls: 'leve' | 'moderado' | 'grave';
  icon: string;
  guideKey: 'leve' | 'moderado' | 'grave';
}

const SEVERITY_OPTIONS: SeverityOption[] = [
  { value: 1, label: 'Leve', cls: 'leve', icon: 'remove-circle-outline', guideKey: 'leve' },
  { value: 2, label: 'Moderado', cls: 'moderado', icon: 'alert-circle-outline', guideKey: 'moderado' },
  { value: 3, label: 'Grave', cls: 'grave', icon: 'warning-outline', guideKey: 'grave' },
];
const SEVERITY_LABELS = ['Sin definir', 'Leve', 'Moderado', 'Grave'] as const;

/**
 * Un síntoma elegido: muestra su gravedad y, al expandirse, las tres
 * opciones con la guía observable de cada nivel (escala consistente con la
 * que se entrenó el modelo).
 */
@Component({
  selector: 'app-selected-symptom-card',
  templateUrl: './selected-symptom-card.html',
  styleUrls: ['./selected-symptom-card.scss'],
  standalone: true,
  imports: [IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectedSymptomCardComponent {
  readonly symptomKey = input.required<string>();
  readonly label = input.required<string>();
  readonly severity = input<SeverityValue>(0);
  readonly expanded = input(false);

  readonly toggleExpand = output<void>();
  readonly severityChange = output<SeverityValue>();
  readonly remove = output<void>();

  protected readonly options = SEVERITY_OPTIONS;
  protected readonly guide = computed(() => getSeverityGuide(this.symptomKey()));
  protected readonly severityLabel = computed(() => SEVERITY_LABELS[this.severity()]);
  protected readonly severityCls = computed(() => SEVERITY_OPTIONS.find((o) => o.value === this.severity())?.cls ?? 'empty');
  protected readonly panelId = computed(() => `severity-${this.symptomKey()}`);
}
