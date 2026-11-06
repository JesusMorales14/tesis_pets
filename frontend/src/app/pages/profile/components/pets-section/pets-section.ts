import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Pet, PetBody, Vaccination, VaccinationBody } from '@core/models/pet';
import { DialogService } from '@core/services/dialog';
import { getApiErrorMessage } from '@core/utils/http-error';
import { PetFormModalComponent } from '@shared/components/pet-form-modal/pet-form-modal';
import { VaccinationFormModalComponent } from '@shared/components/vaccination-form-modal/vaccination-form-modal';
import { CollapsibleSectionComponent } from '@shared/components/collapsible-section/collapsible-section';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state';
import { ProfileStore } from '../../profile.store';
import { PetCardComponent } from '../pet-card/pet-card';

const CARD_COLORS = ['#e3f2fd', '#f3e5f5', '#e8f5e9', '#fff3e0', '#fce4ec', '#e0f2f1'];

/** "Mis mascotas": lista, alta/edición/baja y cartilla de vacunación. */
@Component({
  selector: 'app-pets-section',
  templateUrl: './pets-section.html',
  styleUrls: ['./pets-section.scss'],
  standalone: true,
  imports: [IonicModule, CollapsibleSectionComponent, EmptyStateComponent, PetCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetsSectionComponent {
  protected readonly store = inject(ProfileStore);
  private readonly modalCtrl = inject(ModalController);
  private readonly dialog = inject(DialogService);

  readonly expanded = model(true);

  protected colorFor(index: number): string {
    return CARD_COLORS[index % CARD_COLORS.length];
  }

  protected async addPet(): Promise<void> {
    const data = await this.openModal<PetBody>(PetFormModalComponent);
    if (data) this.run(this.store.createPet(data), 'No se pudo crear la mascota.');
  }

  protected async editPet(pet: Pet): Promise<void> {
    const data = await this.openModal<PetBody>(PetFormModalComponent, { pet });
    if (data) this.run(this.store.updatePet(pet.id, data), 'No se pudo actualizar la mascota.');
  }

  protected async deletePet(pet: Pet): Promise<void> {
    const vaccineCount = this.store.vaccinations()[pet.id]?.length ?? 0;
    let message = `¿Eliminar a ${pet.nombre} y todo su historial de diagnósticos y vacunas? Esta acción no se puede deshacer.`;
    if (vaccineCount > 0) message += ` Se eliminarán ${vaccineCount} vacuna(s) registrada(s).`;
    message += ' Sus citas ya reservadas no se cancelan.';

    if (!(await this.dialog.confirmDestructive('Eliminar mascota', message))) return;
    this.run(this.store.deletePet(pet), `No se pudo eliminar a ${pet.nombre}. Intenta de nuevo.`, false);
  }

  protected async addVaccination(pet: Pet): Promise<void> {
    const data = await this.openModal<VaccinationBody>(VaccinationFormModalComponent, { especie: pet.especie });
    if (data) this.run(this.store.createVaccination(pet.id, data), 'No se pudo registrar la vacuna.');
  }

  protected async deleteVaccination(pet: Pet, v: Vaccination): Promise<void> {
    const ok = await this.dialog.confirmDestructive('Eliminar vacuna', `¿Eliminar el registro de "${v.nombre}" de ${pet.nombre}?`);
    if (ok) this.run(this.store.deleteVaccination(pet.id, v.id), 'No se pudo eliminar la vacuna.', false);
  }

  /** Abre un formulario modal y devuelve los datos confirmados (o null si se canceló). */
  private async openModal<T>(component: unknown, componentProps?: Record<string, unknown>): Promise<T | null> {
    const modal = await this.modalCtrl.create({
      component: component as never,
      cssClass: 'pet-form-modal',
      componentProps,
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss<T>();
    return role === 'confirm' && data ? data : null;
  }

  /** Ejecuta un comando del store mostrando un error legible si falla. */
  private run(command: Observable<unknown>, fallback: string, useApiDetail = true): void {
    command.subscribe({
      error: (err) => void this.dialog.error(useApiDetail ? getApiErrorMessage(err, fallback) : fallback),
    });
  }
}
