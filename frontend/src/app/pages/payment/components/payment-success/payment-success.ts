import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MetodoPago } from '@core/models/appointment';
import { paymentMethodLabel } from '@core/utils/appointment-status';
import { AppDatePipe, DiagnosisLabelPipe } from '@shared/pipes';

/** Confirmación final: la reserva quedó hecha y el pago está en verificación. */
@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.html',
  styleUrls: ['./payment-success.scss'],
  standalone: true,
  imports: [IonicModule, RouterLink, TitleCasePipe, AppDatePipe, DiagnosisLabelPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentSuccessComponent {
  readonly fecha = input.required<string>();
  readonly hora = input.required<string>();
  readonly diagnostico = input.required<string>();
  readonly especie = input<string>('');
  readonly metodo = input.required<MetodoPago>();
  readonly petNombre = input<string | null>(null);

  protected readonly methodLabel = paymentMethodLabel;
}
