import { Component, inject } from '@angular/core';

import { IonicModule } from '@ionic/angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class FooterComponent {
  private sanitizer = inject(DomSanitizer);

  readonly address = 'Calle Los Ángeles N.° 270 (media cuadra antes de la Reniec), Chincha Alta, Perú';
  readonly phone = '956 472 846';
  readonly phoneHref = 'tel:+51956472846';
  readonly year = new Date().getFullYear();

  // Embed público de Google Maps por texto de búsqueda: no requiere API key
  // (a diferencia del Maps Embed API con marcador/coordenadas exactas).
  readonly mapUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    `https://www.google.com/maps?q=${encodeURIComponent(this.address)}&output=embed`,
  );
  readonly directionsUrl =
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(this.address)}`;
}
