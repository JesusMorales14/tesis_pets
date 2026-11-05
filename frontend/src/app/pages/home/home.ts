import { Component } from '@angular/core';
import { HeroComponent } from './components/hero/hero';
import { StepsComponent } from './components/steps/steps';
import { AboutAiComponent } from './components/about-ai/about-ai';

import { FooterComponent } from '@shared/components/footer/footer';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  standalone: true,
  imports: [HeroComponent, StepsComponent, AboutAiComponent, FooterComponent],
})
export class HomeComponent {}
