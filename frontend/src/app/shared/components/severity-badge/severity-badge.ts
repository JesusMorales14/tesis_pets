import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TitleCasePipe } from '@angular/common';

/** Gravedad clínica estimada por la IA: Leve / Moderada / Grave. */
@Component({
  selector: 'app-severity-badge',
  standalone: true,
  imports: [TitleCasePipe],
  template: `{{ gravedad() | titlecase }}`,
  styleUrls: ['./severity-badge.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'gravedad()' },
})
export class SeverityBadgeComponent {
  readonly gravedad = input.required<string>();
}
