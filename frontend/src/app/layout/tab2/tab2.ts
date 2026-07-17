import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { HeaderComponent } from '@shared/components/header/header';
import { PetSelectionComponent } from '@pages/pet-selection/pet-selection';

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.html',
  styleUrls: ['./tab2.scss'],
  standalone: true,
  imports: [IonicModule, HeaderComponent, PetSelectionComponent],
})
export class Tab2Page {
  loading = true;

  ionViewDidEnter() {
    // simula carga de datos
    setTimeout(() => {
      this.loading = false;
    }, 900);
  }
}
