import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { MetodoPago } from '@core/models/appointment';

/** Elección del medio de pago (grupo de opciones accesible como radiogroup). */
@Component({
  selector: 'app-payment-method-picker',
  templateUrl: './payment-method-picker.html',
  styleUrls: ['./payment-method-picker.scss'],
  standalone: true,
  imports: [IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentMethodPickerComponent {
  readonly selected = input<MetodoPago | null>(null);
  readonly methodSelected = output<MetodoPago>();
}
