import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { PredictionResult } from '../../services/prediction-service';
import { AppointmentService, TimeSlot } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';
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
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class ScheduleComponent implements OnInit {
  result: PredictionResult | null = null;
  especie = 'perro';

  clinicAbierta = false;
  currentMonthYear = '';

  dates: DateOption[] = [];
  selectedDate: DateOption | null = null;

  timeSlots: TimeSlot[] = [];
  selectedSlot: TimeSlot | null = null;
  isLoadingSlots = false;
  firstAvailableHora = '';

  isLoggedIn = false;

  constructor(
    private router: Router,
    private appointmentService: AppointmentService,
    private auth: AuthService,
    public themeService: ThemeService,
  ) {}

  ngOnInit() {
    const state = history.state;
    this.result     = state?.result   ?? null;
    this.especie    = state?.especie  ?? 'perro';

    if (!this.result) {
      this.router.navigate(['/tabs/tab2']);
      return;
    }

    this.isLoggedIn = this.auth.isLoggedIn;
    this.auth.user$.subscribe(() => { this.isLoggedIn = this.auth.isLoggedIn; });

    const now = new Date();
    const hour = now.getHours();
    this.clinicAbierta = hour >= 9 && hour < 22;

    this.dates = this.generateDates(14);
    const preDate = state?.selectedDate;
    this.selectedDate = preDate
      ? (this.dates.find(d => d.isoDate === preDate) ?? this.dates[0])
      : this.dates[0];
    this.currentMonthYear = this.formatMonthYear(this.selectedDate.date);

    const preHora = state?.selectedHora;
    this.loadSlots(preHora);
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
    this.selectedSlot = null;
    this.currentMonthYear = this.formatMonthYear(date.date);
    this.loadSlots();
  }

  loadSlots(preHora?: string) {
    if (!this.selectedDate) return;
    this.isLoadingSlots = true;
    this.timeSlots = [];
    this.appointmentService.getSlots(this.selectedDate.isoDate).subscribe({
      next: (slots) => {
        this.timeSlots = slots;
        const first = slots.find(s => s.disponible);
        this.firstAvailableHora = first?.hora ?? '';
        if (preHora) {
          this.selectedSlot = slots.find(s => s.hora === preHora && s.disponible) ?? null;
        }
        this.isLoadingSlots = false;
      },
      error: () => { this.isLoadingSlots = false; },
    });
  }

  selectSlot(slot: TimeSlot) {
    if (!slot.disponible) return;
    this.selectedSlot = this.selectedSlot?.hora === slot.hora ? null : slot;
  }

  isFirstAvailable(slot: TimeSlot): boolean {
    return slot.hora === this.firstAvailableHora && slot.disponible;
  }

  canConfirm(): boolean {
    return !!this.selectedDate && !!this.selectedSlot;
  }

  confirmar() {
    if (!this.canConfirm()) return;

    if (!this.isLoggedIn) {
      this.router.navigate(['/login'], {
        state: {
          returnTo: '/schedule',
          returnState: {
            result: this.result,
            especie: this.especie,
            selectedDate: this.selectedDate!.isoDate,
            selectedHora: this.selectedSlot!.hora,
          },
        },
      });
      return;
    }

    this.router.navigate(['/payment'], {
      state: {
        result: this.result,
        especie: this.especie,
        fecha: this.selectedDate!.isoDate,
        hora: this.selectedSlot!.hora,
      },
    });
  }

  getGravedadColor(): string {
    const map: Record<string, string> = { leve: '#1e8449', moderada: '#d68910', grave: '#c0392b' };
    return map[this.result?.gravedad ?? ''] ?? '#2f6df6';
  }

  goBack() {
    this.router.navigate(['/diagnostic-result'], {
      state: { result: this.result, especie: this.especie },
    });
  }
}
