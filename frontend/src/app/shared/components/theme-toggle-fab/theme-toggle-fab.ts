import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { BreakpointService } from '@core/services/breakpoint';
import { ThemeService } from '@core/services/theme';

/**
 * Botón flotante sol/luna para cambiar el tema en móvil y tablet.
 * En desktop no se muestra: el cambio de tema vive en el sidebar.
 */
@Component({
  selector: 'app-theme-toggle-fab',
  templateUrl: './theme-toggle-fab.html',
  styleUrls: ['./theme-toggle-fab.scss'],
  standalone: true,
  imports: [IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.above-tabs]': 'aboveTabs()', class: 'no-print' },
})
export class ThemeToggleFabComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly breakpoints = inject(BreakpointService);

  /** Se ubica sobre la barra de pestañas inferior en lugar de en la esquina. */
  readonly aboveTabs = input(false);
}
