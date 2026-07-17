import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.html',
  styleUrls: ['./privacy-policy.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class PrivacyPolicyComponent {
  private location = inject(Location);

  readonly lastUpdated = '16 de julio de 2026';

  goBack() {
    this.location.back();
  }
}
