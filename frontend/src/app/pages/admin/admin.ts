import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService, AdminSlot, Appointment } from '@core/services/appointment';
import { PaymentConfigService, PaymentConfig } from '@core/services/payment-config';
import { ThemeService } from '@core/services/theme';
import { PaginationComponent } from '@shared/components/pagination/pagination';
import { environment } from '../../../environments/environment';

const MONTHS = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
const DAYS   = ['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB'];

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
  imports: [IonicModule, CommonModule, FormsModule, PaginationComponent],
})
export class AdminComponent implements OnInit {
  private router = inject(Router);
  private location = inject(Location);
  private appointmentService = inject(AppointmentService);
  private paymentConfigService = inject(PaymentConfigService);
  themeService = inject(ThemeService);
  readonly apiUrl = environment.apiUrl;

  // Pagos pendientes de revisión (independiente del día seleccionado — un
  // comprobante puede llegar para una cita de cualquier fecha).
  pendingPayments: Appointment[] = [];
  isLoadingPending = false;
  decidingId: number | null = null;

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

  get pagedAppointments(): Appointment[] {
    const start = (this.apptsPage - 1) * this.apptsPageSize;
    return this.appointments.slice(start, start + this.apptsPageSize);
  }

  ngOnInit() {
    this.dates = this.generateDates(21);
    this.selectedDate = this.dates[0];
    this.currentMonthYear = this.formatMonthYear(this.selectedDate.date);
    this.loadData();
    this.loadPendingPayments();
    this.loadPaymentConfig();
  }

  generateDates(count: number): DateOption[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: count }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return {
        date: d,
        isoDate: d.toISOString().split('T')[0],
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
      },
      error: () => this.showToast('Error al actualizar la cita', true),
    });
  }

  // ── PAGOS PENDIENTES ────────────────────────────────────────────────
  loadPendingPayments() {
    this.isLoadingPending = true;
    this.appointmentService.getPendingPayments().subscribe({
      next: (p) => { this.pendingPayments = p; this.isLoadingPending = false; },
      error: () => { this.isLoadingPending = false; },
    });
  }

  decidePayment(appt: Appointment, aprobado: boolean) {
    this.decidingId = appt.id;
    this.appointmentService.decidePayment(appt.id, aprobado).subscribe({
      next: () => {
        this.decidingId = null;
        this.pendingPayments = this.pendingPayments.filter((p) => p.id !== appt.id);
        this.showToast(aprobado ? 'Pago aprobado, cita confirmada' : 'Pago rechazado', !aprobado);
        this.loadAppointments();
      },
      error: () => {
        this.decidingId = null;
        this.showToast('Error al procesar el pago', true);
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

  goBack() { this.location.back(); }
}
