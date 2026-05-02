import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AppointmentService, AdminSlot, Appointment } from '../../services/appointment.service';
import { ThemeService } from '../../services/theme.service';

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
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class AdminComponent implements OnInit {
  dates: DateOption[] = [];
  selectedDate: DateOption | null = null;
  currentMonthYear = '';

  slots: AdminSlot[] = [];
  appointments: Appointment[] = [];
  isLoadingSlots = false;
  isLoadingAppts = false;
  toastMsg = '';
  toastError = false;

  constructor(
    private router: Router,
    private location: Location,
    private appointmentService: AppointmentService,
    public themeService: ThemeService,
  ) {}

  ngOnInit() {
    this.dates = this.generateDates(21);
    this.selectedDate = this.dates[0];
    this.currentMonthYear = this.formatMonthYear(this.selectedDate.date);
    this.loadData();
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
      next: (a) => { this.appointments = a; this.isLoadingAppts = false; },
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
