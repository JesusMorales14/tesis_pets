import { Component, inject } from '@angular/core';

import { IonicModule } from '@ionic/angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CLINIC } from '@core/constants/clinic';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class FooterComponent {
  private sanitizer = inject(DomSanitizer);

  readonly address = CLINIC.address;
  readonly phone = CLINIC.phoneDisplay;
  readonly phoneHref = CLINIC.phoneHref;
  readonly year = new Date().getFullYear();
  readonly directionsUrl = CLINIC.directionsUrl;
  // URL constante y propia (no viene del usuario): es seguro marcarla como confiable.
  readonly mapUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(CLINIC.mapEmbedUrl);
}
