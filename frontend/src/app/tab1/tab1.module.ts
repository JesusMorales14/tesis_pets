import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { HeroComponent } from '../pages/home/hero/hero.component';

import { Tab1PageRoutingModule } from './tab1-routing.module';
import { HeaderComponent } from '../components/header/header.component';
import { StepsComponent } from '../pages/home/steps/steps.component';
import { HomeComponent } from '../pages/home/home.component';

@NgModule({
  imports: [
    HeaderComponent,
    IonicModule,
    CommonModule,
    FormsModule,
    HeroComponent,
    Tab1PageRoutingModule,
    HeaderComponent,
    StepsComponent,
    HomeComponent,
  ],
  declarations: [Tab1Page],
})
export class Tab1PageModule {}
