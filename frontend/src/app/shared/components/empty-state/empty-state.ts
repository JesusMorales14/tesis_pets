import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/**
 * Mensaje para listas vacías.
 * - `rich`: icono grande + título + descripción (invita a la acción).
 * - `inline`: icono + texto en una línea.
 */
@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.html',
  styleUrls: ['./empty-state.scss'],
  standalone: true,
  imports: [IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'variant()', role: 'status' },
})
export class EmptyStateComponent {
  readonly icon = input<string | null>(null);
  readonly heading = input<string | null>(null);
  readonly message = input.required<string>();
  readonly variant = input<'rich' | 'inline' | 'small'>('inline');
}
