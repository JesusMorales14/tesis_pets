import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService, AdminSlot, Appointment } from '@core/services/appointment';
import { PaymentConfigService, PaymentConfig } from '@core/services/payment-config';
import { ThemeService } from '@core/services/theme';
import { PaginationComponent } from '@shared/components/pagination/pagination';
import { ComprobanteModalComponent } from '@shared/components/comprobante-modal/comprobante-modal';
import { PetClinicalModalComponent } from './pet-clinical-modal/pet-clinical-modal';
import { environment } from '../../../environments/environment';
import { toLocalIsoDate } from '@core/utils/date';

const MONTHS = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
const DAYS   = ['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB'];

// Prioridad clínica para ordenar la agenda: lo más grave primero.
const GRAVEDAD_RANK: Record<string, number> = { grave: 0, moderada: 1, leve: 2 };

export type EspecieFilter = 'todas' | 'perro' | 'gato';
export type ApptOrder = 'gravedad' | 'hora';

export interface DateOption {
  date: Date;
  isoDate: string;
  dayNum: string;
  dayAbbr: string;
  monthAbbr: string;
  isToday: boolean;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, PaginationComponent, ComprobanteModalComponent, PetClinicalModalComponent],
})
export class AdminComponent implements OnInit {
  private router = inject(Router);
  private appointmentService = inject(AppointmentService);
  private paymentConfigService = inject(PaymentConfigService);
  themeService = inject(ThemeService);
  readonly apiUrl = environment.apiUrl;

  // Pagos pendientes de revisión (independiente del día seleccionado — un
  // comprobante puede llegar para una cita de cualquier fecha).
  pendingPayments: Appointment[] = [];
  isLoadingPending = false;
  decidingId: number | null = null;

  // Modal de revisión de comprobante
  selectedPendingPayment: Appointment | null = null;
  isPaymentModalOpen = false;

  // Carrusel de pagos pendientes: posición actual (para el "1 de N").
  carouselIndex = 0;

  // Revisión en cola: al aprobar o rechazar, el modal pasa solo al
  // siguiente comprobante, para no tener que deslizar ni reabrir uno por uno.
  reviewQueueActive = false;
  reviewQueueTotal = 0;
  reviewQueueDone = 0;

  // Configuración de pagos (Yape / transferencia)
  showPaymentConfig = false;
  paymentConfig: PaymentConfig | null = null;
  paymentConfigForm: {
    yape_phone: string; banco: string; tipo_cuenta: string;
    numero_cuenta: string; cci: string; titular: string;
  } = { yape_phone: '', banco: '', tipo_cuenta: '', numero_cuenta: '', cci: '', titular: '' };
  isSavingConfig = false;
  isUploadingQr = false;

  dates: DateOption[] = [];
  selectedDate: DateOption | null = null;
  currentMonthYear = '';

  slots: AdminSlot[] = [];
  appointments: Appointment[] = [];
  isLoadingSlots = false;
  isLoadingAppts = false;
  toastMsg = '';
  toastError = false;

  readonly apptsPageSize = 4;
  apptsPage = 1;

  // Organización de la agenda del día (HU17): por especie y por gravedad,
  // para preparar primero los casos más graves.
  especieFilter: EspecieFilter = 'todas';
  apptOrder: ApptOrder = 'gravedad';

  // Ficha clínica de la mascota de una cita
  clinicalPetId: number | null = null;
  isClinicalModalOpen = false;

  get visibleAppointments(): Appointment[] {
    const list = this.appointments.filter(
      (a) => this.especieFilter === 'todas' || a.especie === this.especieFilter,
    );
    return [...list].sort((x, y) => {
      // Las canceladas siempre al final: ya no requieren atención.
      const cancel = Number(x.estado === 'cancelada') - Number(y.estado === 'cancelada');
      if (cancel) return cancel;
      if (this.apptOrder === 'gravedad') {
        const grav = (GRAVEDAD_RANK[x.gravedad] ?? 3) - (GRAVEDAD_RANK[y.gravedad] ?? 3);
        if (grav) return grav;
      }
      return x.hora.localeCompare(y.hora);
    });
  }

  get pagedAppointments(): Appointment[] {
    const start = (this.apptsPage - 1) * this.apptsPageSize;
    return this.visibleAppointments.slice(start, start + this.apptsPageSize);
  }

  countByEspecie(especie: EspecieFilter): number {
    return especie === 'todas'
      ? this.appointments.length
      : this.appointments.filter((a) => a.especie === especie).length;
  }

  setEspecieFilter(especie: EspecieFilter) {
    this.especieFilter = especie;
    this.apptsPage = 1;
  }

  setApptOrder(order: ApptOrder) {
    this.apptOrder = order;
    this.apptsPage = 1;
  }

  openClinicalRecord(appt: Appointment) {
    if (!appt.pet_id) return;
    this.clinicalPetId = appt.pet_id;
    this.isClinicalModalOpen = true;
  }

  onClinicalModalDismiss() {
    this.isClinicalModalOpen = false;
    this.clinicalPetId = null;
  }

  ngOnInit() {
    this.dates = this.generateDates(21);
    this.selectedDate = this.dates[0];
    this.currentMonthYear = this.formatMonthYear(this.selectedDate.date);
    this.loadData();
    this.loadPendingPayments();
    this.loadPaymentConfig();
  }

  // Ionic reutiliza la página desde su caché: al volver al panel se
  // recargan los comprobantes y la agenda para no mostrar datos viejos.
  private hasEntered = false;
  ionViewWillEnter() {
    if (this.hasEntered) {
      this.loadData();
      this.loadPendingPayments();
    }
    this.hasEntered = true;
  }

  generateDates(count: number): DateOption[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: count }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return {
        date: d,
        isoDate: toLocalIsoDate(d),
        dayNum: d.getDate().toString(),
        dayAbbr: DAYS[d.getDay()],
        monthAbbr: MONTHS[d.getMonth()],
        isToday: i === 0,
      };
    });
  }

  formatMonthYear(d: Date): string {
    return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }

  /** 'YYYY-MM-DD' → "Dom 25 Oct 2026" (fecha local, sin desfase de zona horaria). */
  formatFechaCorta(fecha: string): string {
    const d = new Date(fecha + 'T00:00:00');
    const cap = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();
    return `${cap(DAYS[d.getDay()])} ${d.getDate()} ${cap(MONTHS[d.getMonth()])} ${d.getFullYear()}`;
  }

  /** Formatea el diagnóstico reemplazando guiones bajos por espacios */
  formatDiagnostico(diagnostico: string): string {
    return (diagnostico ?? '').replace(/_/g, ' ');
  }

  selectDate(date: DateOption) {
    this.selectedDate = date;
    this.currentMonthYear = this.formatMonthYear(date.date);
    this.loadData();
  }

  loadData() {
    if (!this.selectedDate) return;
    this.loadSlots();
    this.loadAppointments();
  }

  loadSlots() {
    this.isLoadingSlots = true;
    this.appointmentService.getAdminSlots(this.selectedDate!.isoDate).subscribe({
      next: (s) => { this.slots = s; this.isLoadingSlots = false; },
      error: () => { this.isLoadingSlots = false; },
    });
  }

  loadAppointments() {
    this.isLoadingAppts = true;
    this.appointmentService.getAllAppointments(this.selectedDate!.isoDate).subscribe({
      next: (a) => { this.appointments = a; this.apptsPage = 1; this.isLoadingAppts = false; },
      error: () => { this.isLoadingAppts = false; },
    });
  }

  toggleSlot(slot: AdminSlot) {
    if (slot.tipo === 'ocupado') return; // no se puede desbloquear una cita real
    if (slot.tipo === 'bloqueado') {
      this.appointmentService.unblockSlot(this.selectedDate!.isoDate, slot.hora).subscribe({
        next: () => { this.showToast('Horario desbloqueado'); this.loadSlots(); },
      });
    } else {
      this.appointmentService.blockSlot(this.selectedDate!.isoDate, slot.hora).subscribe({
        next: () => { this.showToast('Horario bloqueado'); this.loadSlots(); },
      });
    }
  }

  updateEstado(appt: Appointment, estado: string) {
    this.appointmentService.updateAppointmentEstado(appt.id, estado).subscribe({
      next: () => {
        appt.estado = estado;
        const msg = estado === 'confirmada' ? 'Cita aceptada correctamente' : 'Cita rechazada';
        this.showToast(msg, estado === 'cancelada');
        this.loadSlots();
      },
      error: (err) => this.showToast(err?.error?.detail || 'Error al actualizar la cita', true),
    });
  }

  // ── PAGOS PENDIENTES ────────────────────────────────────────────────
  loadPendingPayments() {
    this.isLoadingPending = true;
    this.appointmentService.getPendingPayments().subscribe({
      // El backend ya los ordena por fecha y hora de la cita: primero los
      // de las citas más próximas, que son los más urgentes de revisar.
      next: (p) => {
        this.pendingPayments = p;
        this.carouselIndex = Math.min(this.carouselIndex, Math.max(0, p.length - 1));
        this.isLoadingPending = false;
      },
      error: () => { this.isLoadingPending = false; },
    });
  }

  // ── Carrusel ────────────────────────────────────────────────────────
  onCarouselScroll(track: HTMLElement) {
    const card = track.querySelector<HTMLElement>('.payment-review-card');
    if (!card) return;
    const step = card.offsetWidth + parseFloat(getComputedStyle(track).columnGap || '0');
    this.carouselIndex = Math.min(this.pendingPayments.length - 1, Math.round(track.scrollLeft / step));
  }

  scrollCarousel(track: HTMLElement, direction: 1 | -1) {
    const card = track.querySelector<HTMLElement>('.payment-review-card');
    if (!card) return;
    track.scrollBy({ left: direction * (card.offsetWidth + 12), behavior: 'smooth' });
  }

  // ── Revisión en cola ────────────────────────────────────────────────
  startReviewQueue() {
    if (this.pendingPayments.length === 0) return;
    this.reviewQueueActive = true;
    this.reviewQueueTotal = this.pendingPayments.length;
    this.reviewQueueDone = 0;
    this.openPaymentModal(this.pendingPayments[0]);
  }

  get reviewQueueLabel(): string | null {
    return this.reviewQueueActive
      ? `Comprobante ${this.reviewQueueDone + 1} de ${this.reviewQueueTotal}`
      : null;
  }

  openPaymentModal(appt: Appointment) {
    this.selectedPendingPayment = appt;
    this.isPaymentModalOpen = true;
  }

  /** Se llama automáticamente al cerrar el ion-modal (backdrop click, ESC, swipe down) */
  onPaymentModalDismiss() {
    this.selectedPendingPayment = null;
    this.isPaymentModalOpen = false;
    this.reviewQueueActive = false;
  }

  /** Ver comprobante de pago (para citas confirmadas) */
  viewComprobante(appointment: Appointment) {
    this.selectedPendingPayment = appointment;
    this.isPaymentModalOpen = true;
  }

  decidePaymentFromModal(aprobado: boolean) {
    if (!this.selectedPendingPayment) return;
    const appt = this.selectedPendingPayment;
    this.decidingId = appt.id;
    this.appointmentService.decidePayment(appt.id, aprobado).subscribe({
      next: () => {
        this.decidingId = null;
        this.pendingPayments = this.pendingPayments.filter((p) => p.id !== appt.id);
        this.carouselIndex = Math.min(this.carouselIndex, Math.max(0, this.pendingPayments.length - 1));
        this.showToast(aprobado ? 'Pago aprobado, cita confirmada' : 'Pago rechazado, horario liberado', !aprobado);

        if (this.reviewQueueActive && this.pendingPayments.length > 0) {
          // Siguiente de la cola en el mismo modal, sin cerrarlo.
          this.reviewQueueDone++;
          this.selectedPendingPayment = this.pendingPayments[0];
        } else {
          if (this.reviewQueueActive) this.showToast('Revisaste todos los comprobantes pendientes');
          this.reviewQueueActive = false;
          this.selectedPendingPayment = null;
          this.isPaymentModalOpen = false;
        }
        // Rechazar libera el horario: la agenda del día también cambia.
        this.loadData();
      },
      error: (err) => {
        this.decidingId = null;
        this.isPaymentModalOpen = false; // También cerrar en error
        this.reviewQueueActive = false;
        this.showToast(err?.error?.detail || 'Error al procesar el pago', true);
        this.loadPendingPayments();
      },
    });
  }

  // ── CONFIGURACIÓN DE PAGOS ──────────────────────────────────────────
  togglePaymentConfig() {
    this.showPaymentConfig = !this.showPaymentConfig;
  }

  loadPaymentConfig() {
    this.paymentConfigService.getConfig().subscribe({
      next: (cfg) => {
        this.paymentConfig = cfg;
        this.paymentConfigForm = {
          yape_phone: cfg.yape_phone ?? '', banco: cfg.banco ?? '', tipo_cuenta: cfg.tipo_cuenta ?? '',
          numero_cuenta: cfg.numero_cuenta ?? '', cci: cfg.cci ?? '', titular: cfg.titular ?? '',
        };
      },
    });
  }

  savePaymentConfig() {
    this.isSavingConfig = true;
    this.paymentConfigService.updateConfig(this.paymentConfigForm).subscribe({
      next: (cfg) => {
        this.paymentConfig = cfg;
        this.isSavingConfig = false;
        this.showToast('Datos de pago actualizados');
      },
      error: () => {
        this.isSavingConfig = false;
        this.showToast('Error al guardar los datos de pago', true);
      },
    });
  }

  onQrSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.isUploadingQr = true;
    this.paymentConfigService.uploadQr(file).subscribe({
      next: (cfg) => {
        this.paymentConfig = cfg;
        this.isUploadingQr = false;
        this.showToast('QR de Yape actualizado');
      },
      error: () => {
        this.isUploadingQr = false;
        this.showToast('Error al subir el QR', true);
      },
    });
  }

  showToast(msg: string, isError = false) {
    this.toastMsg = msg;
    this.toastError = isError;
    setTimeout(() => { this.toastMsg = ''; this.toastError = false; }, 3000);
  }

  getEstadoColor(estado: string): string {
    const map: Record<string, string> = { pendiente: '#d68910', confirmada: '#27ae60', cancelada: '#c0392b' };
    return map[estado] ?? '#888';
  }

  // Helper para saber si una cita tiene pago pendiente de revisión
  /** Estado único de la cita para el veterinario (combina cita y pago). */
  apptStatus(a: Appointment): { label: string; cls: string; icon: string } {
    if (a.estado === 'cancelada') {
      return a.pago_estado === 'rechazado'
        ? { label: 'Pago rechazado', cls: 'st-cancelled', icon: 'close-circle-outline' }
        : { label: 'Cancelada', cls: 'st-cancelled', icon: 'close-circle-outline' };
    }
    if (a.estado === 'confirmada') {
      return { label: 'Confirmada', cls: 'st-confirmed', icon: 'checkmark-circle-outline' };
    }
    return this.hasPendingPayment(a)
      ? { label: 'Pago en revisión', cls: 'st-review', icon: 'hourglass-outline' }
      : { label: 'Por confirmar', cls: 'st-pending', icon: 'time-outline' };
  }

  hasPendingPayment(appt: Appointment): boolean {
    return appt.pago_estado === 'pendiente' && !!appt.comprobante_url;
  }

  // El panel se abre desde Mi cuenta: volver siempre lleva ahí. No se usa
  // location.back(), que tras el login devolvía a /login y sin historial
  // (página recargada) no hacía nada.
  goBack() { this.router.navigate(['/profile']); }
}
