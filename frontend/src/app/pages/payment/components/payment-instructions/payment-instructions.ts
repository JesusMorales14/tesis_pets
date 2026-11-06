import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { MetodoPago } from '@core/models/appointment';
import { PaymentConfig } from '@core/models/payment-config';
import { environment } from '../../../../../environments/environment';

type CopyField = 'yape' | 'cuenta' | 'cci';
const COPIED_FEEDBACK_MS = 1500;

/** Datos para pagar según el método elegido (QR/número o cuenta bancaria). */
@Component({
  selector: 'app-payment-instructions',
  templateUrl: './payment-instructions.html',
  styleUrls: ['./payment-instructions.scss'],
  standalone: true,
  imports: [IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentInstructionsComponent {
  readonly metodo = input.required<MetodoPago>();
  readonly config = input<PaymentConfig | null>(null);

  protected readonly apiUrl = environment.apiUrl;
  protected readonly copied = signal<CopyField | null>(null);
  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected async copy(value: string | null | undefined, field: CopyField): Promise<void> {
    if (!value) return;
    try {
      await navigator.clipboard?.writeText(value);
    } catch {
      return; // sin permiso de portapapeles: el dato sigue visible para copiarlo a mano
    }
    clearTimeout(this.timer);
    this.copied.set(field);
    this.timer = setTimeout(() => this.copied.set(null), COPIED_FEEDBACK_MS);
  }
}
