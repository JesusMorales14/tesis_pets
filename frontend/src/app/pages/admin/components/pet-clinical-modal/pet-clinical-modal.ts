import { ChangeDetectionStrategy, Component, OnInit, inject, input, output, signal } from '@angular/core';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { PetClinicalRecord, Vaccination } from '@core/models/pet';
import { AppointmentService } from '@core/services/appointment';
import { formatShortDate } from '@core/utils/date';
import { formatPetAge } from '@core/utils/pet-age';
import { vaccinationStatus } from '@core/utils/vaccination-status';
import { SeverityBadgeComponent } from '@shared/components/severity-badge/severity-badge';
import { VaccinationBadgeComponent } from '@shared/components/vaccination-badge/vaccination-badge';
import { AppDatePipe, DiagnosisLabelPipe } from '@shared/pipes';

/**
 * Ficha clínica de la mascota de una cita, para que el veterinario prepare
 * la consulta: datos del paciente, cartilla de vacunación con semáforo e
 * historial de diagnósticos previos.
 */
@Component({
  selector: 'app-pet-clinical-modal',
  templateUrl: './pet-clinical-modal.html',
  styleUrls: ['./pet-clinical-modal.scss'],
  standalone: true,
  imports: [
    IonicModule,
    TitleCasePipe,
    DecimalPipe,
    AppDatePipe,
    DiagnosisLabelPipe,
    VaccinationBadgeComponent,
    SeverityBadgeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetClinicalModalComponent implements OnInit {
  private readonly appointmentApi = inject(AppointmentService);

  readonly petId = input.required<number>();
  readonly closeModalEvent = output<void>();

  protected readonly record = signal<PetClinicalRecord | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly errorMsg = signal('');

  protected readonly statusOf = vaccinationStatus;
  protected readonly formatAge = formatPetAge;

  ngOnInit(): void {
    this.appointmentApi.getPetClinicalRecord(this.petId()).subscribe({
      next: (r) => {
        this.record.set(r);
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.errorMsg.set(err.status === 404 ? 'La mascota ya no está registrada.' : 'No se pudo cargar la ficha clínica.');
      },
    });
  }

  protected close(): void {
    this.closeModalEvent.emit();
  }

  protected vaccineDates(v: Vaccination): string {
    const fmt = (d: string | null | undefined) => (d ? formatShortDate(d) : '—');
    if (v.estado === 'programada') return `Programada para ${fmt(v.fecha_programada)}`;
    const aplicada = `Aplicada ${fmt(v.fecha_aplicacion)}`;
    return v.fecha_proxima ? `${aplicada} · Refuerzo ${fmt(v.fecha_proxima)}` : aplicada;
  }
}
