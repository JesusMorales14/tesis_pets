import { ChangeDetectionStrategy, Component, OnInit, inject, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PaymentConfig, PaymentConfigBody } from '@core/models/payment-config';
import { PaymentConfigService } from '@core/services/payment-config';
import { AdminNotice } from '../../admin-notice';
import { environment } from '../../../../../environments/environment';

/** Datos de cobro que ven los clientes al pagar: Yape (número + QR) y transferencia. */
@Component({
  selector: 'app-payment-config',
  templateUrl: './payment-config.html',
  styleUrls: ['./payment-config.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentConfigComponent implements OnInit {
  private readonly api = inject(PaymentConfigService);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly notify = output<AdminNotice>();

  protected readonly apiUrl = environment.apiUrl;
  protected readonly expanded = signal(false);
  protected readonly config = signal<PaymentConfig | null>(null);
  protected readonly isSaving = signal(false);
  protected readonly isUploadingQr = signal(false);

  protected readonly form = this.fb.group({
    yape_phone: [''],
    banco: [''],
    tipo_cuenta: [''],
    numero_cuenta: [''],
    cci: [''],
    titular: [''],
  });

  ngOnInit(): void {
    this.api.getConfig().subscribe({ next: (cfg) => this.applyConfig(cfg) });
  }

  protected toggle(): void {
    this.expanded.update((v) => !v);
  }

  protected save(): void {
    this.isSaving.set(true);
    const body: PaymentConfigBody = this.form.getRawValue();
    this.api.updateConfig(body).subscribe({
      next: (cfg) => {
        this.config.set(cfg);
        this.isSaving.set(false);
        this.notify.emit({ message: 'Datos de pago actualizados' });
      },
      error: () => {
        this.isSaving.set(false);
        this.notify.emit({ message: 'Error al guardar los datos de pago', isError: true });
      },
    });
  }

  protected onQrSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // permite volver a elegir el mismo archivo
    if (!file) return;
    this.isUploadingQr.set(true);
    this.api.uploadQr(file).subscribe({
      next: (cfg) => {
        this.config.set(cfg);
        this.isUploadingQr.set(false);
        this.notify.emit({ message: 'QR de Yape actualizado' });
      },
      error: () => {
        this.isUploadingQr.set(false);
        this.notify.emit({ message: 'Error al subir el QR', isError: true });
      },
    });
  }

  private applyConfig(cfg: PaymentConfig): void {
    this.config.set(cfg);
    this.form.setValue({
      yape_phone: cfg.yape_phone ?? '',
      banco: cfg.banco ?? '',
      tipo_cuenta: cfg.tipo_cuenta ?? '',
      numero_cuenta: cfg.numero_cuenta ?? '',
      cci: cfg.cci ?? '',
      titular: cfg.titular ?? '',
    });
  }
}
