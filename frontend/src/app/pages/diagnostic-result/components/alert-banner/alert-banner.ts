import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IonicModule } from '@ionic/angular';

export type AlertBannerVariant = 'safe' | 'differential' | 'urgent';

/**
 * Aviso destacado del resultado (guardado, diferencial, urgencia…).
 * El cuerpo del mensaje se proyecta como contenido.
 */
@Component({
  selector: 'app-alert-banner',
  templateUrl: './alert-banner.html',
  styleUrls: ['./alert-banner.scss'],
  standalone: true,
  imports: [IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.role]': "variant() === 'urgent' ? 'alert' : 'note'" },
})
export class AlertBannerComponent {
  readonly variant = input.required<AlertBannerVariant>();
  readonly icon = input.required<string>();
  readonly heading = input.required<string>();
}
