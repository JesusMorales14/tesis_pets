import { Component, OnInit, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AppointmentService } from '@core/services/appointment';
import { PetClinicalRecord, Vaccination } from '@core/models/pet';
import { vaccinationStatus, vaccinationStatusLabel } from '@core/utils/vaccination-status';

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

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
  imports: [IonicModule, CommonModule],
})
export class PetClinicalModalComponent implements OnInit {
  private appointmentService = inject(AppointmentService);

  petId = input.required<number>();
  closeModalEvent = output<void>();

  record: PetClinicalRecord | null = null;
  isLoading = true;
  errorMsg = '';

  readonly vaccinationStatus = vaccinationStatus;
  readonly vaccinationStatusLabel = vaccinationStatusLabel;

  ngOnInit() {
    this.appointmentService.getPetClinicalRecord(this.petId()).subscribe({
      next: (r) => { this.record = r; this.isLoading = false; },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err?.status === 404
          ? 'La mascota ya no está registrada.'
          : 'No se pudo cargar la ficha clínica.';
      },
    });
  }

  close() {
    this.closeModalEvent.emit();
  }

  /** 27 → "2 años y 3 meses" */
  formatEdad(meses: number | null | undefined): string {
    if (meses == null) return 'Sin dato';
    const anios = Math.floor(meses / 12);
    const resto = meses % 12;
    const partes = [];
    if (anios) partes.push(`${anios} ${anios === 1 ? 'año' : 'años'}`);
    if (resto || !anios) partes.push(`${resto} ${resto === 1 ? 'mes' : 'meses'}`);
    return partes.join(' y ');
  }

  /** 'YYYY-MM-DD' → "24 Oct 2026" (fecha local, sin desfase de zona horaria). */
  formatFecha(fecha: string | null | undefined): string {
    if (!fecha) return '—';
    const d = new Date(fecha + 'T00:00:00');
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }

  /** Marca de tiempo ISO (UTC) → fecha local. */
  formatFechaHora(iso: string): string {
    const d = new Date(iso);
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }

  vaccineDates(v: Vaccination): string {
    if (v.estado === 'programada') return `Programada para ${this.formatFecha(v.fecha_programada)}`;
    const aplicada = `Aplicada ${this.formatFecha(v.fecha_aplicacion)}`;
    return v.fecha_proxima ? `${aplicada} · Refuerzo ${this.formatFecha(v.fecha_proxima)}` : aplicada;
  }

  formatDiagnostico(d: string | null | undefined): string {
    return (d ?? '').replace(/_/g, ' ');
  }
}
