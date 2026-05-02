import { Component } from '@angular/core';
import { HeroComponent } from './hero/hero.component';
import { StepsComponent } from './steps/steps.component';
import { AboutAiComponent } from './about-ai/about-ai.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, HeroComponent, StepsComponent, AboutAiComponent],
})
export class HomeComponent {}
