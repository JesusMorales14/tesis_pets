import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';

/**
 * Barra superior de las páginas internas: botón "volver" + título.
 *
 * Unifica la toolbar que estaba copiada (marcado y estilos) en cada página.
 * Se usa dentro del `<ion-header>` de la página. Los botones extra del lado
 * derecho se proyectan con el atributo `toolbarEnd`:
 *
 * ```html
 * <ion-header>
 *   <app-page-toolbar title="Mi cuenta" backLink="/tabs/tab1">
 *     <ion-button toolbarEnd aria-label="Descargar">…</ion-button>
 *   </app-page-toolbar>
 * </ion-header>
 * ```
 */
@Component({
  selector: 'app-page-toolbar',
  templateUrl: './page-toolbar.html',
  styleUrls: ['./page-toolbar.scss'],
  standalone: true,
  imports: [IonicModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageToolbarComponent {
  readonly title = input.required<string>();
  /** Ruta a la que lleva el botón volver. Sin valor, no se muestra. */
  readonly backLink = input<string | null>(null);
  readonly backLabel = input('Volver');
}
