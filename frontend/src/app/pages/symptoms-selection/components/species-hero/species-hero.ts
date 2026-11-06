import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Cabecera del análisis: mascota o especie y cantidad de síntomas elegidos. */
@Component({
  selector: 'app-species-hero',
  templateUrl: './species-hero.html',
  styleUrls: ['./species-hero.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.blue]': "especie() === 'perro'", '[class.teal]': "especie() === 'gato'" },
})
export class SpeciesHeroComponent {
  readonly especie = input.required<'perro' | 'gato'>();
  readonly name = input.required<string>();
  readonly count = input(0);
}
