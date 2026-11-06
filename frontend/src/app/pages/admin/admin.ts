import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal, viewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AdminSlot, Appointment, AppointmentEstado } from '@core/models/appointment';
import { AppointmentService } from '@core/services/appointment';
import { DateOption, buildDateOptions } from '@core/utils/date';
import { getApiErrorMessage } from '@core/utils/http-error';
import { DateStripComponent } from '@shared/components/date-strip/date-strip';
import { PageToolbarComponent } from '@shared/components/page-toolbar/page-toolbar';
import { AdminNotice } from './admin-notice';
import { AgendaComponent } from './components/agenda/agenda';
import { PaymentConfigComponent } from './components/payment-config/payment-config';
import { PendingPaymentsComponent } from './components/pending-payments/pending-payments';
import { PetClinicalModalComponent } from './components/pet-clinical-modal/pet-clinical-modal';
import { SlotsManagerComponent } from './components/slots-manager/slots-manager';

const AGENDA_DAYS = 21;
const NOTICE_MS = 3000;

/**
 * Panel del veterinario (contenedor): día seleccionado, horarios y agenda.
 * Los pagos pendientes y la configuración de cobro son subcomponentes
 * autónomos que avisan al panel cuando algo cambia.
 */
@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss'],
  standalone: true,
  imports: [
    IonicModule,
    PageToolbarComponent,
    DateStripComponent,
    PendingPaymentsComponent,
    PaymentConfigComponent,
    SlotsManagerComponent,
    AgendaComponent,
    PetClinicalModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent implements OnInit {
  private readonly appointmentApi = inject(AppointmentService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly pendingPayments = viewChild.required(PendingPaymentsComponent);

  protected readonly dates: DateOption[] = buildDateOptions(AGENDA_DAYS);
  protected readonly selectedDate = signal<DateOption>(this.dates[0]);

  protected readonly slots = signal<AdminSlot[]>([]);
  protected readonly appointments = signal<Appointment[]>([]);
  protected readonly isLoadingSlots = signal(false);
  protected readonly isLoadingAppointments = signal(false);

  protected readonly clinicalPetId = signal<number | null>(null);
  protected readonly notice = signal<AdminNotice | null>(null);

  private noticeTimer?: ReturnType<typeof setTimeout>;
  private hasEntered = false;

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.noticeTimer));
  }

  ngOnInit(): void {
    this.loadDay();
  }

  // Ionic reutiliza la página desde su caché: al volver se recargan los
  // comprobantes y la agenda para no mostrar datos viejos.
  ionViewWillEnter(): void {
    if (this.hasEntered) {
      this.loadDay();
      this.pendingPayments().load();
    }
    this.hasEntered = true;
  }

  protected selectDate(date: DateOption): void {
    this.selectedDate.set(date);
    this.loadDay();
  }

  protected loadDay(): void {
    this.loadSlots();
    this.loadAppointments();
  }

  protected toggleSlot(slot: AdminSlot): void {
    const fecha = this.selectedDate().isoDate;
    const blocked = slot.tipo === 'bloqueado';
    const request = blocked
      ? this.appointmentApi.unblockSlot(fecha, slot.hora)
      : this.appointmentApi.blockSlot(fecha, slot.hora);
    request.subscribe({
      next: () => {
        this.showNotice({ message: blocked ? 'Horario desbloqueado' : 'Horario bloqueado' });
        this.loadSlots();
      },
      error: (err) => this.showNotice({ message: getApiErrorMessage(err, 'No se pudo actualizar el horario'), isError: true }),
    });
  }

  protected changeEstado({ appointment, estado }: { appointment: Appointment; estado: AppointmentEstado }): void {
    this.appointmentApi.updateAppointmentEstado(appointment.id, estado).subscribe({
      next: () => {
        this.appointments.update((list) => list.map((a) => (a.id === appointment.id ? { ...a, estado } : a)));
        const cancelled = estado === 'cancelada';
        this.showNotice({ message: cancelled ? 'Cita rechazada' : 'Cita aceptada correctamente', isError: cancelled });
        this.loadSlots();
      },
      error: (err) => this.showNotice({ message: getApiErrorMessage(err, 'Error al actualizar la cita'), isError: true }),
    });
  }

  protected openPayment(appointment: Appointment): void {
    this.pendingPayments().open(appointment);
  }

  protected openClinicalRecord(appointment: Appointment): void {
    if (appointment.pet_id) this.clinicalPetId.set(appointment.pet_id);
  }

  protected closeClinicalRecord(): void {
    this.clinicalPetId.set(null);
  }

  protected showNotice(notice: AdminNotice): void {
    clearTimeout(this.noticeTimer);
    this.notice.set(notice);
    this.noticeTimer = setTimeout(() => this.notice.set(null), NOTICE_MS);
  }

  private loadSlots(): void {
    this.isLoadingSlots.set(true);
    this.appointmentApi.getAdminSlots(this.selectedDate().isoDate).subscribe({
      next: (slots) => {
        this.slots.set(slots);
        this.isLoadingSlots.set(false);
      },
      error: () => this.isLoadingSlots.set(false),
    });
  }

  private loadAppointments(): void {
    this.isLoadingAppointments.set(true);
    this.appointmentApi.getAllAppointments(this.selectedDate().isoDate).subscribe({
      next: (list) => {
        this.appointments.set(list);
        this.isLoadingAppointments.set(false);
      },
      error: () => this.isLoadingAppointments.set(false),
    });
  }
}
