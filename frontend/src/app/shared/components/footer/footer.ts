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

  readonly address = 'Jirón Los Ángeles 270 (media cuadra antes de la Reniec), Chincha Alta, Perú';
  readonly phone = '956 472 846';
  readonly phoneHref = 'tel:+51956472846';
  readonly year = new Date().getFullYear();

  // Embed exacto de la ubicación en Google Maps de Clínica Veterinaria CityVet
  readonly mapUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1945.748074900762!2d-76.13347442296752!3d-13.415690686940866!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x911017c7fecdd98b%3A0xc590a4ac9f39ab48!2sCl%C3%ADnica%20Veterinaria%20CityVet!5e0!3m2!1ses!2spe!4v1709490000000!5m2!1ses!2spe',
  );
  readonly directionsUrl =
    'https://www.google.com/maps/place/Cl%C3%ADnica+Veterinaria+CityVet/@-13.4156907,-76.1312858,19z/data=!4m6!3m5!1s0x911017c7fecdd98b:0xc590a4ac9f39ab48!8m2!3d-13.4156907!4d-76.1312858!16s%2Fg%2F11k53t33hw';
}
