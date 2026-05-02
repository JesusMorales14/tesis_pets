import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab2Page } from './tab2.page';

import { Tab2PageRoutingModule } from './tab2-routing.module';
import { HeaderComponent } from '../components/header/header.component';
import { PetSelectionComponent } from '../pages/pet-selection/pet-selection.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    PetSelectionComponent,
    Tab2PageRoutingModule,
    HeaderComponent,
  ],
  declarations: [Tab2Page],
})
export class Tab2PageModule {}
