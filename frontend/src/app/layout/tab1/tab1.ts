import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { HeaderComponent } from '@shared/components/header/header';
import { HomeComponent } from '@pages/home/home';

@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.html',
  styleUrls: ['./tab1.scss'],
  standalone: true,
  imports: [IonicModule, HeaderComponent, HomeComponent],
})
export class Tab1Page {}
