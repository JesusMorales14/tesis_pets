import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { VaccinationStatus, vaccinationStatusLabel } from '@core/utils/vaccination-status';

/** Semáforo de vacunación: Urgente / Próxima / Al día / Sin recordatorio. */
@Component({
  selector: 'app-vaccination-badge',
  standalone: true,
  template: `{{ label() }}`,
  styleUrls: ['./vaccination-badge.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'status()' },
})
export class VaccinationBadgeComponent {
  readonly status = input.required<VaccinationStatus>();
  protected readonly label = computed(() => vaccinationStatusLabel(this.status()));
}
