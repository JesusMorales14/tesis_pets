import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';

/** Llamada a la acción para reservar la consulta presencial. */
@Component({
  selector: 'app-appointment-cta',
  templateUrl: './appointment-cta.html',
  styleUrls: ['./appointment-cta.scss'],
  standalone: true,
  imports: [IonicModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentCtaComponent {
  readonly urgent = input(false);
}
