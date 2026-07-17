import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PredictionResult } from '@core/services/prediction';
import { AppointmentService, Appointment } from '@core/services/appointment';
import { PaymentConfigService, PaymentConfig } from '@core/services/payment-config';
import { ThemeService } from '@core/services/theme';
import { AuthService } from '@core/services/auth';
import { environment } from '../../../environments/environment';

const MONTHS = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
const DAYS   = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

@Component({
  selector: 'app-payment',
  templateUrl: './payment.html',
  styleUrls: ['./payment.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class PaymentComponent implements OnInit {
  private router = inject(Router);
  private appointmentService = inject(AppointmentService);
  private paymentConfigService = inject(PaymentConfigService);
  private auth = inject(AuthService);
  themeService = inject(ThemeService);

  result: PredictionResult | null = null;
  especie = 'perro';
  fecha = '';
  hora = '';

  // Pasos: 1=elegir método, 2=reservando, 3=pagar y subir comprobante, 4=éxito
  step = 1;
  metodo: 'yape' | 'transferencia' | null = null;

  paymentConfig: PaymentConfig | null = null;
  appointment: Appointment | null = null;

  selectedFile: File | null = null;
  filePreviewUrl: string | null = null;

  isProcessing = false;
  isUploading = false;
  errorMsg = '';
  fechaLabel = '';
  copiedField: string | null = null;

  readonly apiUrl = environment.apiUrl;

  ngOnInit() {
    const state = history.state;
    this.result  = state?.result  ?? null;
    this.especie = state?.especie ?? 'perro';
    this.fecha   = state?.fecha   ?? '';
    this.hora    = state?.hora    ?? '';

    if (!this.result || !this.fecha || !this.hora) {
      this.router.navigate(['/tabs/tab2']);
      return;
    }

    const d = new Date(this.fecha + 'T00:00:00');
    this.fechaLabel = `${DAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

    this.paymentConfigService.getConfig().subscribe({
      next: (cfg) => (this.paymentConfig = cfg),
    });
  }

  selectMetodo(m: 'yape' | 'transferencia') {
    this.metodo = m;
  }

  // Reserva la cita de inmediato al elegir método de pago — el horario
  // queda apartado antes de que el usuario termine de pagar y subir el
  // comprobante, para no arriesgar perderlo mientras hace el trámite.
  continuar() {
    if (!this.metodo) return;
    this.isProcessing = true;
    this.errorMsg = '';

    this.appointmentService.createAppointment({
      fecha: this.fecha,
      hora: this.hora,
      diagnostico: this.result!.diagnostico,
      especie: this.especie,
      gravedad: this.result!.gravedad,
      metodo_pago: this.metodo,
    }).subscribe({
      next: (appt) => {
        this.isProcessing = false;
        this.appointment = appt;
        this.step = 3;
      },
      error: (err) => {
        this.errorMsg = err?.error?.detail || 'Error al reservar la cita. Intenta de nuevo.';
        this.isProcessing = false;
      },
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFile = file;
    this.errorMsg = '';
    if (this.filePreviewUrl) URL.revokeObjectURL(this.filePreviewUrl);
    this.filePreviewUrl = file ? URL.createObjectURL(file) : null;
  }

  copyToClipboard(value: string | null, field: string) {
    if (!value) return;
    navigator.clipboard?.writeText(value);
    this.copiedField = field;
    setTimeout(() => (this.copiedField = null), 1500);
  }

  subirComprobante() {
    if (!this.selectedFile || !this.appointment) {
      this.errorMsg = 'Adjunta la imagen de tu comprobante de pago.';
      return;
    }
    this.isUploading = true;
    this.errorMsg = '';
    this.appointmentService.uploadComprobante(this.appointment.id, this.selectedFile).subscribe({
      next: () => {
        this.isUploading = false;
        this.step = 4;
      },
      error: (err) => {
        this.errorMsg = err?.error?.detail || 'No se pudo subir el comprobante. Intenta de nuevo.';
        this.isUploading = false;
      },
    });
  }

  goHome() { this.router.navigate(['/tabs/tab1']); }

  goToProfile() { this.router.navigate(['/profile']); }

  goBack() {
    if (this.step === 1) {
      this.router.navigate(['/schedule'], {
        state: {
          result: this.result,
          especie: this.especie,
          selectedDate: this.fecha,
          selectedHora: this.hora,
        },
      });
    }
  }

  get userName(): string { return this.auth.currentUser?.nombre ?? ''; }
}
