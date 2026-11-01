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
import { DiagnosisFlowService, SelectedSymptom } from '@core/services/diagnosis-flow';
import { environment } from '../../../environments/environment';

const MONTHS = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
const DAYS   = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

const ALLOWED_TYPES: Record<string, string> = { 'image/png': 'PNG', 'image/jpeg': 'JPG', 'image/webp': 'WEBP' };
const MAX_FILE_BYTES = 5 * 1024 * 1024;

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
  private flow = inject(DiagnosisFlowService);
  themeService = inject(ThemeService);

  result: PredictionResult | null = null;
  especie = 'perro';
  fecha = '';
  hora = '';
  petNombre: string | null = null;
  selectedSymptoms: SelectedSymptom[] = [];

  // Pasos: 1=elegir método, 3=pagar y subir comprobante, 4=éxito
  step = 1;
  metodo: 'yape' | 'transferencia' | null = null;

  paymentConfig: PaymentConfig | null = null;
  appointment: Appointment | null = null;

  selectedFile: File | null = null;

  isProcessing = false;
  isUploading = false;
  errorMsg = '';
  slotTaken = false;
  fechaLabel = '';
  copiedField: string | null = null;

  readonly apiUrl = environment.apiUrl;

  ngOnInit() {
    this.paymentConfigService.getConfig().subscribe({
      next: (cfg) => (this.paymentConfig = cfg),
    });
  }

  // Ionic reutiliza la página desde su caché: cada entrada empieza un pago
  // nuevo con los datos actuales del flujo (y no la pantalla de éxito de
  // una reserva anterior).
  ionViewWillEnter() {
    const state = this.flow.state;
    this.result = state?.result ?? null;
    this.especie = state?.especie ?? 'perro';
    this.fecha = state?.fecha ?? '';
    this.hora = state?.hora ?? '';
    this.selectedSymptoms = state?.selectedSymptoms ?? [];
    this.petNombre = this.result?.mascota ?? state?.petNombre ?? null;

    if (!this.result || !this.fecha || !this.hora) {
      this.router.navigate(['/tabs/tab2']);
      return;
    }

    this.step = 1;
    this.metodo = null;
    this.appointment = null;
    this.errorMsg = '';
    this.slotTaken = false;
    this.selectedFile = null;

    const d = new Date(this.fecha + 'T00:00:00');
    this.fechaLabel = `${DAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }

  /** Formatea el diagnóstico reemplazando guiones bajos por espacios */
  formatDiagnostico(diagnostico: string): string {
    return (diagnostico ?? '').replace(/_/g, ' ');
  }

  selectMetodo(m: 'yape' | 'transferencia') {
    this.metodo = m;
  }

  // Paso 1: Selecciona método y avanza a la pantalla de pago y comprobante.
  // La cita NO se aparta en el servidor hasta que el usuario adjunte y envíe
  // el comprobante, evitando bloquear horarios si abandona el proceso.
  continuar() {
    if (!this.metodo) return;
    this.step = 3;
    this.errorMsg = '';
  }

  // Mismas reglas que valida el backend (config.py): se avisa al elegir el
  // archivo en vez de al enviar la reserva.
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = ''; // permite volver a elegir el mismo archivo tras quitarlo
    if (!file) return;

    if (!ALLOWED_TYPES[file.type]) {
      this.errorMsg = 'El comprobante debe ser una imagen PNG, JPG o WEBP.';
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      this.errorMsg = 'La imagen del comprobante no debe superar los 5 MB.';
      return;
    }
    this.errorMsg = '';
    this.selectedFile = file;
  }

  removeFile() {
    this.selectedFile = null;
    this.errorMsg = '';
  }

  /** "Imagen PNG · 245 KB" */
  get fileDetails(): string {
    if (!this.selectedFile) return '';
    const kb = this.selectedFile.size / 1024;
    const size = kb < 1024 ? `${Math.max(1, Math.round(kb))} KB` : `${(kb / 1024).toFixed(1)} MB`;
    return `Imagen ${ALLOWED_TYPES[this.selectedFile.type] ?? ''} · ${size}`;
  }

  copyToClipboard(value: string | null, field: string) {
    if (!value) return;
    navigator.clipboard?.writeText(value);
    this.copiedField = field;
    setTimeout(() => (this.copiedField = null), 1500);
  }

  // Paso 3: Reserva la cita y envía el comprobante en una sola petición.
  subirComprobante() {
    if (!this.selectedFile) {
      this.errorMsg = 'Adjunta la imagen de tu comprobante de pago.';
      return;
    }
    this.isUploading = true;
    this.errorMsg = '';

    const sintomasJson = JSON.stringify(
      Object.fromEntries(this.selectedSymptoms.map((s) => [s.key, s.severity])),
    );
    // La mascota solo se asocia si el flujo lo empezó este mismo usuario.
    const petId = this.flow.petIdFor(this.auth.currentUser?.id);

    this.appointmentService.createWithComprobante({
      fecha: this.fecha,
      hora: this.hora,
      diagnostico: this.result!.diagnostico,
      especie: this.especie,
      gravedad: this.result!.gravedad,
      metodo_pago: this.metodo!,
      sintomas_json: sintomasJson,
      probabilidad: this.result!.probabilidad,
      pet_id: petId ?? undefined,
    }, this.selectedFile).subscribe({
      next: (appt) => {
        this.isUploading = false;
        this.appointment = appt;
        this.step = 4;
        // El flujo terminó: un nuevo diagnóstico empieza de cero.
        this.flow.clear();
      },
      error: (err) => {
        this.isUploading = false;
        if (err?.status === 401) {
          // El flujo sigue guardado: tras iniciar sesión se vuelve aquí.
          this.auth.logout();
          this.router.navigate(['/login'], {
            state: { returnTo: '/payment', expiredSession: true },
          });
          return;
        }
        if (err?.status === 409) {
          this.slotTaken = true;
          this.errorMsg = `${err.error?.detail ?? 'El horario ya no está disponible'}. Elige otro horario.`;
          return;
        }
        this.errorMsg = err?.error?.detail || 'No se pudo completar la reserva. Intenta de nuevo.';
      },
    });
  }

  goHome() { this.router.navigate(['/tabs/tab1']); }

  goToProfile() { this.router.navigate(['/profile']); }

  goToDiagnostico() { this.router.navigate(['/tabs/tab2']); }

  goToSchedule() { this.router.navigate(['/schedule']); }

  goBack() {
    if (this.step === 3) {
      this.step = 1;
      this.errorMsg = '';
      return;
    }
    if (this.step === 1) {
      this.goToSchedule();
    }
  }

  get userName(): string { return this.auth.currentUser?.nombre ?? ''; }
}
