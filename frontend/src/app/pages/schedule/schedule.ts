import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { map } from 'rxjs';
import { CLINIC } from '@core/constants/clinic';
import { TimeSlot } from '@core/models/appointment';
import { PredictionResult } from '@core/models/prediction';
import { AppointmentService } from '@core/services/appointment';
import { AuthService } from '@core/services/auth';
import { DiagnosisFlowService } from '@core/services/diagnosis-flow';
import { DateOption, buildDateOptions } from '@core/utils/date';
import { DateStripComponent } from '@shared/components/date-strip/date-strip';
import { PageToolbarComponent } from '@shared/components/page-toolbar/page-toolbar';
import { ThemeToggleFabComponent } from '@shared/components/theme-toggle-fab/theme-toggle-fab';
import { ClinicCardComponent } from './components/clinic-card/clinic-card';
import { DiagnosisSummaryComponent } from './components/diagnosis-summary/diagnosis-summary';
import { TimeSlotPickerComponent } from './components/time-slot-picker/time-slot-picker';

const BOOKING_DAYS = 14;

/** Reserva de cita: fecha y horario para el diagnóstico actual (contenedor). */
@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.html',
  styleUrls: ['./schedule.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CurrencyPipe,
    PageToolbarComponent,
    ThemeToggleFabComponent,
    DateStripComponent,
    DiagnosisSummaryComponent,
    ClinicCardComponent,
    TimeSlotPickerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleComponent {
  private readonly router = inject(Router);
  private readonly appointmentApi = inject(AppointmentService);
  private readonly auth = inject(AuthService);
  private readonly flow = inject(DiagnosisFlowService);

  protected readonly price = CLINIC.consultationPrice;
  protected readonly isLoggedIn = toSignal(this.auth.user$.pipe(map(() => this.auth.isLoggedIn)), {
    initialValue: this.auth.isLoggedIn,
  });

  protected readonly result = signal<PredictionResult | null>(null);
  protected readonly especie = signal<'perro' | 'gato'>('perro');
  protected readonly dates = signal<DateOption[]>([]);
  protected readonly selectedDate = signal<DateOption | null>(null);
  protected readonly slots = signal<TimeSlot[]>([]);
  protected readonly selectedSlot = signal<TimeSlot | null>(null);
  protected readonly isLoadingSlots = signal(false);

  // Se recarga en cada entrada (Ionic reutiliza la página desde su caché):
  // al volver del login o del pago debe reflejar el flujo actual y la
  // disponibilidad real de horarios en ese momento.
  ionViewWillEnter(): void {
    const state = this.flow.state;
    if (!state?.result) {
      void this.router.navigate(['/tabs/tab2']);
      return;
    }
    this.result.set(state.result);
    this.especie.set(state.especie);

    const dates = buildDateOptions(BOOKING_DAYS);
    const selected = dates.find((d) => d.isoDate === state.fecha) ?? dates[0];
    this.dates.set(dates);
    this.selectedDate.set(selected);
    this.selectedSlot.set(null);
    this.loadSlots(state.fecha === selected.isoDate ? state.hora : undefined);
  }

  protected selectDate(date: DateOption): void {
    this.selectedDate.set(date);
    this.selectedSlot.set(null);
    this.loadSlots();
  }

  protected confirm(): void {
    const date = this.selectedDate();
    const slot = this.selectedSlot();
    if (!date || !slot) return;

    // El horario elegido queda en el flujo: si hay que pasar por el login,
    // al volver aparece ya seleccionado.
    this.flow.setSlot(date.isoDate, slot.hora);

    if (!this.isLoggedIn()) {
      void this.router.navigate(['/login'], { state: { returnTo: '/schedule' } });
      return;
    }
    void this.router.navigate(['/payment']);
  }

  private loadSlots(preselectHora?: string): void {
    const date = this.selectedDate();
    if (!date) return;
    this.isLoadingSlots.set(true);
    this.slots.set([]);
    this.appointmentApi.getSlots(date.isoDate).subscribe({
      next: (slots) => {
        this.slots.set(slots);
        if (preselectHora) {
          this.selectedSlot.set(slots.find((s) => s.hora === preselectHora && s.disponible) ?? null);
        }
        this.isLoadingSlots.set(false);
      },
      error: () => this.isLoadingSlots.set(false),
    });
  }
}
