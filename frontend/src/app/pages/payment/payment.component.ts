import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PredictionResult } from '../../services/prediction-service';
import { AppointmentService } from '../../services/appointment.service';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';

const MONTHS = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
const DAYS   = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class PaymentComponent implements OnInit {
  result: PredictionResult | null = null;
  especie = 'perro';
  fecha = '';
  hora = '';

  // Pasos: 1=elegir método, 2=formulario, 3=éxito
  step = 1;
  metodo: 'yape' | 'tarjeta' | null = null;

  // Formulario Yape
  yapePhone = '';
  yapeCode = '';

  // Formulario tarjeta
  cardNumber = '';
  cardName = '';
  cardExpiry = '';
  cardCvv = '';

  isProcessing = false;
  errorMsg = '';
  fechaLabel = '';

  constructor(
    private router: Router,
    private appointmentService: AppointmentService,
    private auth: AuthService,
    public themeService: ThemeService,
  ) {}

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
  }

  selectMetodo(m: 'yape' | 'tarjeta') {
    this.metodo = m;
  }

  continuar() {
    if (!this.metodo) return;
    this.step = 2;
    this.errorMsg = '';
  }

  // ── YAPE ───────────────────────────────────────────────────────────
  get yapeValid(): boolean {
    return /^\d{9}$/.test(this.yapePhone.replace(/\s/g, '')) &&
           /^\d{6}$/.test(this.yapeCode.replace(/\s/g, ''));
  }

  // ── TARJETA ────────────────────────────────────────────────────────
  onCardNumberInput(event: Event) {
    const raw = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 16);
    this.cardNumber = raw.replace(/(.{4})/g, '$1 ').trim();
  }

  onExpiryInput(event: Event) {
    let raw = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) raw = raw.slice(0, 2) + '/' + raw.slice(2);
    this.cardExpiry = raw;
  }

  get cardValid(): boolean {
    const num = this.cardNumber.replace(/\s/g, '');
    const exp = this.cardExpiry;
    const cvv = this.cardCvv.replace(/\s/g, '');
    if (num.length !== 16) return false;
    if (!this.cardName.trim()) return false;
    if (!/^\d{2}\/\d{2}$/.test(exp)) return false;
    if (cvv.length < 3) return false;
    // Validar que no sea tarjeta expirada
    const [mm, yy] = exp.split('/').map(Number);
    const now = new Date();
    const expDate = new Date(2000 + yy, mm - 1);
    if (expDate < now) return false;
    return true;
  }

  get cardBrand(): string {
    const n = this.cardNumber.replace(/\s/g, '');
    if (n.startsWith('4')) return 'visa';
    if (n.startsWith('5') || n.startsWith('2')) return 'mastercard';
    if (n.startsWith('3')) return 'amex';
    return 'generic';
  }

  // ── CONFIRMAR PAGO ─────────────────────────────────────────────────
  confirmarPago() {
    if (this.metodo === 'yape' && !this.yapeValid) {
      this.errorMsg = 'Verifica el número de celular (9 dígitos) y el código Yape (6 dígitos)';
      return;
    }
    if (this.metodo === 'tarjeta' && !this.cardValid) {
      this.errorMsg = 'Verifica los datos de tu tarjeta';
      return;
    }

    this.isProcessing = true;
    this.errorMsg = '';

    this.appointmentService.createAppointment({
      fecha: this.fecha,
      hora: this.hora,
      diagnostico: this.result!.diagnostico,
      especie: this.especie,
      gravedad: this.result!.gravedad,
      metodo_pago: this.metodo!,
    }).subscribe({
      next: () => {
        this.isProcessing = false;
        this.step = 3;
      },
      error: (err) => {
        this.errorMsg = err?.error?.detail || 'Error al confirmar la cita. Intenta de nuevo.';
        this.isProcessing = false;
      },
    });
  }

  goHome() { this.router.navigate(['/tabs/tab1']); }

  goBack() {
    if (this.step === 2) { this.step = 1; this.errorMsg = ''; return; }
    this.router.navigate(['/schedule'], {
      state: {
        result: this.result,
        especie: this.especie,
        selectedDate: this.fecha,
        selectedHora: this.hora,
      },
    });
  }

  get userName(): string { return this.auth.currentUser?.nombre ?? ''; }
}
