import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { CLINIC, isClinicOpen } from '@core/constants/clinic';

/** Ubicación de la clínica: mapa, dirección, horario y estado abierto/cerrado. */
@Component({
  selector: 'app-clinic-card',
  templateUrl: './clinic-card.html',
  styleUrls: ['./clinic-card.scss'],
  standalone: true,
  imports: [IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClinicCardComponent {
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly clinic = CLINIC;
  protected readonly isOpen = isClinicOpen();
  // URL constante y propia (no viene del usuario): es seguro marcarla como confiable.
  protected readonly mapUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(CLINIC.mapEmbedUrl);
}
