import { Component, Input, OnInit, inject } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { PetService } from '@core/services/pet';
import { VaccinationBody, VaccineScheduleEntry, VaccinationEstado } from '@core/models/pet';
import { toLocalIsoDate } from '@core/utils/date';

const CUSTOM_OPTION = '__custom__';

@Component({
  selector: 'app-vaccination-form-modal',
  templateUrl: './vaccination-form-modal.html',
  styleUrls: ['./vaccination-form-modal.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule],
})
export class VaccinationFormModalComponent implements OnInit {
  private modalCtrl = inject(ModalController);
  private petService = inject(PetService);

  @Input() especie: 'perro' | 'gato' = 'perro';

  schedule: VaccineScheduleEntry[] = [];
  selectedOption: string = '';
  customNombre = '';
  fechaAplicacion = '';
  fechaProgramada = '';
  notas = '';
  error = '';

  // Paso actual: 1 = elegir estado, 2 = formulario según estado
  step = 1;
  estadoSeleccionado: VaccinationEstado = 'aplicada';

  readonly customOptionValue = CUSTOM_OPTION;
  // Límite del calendario: una vacuna aplicada no puede tener fecha futura
  // y una programada no puede tener fecha pasada.
  readonly today = toLocalIsoDate(new Date());

  ngOnInit() {
    this.petService.getVaccineSchedule(this.especie).subscribe({
      next: (entries) => { this.schedule = entries; },
    });
  }

  get isCustom(): boolean {
    return this.selectedOption === CUSTOM_OPTION;
  }

  get isAplicada(): boolean {
    return this.estadoSeleccionado === 'aplicada';
  }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  // Paso 1: Elegir tipo de vacuna
  selectEstado(estado: VaccinationEstado) {
    this.estadoSeleccionado = estado;
    this.step = 2;
    this.error = '';
  }

  // Volver al paso 1
  backToStep1() {
    this.step = 1;
    this.error = '';
  }

  confirm() {
    const nombre = this.isCustom ? this.customNombre.trim() : this.selectedOption;
    if (!nombre) {
      this.error = 'Selecciona o escribe el nombre de la vacuna.';
      return;
    }

    let refuerzoMeses: number | null = null;
    let fechaAplicacion: string | null = null;
    let fechaProgramada: string | null = null;

    if (this.isAplicada) {
      if (!this.fechaAplicacion) {
        this.error = 'Indica la fecha en que se aplicó la vacuna.';
        return;
      }
      if (this.fechaAplicacion > this.today) {
        this.error = 'La fecha de aplicación no puede ser posterior a hoy. Si aún no se aplica, regístrala como "Vacuna Programada".';
        return;
      }
      fechaAplicacion = this.fechaAplicacion;
      const matched = this.schedule.find((s) => s.nombre === this.selectedOption);
      refuerzoMeses = matched?.refuerzo_meses ?? (this.isCustom ? 12 : null);
    } else {
      // Programada
      if (!this.fechaProgramada) {
        this.error = 'Indica la fecha programada para la vacuna.';
        return;
      }
      if (this.fechaProgramada < this.today) {
        this.error = 'La fecha programada no puede ser anterior a hoy. Si ya se aplicó, regístrala como "Vacuna Realizada".';
        return;
      }
      fechaProgramada = this.fechaProgramada;
      const matched = this.schedule.find((s) => s.nombre === this.selectedOption);
      refuerzoMeses = matched?.refuerzo_meses ?? (this.isCustom ? 12 : null);
    }

    if (!refuerzoMeses || refuerzoMeses < 1) {
      this.error = 'Indica cada cuántos meses se refuerza (ej: 12 para anual).';
      return;
    }

    const body: VaccinationBody = {
      nombre,
      estado: this.estadoSeleccionado,
      fecha_aplicacion: fechaAplicacion,
      fecha_programada: fechaProgramada,
      refuerzo_meses: refuerzoMeses,
      notas: this.notas.trim() || null,
    };
    this.modalCtrl.dismiss(body, 'confirm');
  }
}
