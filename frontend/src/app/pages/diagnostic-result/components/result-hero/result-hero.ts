import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';

const RING_CIRCUMFERENCE = 2 * Math.PI * 52; // r = 52 en el viewBox de 120
const GRAVEDAD_ICONS: Record<string, string> = { leve: 'checkmark-circle', moderada: 'alert-circle', grave: 'warning' };

/** Cabecera del resultado: anillo de confianza de la IA, gravedad y especie. */
@Component({
  selector: 'app-result-hero',
  templateUrl: './result-hero.html',
  styleUrls: ['./result-hero.scss'],
  standalone: true,
  imports: [IonicModule, TitleCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'gravedad()' },
})
export class ResultHeroComponent {
  /** Confianza del modelo, 0–100. */
  readonly percent = input.required<number>();
  readonly gravedad = input<string>('');
  readonly especie = input<string>('');

  protected readonly circumference = RING_CIRCUMFERENCE;
  protected readonly dashOffset = computed(() => RING_CIRCUMFERENCE * (1 - this.percent() / 100));
  protected readonly gravedadIcon = computed(() => GRAVEDAD_ICONS[this.gravedad()] ?? 'information-circle');
}
