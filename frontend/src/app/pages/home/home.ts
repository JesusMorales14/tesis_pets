import { Component } from '@angular/core';
import { HeroComponent } from './hero/hero';
import { StepsComponent } from './steps/steps';
import { AboutAiComponent } from './about-ai/about-ai';

import { FooterComponent } from '@shared/components/footer/footer';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  standalone: true,
  imports: [HeroComponent, StepsComponent, AboutAiComponent, FooterComponent],
})
export class HomeComponent {}
