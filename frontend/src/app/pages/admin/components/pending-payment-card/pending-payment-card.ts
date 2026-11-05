import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Appointment } from '@core/models/appointment';
import { paymentMethodLabel } from '@core/utils/appointment-status';
import { SeverityBadgeComponent } from '@shared/components/severity-badge/severity-badge';
import { AppDatePipe, DiagnosisLabelPipe } from '@shared/pipes';
import { environment } from '../../../../../environments/environment';

/** Tarjeta de un comprobante de pago pendiente de revisión. */
@Component({
  selector: 'app-pending-payment-card',
  templateUrl: './pending-payment-card.html',
  styleUrls: ['./pending-payment-card.scss'],
  standalone: true,
  imports: [IonicModule, TitleCasePipe, AppDatePipe, DiagnosisLabelPipe, SeverityBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // La clase la usa el carrusel del padre para medir y alinear las tarjetas.
  host: { class: 'payment-review-card', role: 'listitem' },
})
export class PendingPaymentCardComponent {
  readonly payment = input.required<Appointment>();
  readonly review = output<Appointment>();

  protected readonly apiUrl = environment.apiUrl;
  protected readonly methodLabel = paymentMethodLabel;
}
