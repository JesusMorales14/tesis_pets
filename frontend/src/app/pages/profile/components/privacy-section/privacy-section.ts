import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '@core/services/auth';
import { DialogService } from '@core/services/dialog';
import { CollapsibleSectionComponent } from '@shared/components/collapsible-section/collapsible-section';

/** Derechos sobre los datos personales (Ley 29733): exportar y eliminar la cuenta. */
@Component({
  selector: 'app-privacy-section',
  templateUrl: './privacy-section.html',
  styleUrls: ['./privacy-section.scss'],
  standalone: true,
  imports: [IonicModule, RouterLink, CollapsibleSectionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacySectionComponent {
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(DialogService);

  /** Se emite cuando la cuenta fue eliminada en el servidor. */
  readonly accountDeleted = output<void>();

  protected readonly isDeleting = signal(false);
  protected readonly error = signal('');

  protected async deleteAccount(): Promise<void> {
    const confirmed = await this.dialog.confirmDestructive(
      'Eliminar cuenta',
      'Esto elimina tu cuenta, tus mascotas, su historial de diagnósticos y vacunas, y tus citas. ' +
        'No se puede deshacer. ¿Quieres continuar?',
      'Eliminar cuenta',
    );
    if (!confirmed) return;

    this.isDeleting.set(true);
    this.error.set('');
    this.auth.deleteMyAccount().subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.accountDeleted.emit();
      },
      error: () => {
        this.isDeleting.set(false);
        this.error.set('No se pudo eliminar tu cuenta. Intenta de nuevo.');
      },
    });
  }
}
