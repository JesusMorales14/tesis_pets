import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

type IonIconName = 'paw-outline' | 'medical-outline' | 'stats-chart-outline';

type IconBg = 'bg-blue' | 'bg-amber' | 'bg-teal';

interface Step {
  number: number;
  title: string;
  description: string;
  icon: IonIconName;
  iconBg: IconBg;
  route: string;
  cta: string;
}

@Component({
  selector: 'app-steps',
  templateUrl: './steps.component.html',
  styleUrls: ['./steps.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class StepsComponent {
  readonly steps: Step[] = [
    {
      number: 1,
      title: 'Paso 1: Selecciona Mascota',
      description:
        'Elige entre nuestra base de datos de razas y especies. La IA adapta su modelo según la fisiología única de tu amigo.',
      icon: 'paw-outline',
      iconBg: 'bg-blue',
      route: '/select-pet',
      cta: 'Explorar mascotas',
    },
    {
      number: 2,
      title: 'Paso 2: Elige Síntomas',
      description:
        'Nuestra interfaz intuitiva te guía a través de un set dinámico de síntomas, desde letargia hasta cambios dermatológicos.',
      icon: 'medical-outline',
      iconBg: 'bg-amber',
      route: '/select-pet',
      cta: 'Explorar mascotas',
    },
    {
      number: 3,
      title: 'Paso 3: Obtén Predicción',
      description:
        'Recibe un informe detallado con probabilidades diagnósticas y recomendaciones de cuidado inmediato validadas.',
      icon: 'stats-chart-outline',
      iconBg: 'bg-teal',
      route: '/select-pet',
      cta: 'Explorar mascotas',
    },
  ];

  trackByStep(_: number, step: Step): number {
    return step.number;
  }
}
