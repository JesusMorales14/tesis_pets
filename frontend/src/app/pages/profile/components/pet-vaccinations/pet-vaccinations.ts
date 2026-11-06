import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Vaccination } from '@core/models/pet';
import { vaccinationStatus } from '@core/utils/vaccination-status';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state';
import { VaccinationBadgeComponent } from '@shared/components/vaccination-badge/vaccination-badge';
import { AppDatePipe } from '@shared/pipes';

/** Cartilla de vacunación de una mascota (lista + registrar/eliminar). */
@Component({
  selector: 'app-pet-vaccinations',
  templateUrl: './pet-vaccinations.html',
  styleUrls: ['./pet-vaccinations.scss'],
  standalone: true,
  imports: [IonicModule, AppDatePipe, EmptyStateComponent, VaccinationBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetVaccinationsComponent {
  readonly petName = input.required<string>();
  readonly vaccinations = input<Vaccination[]>([]);

  readonly add = output<void>();
  readonly remove = output<Vaccination>();

  protected readonly statusOf = vaccinationStatus;
}
