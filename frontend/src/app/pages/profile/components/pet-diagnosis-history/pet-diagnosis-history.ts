import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { DiagnosisHistoryEntry } from '@core/models/pet';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state';
import { AppDatePipe, DiagnosisLabelPipe } from '@shared/pipes';

/** Historial de diagnósticos de IA de una mascota. */
@Component({
  selector: 'app-pet-diagnosis-history',
  templateUrl: './pet-diagnosis-history.html',
  styleUrls: ['./pet-diagnosis-history.scss'],
  standalone: true,
  imports: [IonicModule, DecimalPipe, AppDatePipe, DiagnosisLabelPipe, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetDiagnosisHistoryComponent {
  readonly petName = input.required<string>();
  readonly entries = input<DiagnosisHistoryEntry[]>([]);
  readonly loading = input(false);
}
