import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IonicModule } from '@ionic/angular';

export type InfoListVariant = 'default' | 'warning' | 'prevention' | 'good' | 'bad';

/**
 * Tarjeta con una lista de recomendaciones (cuidados, alimentación, señales
 * de alerta, prevención). Reemplaza cinco bloques casi idénticos del template.
 */
@Component({
  selector: 'app-info-list-card',
  templateUrl: './info-list-card.html',
  styleUrls: ['./info-list-card.scss'],
  standalone: true,
  imports: [IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'variant()' },
})
export class InfoListCardComponent {
  readonly items = input.required<readonly string[]>();
  readonly itemIcon = input('chevron-forward-outline');
  readonly variant = input<InfoListVariant>('default');
  /** Título opcional dentro de la tarjeta (p. ej. "Alimentos a evitar"). */
  readonly cardTitle = input<string | null>(null);
  readonly cardTitleIcon = input<string | null>(null);
}
