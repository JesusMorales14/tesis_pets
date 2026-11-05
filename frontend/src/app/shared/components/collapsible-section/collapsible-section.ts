import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { IonicModule } from '@ionic/angular';

let nextId = 0;

/**
 * Tarjeta de sección con encabezado (icono + título + contador) que puede
 * plegarse. El encabezado es un `<button>` con `aria-expanded` y
 * `aria-controls`, accesible con teclado y lector de pantalla (antes era un
 * `<div (click)>`, que no recibe foco).
 *
 * Con `collapsible = false` se comporta como una tarjeta fija con título.
 */
@Component({
  selector: 'app-collapsible-section',
  templateUrl: './collapsible-section.html',
  styleUrls: ['./collapsible-section.scss'],
  standalone: true,
  imports: [IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollapsibleSectionComponent {
  readonly heading = input.required<string>();
  readonly icon = input.required<string>();
  /** Contador opcional junto al título (0 o null lo ocultan). */
  readonly count = input<number | null>(null);
  readonly collapsible = input(true);
  readonly expanded = model(true);

  protected readonly contentId = `section-content-${nextId++}`;

  protected toggle(): void {
    this.expanded.update((v) => !v);
  }
}
