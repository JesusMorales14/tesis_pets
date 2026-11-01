import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PredictionResult } from '@core/services/prediction';
import { AppointmentService, TimeSlot } from '@core/services/appointment';
import { AuthService } from '@core/services/auth';
import { ThemeService } from '@core/services/theme';
import { BreakpointService } from '@core/services/breakpoint';
import { DiagnosisFlowService, SelectedSymptom } from '@core/services/diagnosis-flow';
import { toLocalIsoDate } from '@core/utils/date';

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
  templateUrl: './schedule.html',
  styleUrls: ['./schedule.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class ScheduleComponent implements OnInit {
  private router = inject(Router);
  private appointmentService = inject(AppointmentService);
  private auth = inject(AuthService);
  private sanitizer = inject(DomSanitizer);
  private flow = inject(DiagnosisFlowService);
  private destroyRef = inject(DestroyRef);
  themeService = inject(ThemeService);
  breakpointService = inject(BreakpointService);

  readonly clinicName = 'Clínica Veterinaria CityVet';
  readonly address = 'Jirón Los Ángeles 270 (media cuadra antes de la Reniec), Chincha Alta, Perú';
  readonly directionsUrl =
    'https://www.google.com/maps/place/Cl%C3%ADnica+Veterinaria+CityVet/@-13.4156907,-76.1312858,19z/data=!4m6!3m5!1s0x911017c7fecdd98b:0xc590a4ac9f39ab48!8m2!3d-13.4156907!4d-76.1312858!16s%2Fg%2F11k53t33hw';
  readonly mapUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1945.748074900762!2d-76.13347442296752!3d-13.415690686940866!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x911017c7fecdd98b%3A0xc590a4ac9f39ab48!2sCl%C3%ADnica%20Veterinaria%20CityVet!5e0!3m2!1ses!2spe!4v1709490000000!5m2!1ses!2spe',
  );

  result: PredictionResult | null = null;
  especie = 'perro';
  petNombre: string | null = null;
  selectedSymptoms: SelectedSymptom[] = [];

  /** Formatea el diagnóstico reemplazando guiones bajos por espacios */
  formatDiagnostico(diagnostico: string): string {
    return (diagnostico ?? '').replace(/_/g, ' ');
  }

  clinicAbierta = false;
  currentMonthYear = '';

  dates: DateOption[] = [];
  selectedDate: DateOption | null = null;

  timeSlots: TimeSlot[] = [];
  selectedSlot: TimeSlot | null = null;
  isLoadingSlots = false;
  firstAvailableHora = '';

  isLoggedIn = false;

  ngOnInit() {
    this.auth.user$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => { this.isLoggedIn = this.auth.isLoggedIn; });
  }

  // Se recarga en cada entrada (Ionic reutiliza la página desde su caché):
  // al volver del login o del pago debe reflejar el flujo actual y la
  // disponibilidad real de horarios en ese momento.
  ionViewWillEnter() {
    const state = this.flow.state;
    this.result     = state?.result ?? null;
    this.especie    = state?.especie ?? 'perro';
    this.selectedSymptoms = state?.selectedSymptoms ?? [];
    this.petNombre  = this.result?.mascota ?? state?.petNombre ?? null;

    if (!this.result) {
      this.router.navigate(['/tabs/tab2']);
      return;
    }

    this.isLoggedIn = this.auth.isLoggedIn;

    const hour = new Date().getHours();
    this.clinicAbierta = hour >= 9 && hour < 22;

    this.dates = this.generateDates(14);
    this.selectedDate = this.dates.find(d => d.isoDate === state?.fecha) ?? this.dates[0];
    this.selectedSlot = null;
    this.currentMonthYear = this.formatMonthYear(this.selectedDate.date);

    this.loadSlots(state?.fecha === this.selectedDate.isoDate ? state?.hora : undefined);
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

    // El horario elegido queda en el flujo: si hay que pasar por el login,
    // al volver aparece ya seleccionado.
    this.flow.setSlot(this.selectedDate!.isoDate, this.selectedSlot!.hora);

    if (!this.isLoggedIn) {
      this.router.navigate(['/login'], { state: { returnTo: '/schedule' } });
      return;
    }

    this.router.navigate(['/payment']);
  }

  getGravedadColor(): string {
    const map: Record<string, string> = { leve: '#1e8449', moderada: '#d68910', grave: '#c0392b' };
    return map[this.result?.gravedad ?? ''] ?? '#2f6df6';
  }

  goBack() {
    this.router.navigate(['/diagnostic-result']);
  }
}
