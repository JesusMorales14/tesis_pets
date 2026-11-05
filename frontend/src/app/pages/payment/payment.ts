import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MetodoPago } from '@core/models/appointment';
import { PaymentConfig } from '@core/models/payment-config';
import { AppointmentService } from '@core/services/appointment';
import { AuthService } from '@core/services/auth';
import { DiagnosisFlowState, DiagnosisFlowService } from '@core/services/diagnosis-flow';
import { PaymentConfigService } from '@core/services/payment-config';
import { getApiErrorMessage } from '@core/utils/http-error';
import { PageToolbarComponent } from '@shared/components/page-toolbar/page-toolbar';
import { AppDatePipe } from '@shared/pipes';
import { BookingSummaryComponent } from './components/booking-summary/booking-summary';
import { PaymentInstructionsComponent } from './components/payment-instructions/payment-instructions';
import { PaymentMethodPickerComponent } from './components/payment-method-picker/payment-method-picker';
import { PaymentSuccessComponent } from './components/payment-success/payment-success';
import { ReceiptUploadComponent } from './components/receipt-upload/receipt-upload';

/** Estado del flujo con los datos que el pago necesita garantizados. */
type Booking = DiagnosisFlowState & Required<Pick<DiagnosisFlowState, 'result' | 'fecha' | 'hora'>>;

/** Pasos del pago: elegir método → pagar y subir comprobante → confirmación. */
type PaymentStep = 'method' | 'upload' | 'success';

const STEP_TITLES: Record<PaymentStep, string> = {
  method: 'Método de Pago',
  upload: 'Enviar comprobante',
  success: 'Confirmación',
};

/** Reserva con pago (contenedor). La cita se crea recién al enviar el comprobante. */
@Component({
  selector: 'app-payment',
  templateUrl: './payment.html',
  styleUrls: ['./payment.scss'],
  standalone: true,
  imports: [
    IonicModule,
    RouterLink,
    AppDatePipe,
    PageToolbarComponent,
    BookingSummaryComponent,
    PaymentMethodPickerComponent,
    PaymentInstructionsComponent,
    ReceiptUploadComponent,
    PaymentSuccessComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly appointmentApi = inject(AppointmentService);
  private readonly paymentConfigApi = inject(PaymentConfigService);
  private readonly auth = inject(AuthService);
  private readonly flow = inject(DiagnosisFlowService);

  protected readonly booking = signal<Booking | null>(null);
  protected readonly config = signal<PaymentConfig | null>(null);
  protected readonly step = signal<PaymentStep>('method');
  protected readonly metodo = signal<MetodoPago | null>(null);
  protected readonly file = signal<File | null>(null);
  protected readonly isUploading = signal(false);
  protected readonly errorMsg = signal('');
  protected readonly slotTaken = signal(false);

  protected readonly title = computed(() => STEP_TITLES[this.step()]);
  // En la confirmación ya no hay "volver": la reserva está hecha.
  protected readonly backLink = computed(() => (this.step() === 'success' ? null : '/schedule'));

  ngOnInit(): void {
    this.paymentConfigApi.getConfig().subscribe({ next: (cfg) => this.config.set(cfg) });
  }

  // Ionic reutiliza la página desde su caché: cada entrada empieza un pago
  // nuevo con los datos actuales del flujo (y no la pantalla de éxito anterior).
  ionViewWillEnter(): void {
    const state = this.flow.state;
    if (!state?.result || !state.fecha || !state.hora) {
      void this.router.navigate(['/tabs/tab2']);
      return;
    }
    this.booking.set({ ...state, result: state.result, fecha: state.fecha, hora: state.hora });
    this.step.set('method');
    this.metodo.set(null);
    this.file.set(null);
    this.errorMsg.set('');
    this.slotTaken.set(false);
  }

  /** En el paso de subida, "volver" regresa al método sin salir de la página. */
  protected backToMethod(): void {
    this.step.set('method');
    this.errorMsg.set('');
  }

  // La cita NO se aparta en el servidor hasta que el usuario adjunte y
  // envíe el comprobante, para no bloquear horarios si abandona el proceso.
  protected continueToUpload(): void {
    if (!this.metodo()) return;
    this.step.set('upload');
    this.errorMsg.set('');
  }

  protected onFileChange(file: File | null): void {
    this.file.set(file);
    this.errorMsg.set('');
  }

  /** Reserva la cita y envía el comprobante en una sola petición. */
  protected submit(): void {
    const booking = this.booking();
    const file = this.file();
    const metodo = this.metodo();
    if (!booking || !metodo) return;
    if (!file) {
      this.errorMsg.set('Adjunta la imagen de tu comprobante de pago.');
      return;
    }
    this.isUploading.set(true);
    this.errorMsg.set('');

    const { result } = booking;
    const sintomas = Object.fromEntries((booking.selectedSymptoms ?? []).map((s) => [s.key, s.severity]));
    // La mascota solo se asocia si el flujo lo empezó este mismo usuario.
    const petId = this.flow.petIdFor(this.auth.currentUser?.id);

    this.appointmentApi
      .createWithComprobante(
        {
          fecha: booking.fecha,
          hora: booking.hora,
          diagnostico: result.diagnostico,
          especie: booking.especie,
          gravedad: result.gravedad,
          metodo_pago: metodo,
          sintomas_json: JSON.stringify(sintomas),
          probabilidad: result.probabilidad,
          pet_id: petId ?? undefined,
        },
        file,
      )
      .subscribe({
        next: () => {
          this.isUploading.set(false);
          this.step.set('success');
          // El flujo terminó: un nuevo diagnóstico empieza de cero.
          this.flow.clear();
        },
        error: (err: HttpErrorResponse) => this.handleSubmitError(err),
      });
  }

  private handleSubmitError(err: HttpErrorResponse): void {
    this.isUploading.set(false);
    if (err.status === 401) {
      // El flujo sigue guardado: tras iniciar sesión se vuelve aquí.
      this.auth.logout();
      void this.router.navigate(['/login'], { state: { returnTo: '/payment', expiredSession: true } });
      return;
    }
    if (err.status === 409) {
      this.slotTaken.set(true);
      this.errorMsg.set(`${getApiErrorMessage(err, 'El horario ya no está disponible')}. Elige otro horario.`);
      return;
    }
    this.errorMsg.set(getApiErrorMessage(err, 'No se pudo completar la reserva. Intenta de nuevo.'));
  }
}
