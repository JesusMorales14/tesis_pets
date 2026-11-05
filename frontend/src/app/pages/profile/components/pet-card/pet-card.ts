import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { DiagnosisHistoryEntry, Pet, Vaccination } from '@core/models/pet';
import { VaccinationStatus } from '@core/utils/vaccination-status';
import { VaccinationBadgeComponent } from '@shared/components/vaccination-badge/vaccination-badge';
import { PetDiagnosisHistoryComponent } from '../pet-diagnosis-history/pet-diagnosis-history';
import { PetVaccinationsComponent } from '../pet-vaccinations/pet-vaccinations';

const DEFAULT_IMAGES = { perro: 'assets/img/dog.jpg', gato: 'assets/img/cat.jpg' } as const;

/**
 * Tarjeta de una mascota: datos básicos, acciones y, al expandirla, su
 * cartilla de vacunación e historial de diagnósticos.
 * Componente de presentación: no llama a la API, solo emite eventos.
 */
@Component({
  selector: 'app-pet-card',
  templateUrl: './pet-card.html',
  styleUrls: ['./pet-card.scss'],
  standalone: true,
  imports: [IonicModule, TitleCasePipe, VaccinationBadgeComponent, PetVaccinationsComponent, PetDiagnosisHistoryComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.background-color]': 'color()' },
})
export class PetCardComponent {
  readonly pet = input.required<Pet>();
  readonly color = input<string>('transparent');
  readonly imageUrl = input<string | undefined>(undefined);
  readonly vaccinationBadge = input<VaccinationStatus | null>(null);
  readonly expanded = input(false);
  readonly vaccinations = input<Vaccination[]>([]);
  readonly history = input<DiagnosisHistoryEntry[]>([]);
  readonly loadingHistory = input(false);

  readonly toggleExpand = output<void>();
  readonly edit = output<void>();
  readonly remove = output<void>();
  readonly addVaccination = output<void>();
  readonly removeVaccination = output<Vaccination>();
  readonly imageError = output<void>();

  protected readonly avatar = computed(() => this.imageUrl() || DEFAULT_IMAGES[this.pet().especie]);
  protected readonly detailsId = computed(() => `pet-details-${this.pet().id}`);
  protected readonly subtitle = computed(() => {
    const { raza, peso_kg } = this.pet();
    return [raza, peso_kg ? `${peso_kg} kg` : null].filter(Boolean).join(' · ');
  });
}
