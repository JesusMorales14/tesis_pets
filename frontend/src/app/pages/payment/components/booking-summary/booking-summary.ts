import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AppDatePipe, DiagnosisLabelPipe } from '@shared/pipes';

/** Resumen de la cita que se está pagando: diagnóstico, fecha y hora. */
@Component({
  selector: 'app-booking-summary',
  templateUrl: './booking-summary.html',
  styleUrls: ['./booking-summary.scss'],
  standalone: true,
  imports: [IonicModule, TitleCasePipe, AppDatePipe, DiagnosisLabelPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingSummaryComponent {
  readonly diagnostico = input.required<string>();
  readonly gravedad = input<string>('');
  readonly especie = input<string>('');
  readonly fecha = input.required<string>();
  readonly hora = input.required<string>();
}
