import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CurrencyPipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CLINIC } from '@core/constants/clinic';
import { Appointment, AppointmentEstado } from '@core/models/appointment';
import { adminAppointmentStatus, hasPendingPayment, paymentMethodLabel } from '@core/utils/appointment-status';
import { SeverityBadgeComponent } from '@shared/components/severity-badge/severity-badge';
import { DiagnosisLabelPipe } from '@shared/pipes';

/** Tarjeta de una cita en la agenda del veterinario. */
@Component({
  selector: 'app-agenda-card',
  templateUrl: './agenda-card.html',
  styleUrls: ['./agenda-card.scss'],
  standalone: true,
  imports: [IonicModule, TitleCasePipe, DecimalPipe, CurrencyPipe, DiagnosisLabelPipe, SeverityBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'listitem',
    '[class]': "'agenda-card prio-' + (appointment().gravedad || 'none')",
    '[class.is-cancelled]': "appointment().estado === 'cancelada'",
  },
})
export class AgendaCardComponent {
  readonly appointment = input.required<Appointment>();

  readonly openClinicalRecord = output<Appointment>();
  readonly reviewPayment = output<Appointment>();
  readonly viewComprobante = output<Appointment>();
  readonly changeEstado = output<{ appointment: Appointment; estado: AppointmentEstado }>();

  protected readonly price = CLINIC.consultationPrice;
  protected readonly status = computed(() => adminAppointmentStatus(this.appointment()));
  protected readonly pendingPayment = computed(
    () => hasPendingPayment(this.appointment()) && this.appointment().estado !== 'cancelada',
  );
  protected readonly methodLabel = computed(() => paymentMethodLabel(this.appointment().metodo_pago, true));

  protected decide(estado: AppointmentEstado): void {
    this.changeEstado.emit({ appointment: this.appointment(), estado });
  }
}
