import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Appointment } from '@core/models/appointment';
import { ownerAppointmentStatus } from '@core/utils/appointment-status';
import { isTomorrow } from '@core/utils/date';
import { AppDatePipe, DiagnosisLabelPipe } from '@shared/pipes';

/** Una cita del dueño: fecha, diagnóstico, estado y acceso al comprobante. */
@Component({
  selector: 'app-appointment-item',
  templateUrl: './appointment-item.html',
  styleUrls: ['./appointment-item.scss'],
  standalone: true,
  imports: [IonicModule, TitleCasePipe, DecimalPipe, AppDatePipe, DiagnosisLabelPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentItemComponent {
  readonly appointment = input.required<Appointment>();
  readonly viewComprobante = output<Appointment>();

  // computed(): el estado se calcula una vez por cambio de la cita, no en
  // cada ciclo de detección (antes se llamaba 3 veces por fila en el template).
  protected readonly status = computed(() => ownerAppointmentStatus(this.appointment()));
  protected readonly showTomorrow = computed(
    () => this.appointment().estado === 'confirmada' && isTomorrow(this.appointment().fecha),
  );
}
