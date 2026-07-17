import { Component, Input, OnInit, inject } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { PetService } from '@core/services/pet';
import { VaccinationBody, VaccineScheduleEntry } from '@core/models/pet';

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

  // Ver symptom-picker/pet-form-modal: ModalController asigna
  // componentProps por propiedad directa, no funciona con input() signal.
  @Input() especie: 'perro' | 'gato' = 'perro';

  schedule: VaccineScheduleEntry[] = [];
  selectedOption: string = '';
  customNombre = '';
  fechaAplicacion = '';
  notas = '';
  error = '';

  readonly customOptionValue = CUSTOM_OPTION;

  ngOnInit() {
    this.petService.getVaccineSchedule(this.especie).subscribe({
      next: (entries) => { this.schedule = entries; },
    });
  }

  get isCustom(): boolean {
    return this.selectedOption === CUSTOM_OPTION;
  }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    const nombre = this.isCustom ? this.customNombre.trim() : this.selectedOption;
    if (!nombre) {
      this.error = 'Selecciona o escribe el nombre de la vacuna.';
      return;
    }
    if (!this.fechaAplicacion) {
      this.error = 'Indica la fecha en que se aplicó.';
      return;
    }
    const matched = this.schedule.find((s) => s.nombre === this.selectedOption);
    const body: VaccinationBody = {
      nombre,
      fecha_aplicacion: this.fechaAplicacion,
      refuerzo_meses: matched?.refuerzo_meses ?? null,
      notas: this.notas.trim() || null,
    };
    this.modalCtrl.dismiss(body, 'confirm');
  }
}
