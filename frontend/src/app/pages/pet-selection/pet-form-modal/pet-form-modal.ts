import { Component, Input, OnInit, inject } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Pet, PetBody } from '@core/models/pet';

@Component({
  selector: 'app-pet-form-modal',
  templateUrl: './pet-form-modal.html',
  styleUrls: ['./pet-form-modal.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule],
})
export class PetFormModalComponent implements OnInit {
  private modalCtrl = inject(ModalController);

  // Ionic's ModalController asigna componentProps por asignación directa de
  // propiedad al crear el componente, no vía template binding — por eso se
  // usa @Input() clásico y no un signal input() (ver symptom-picker, mismo
  // problema ya documentado ahí).
  @Input() pet: Pet | null = null;

  nombre = '';
  especie: 'perro' | 'gato' = 'perro';
  raza = '';
  edadMeses: number | null = null;
  pesoKg: number | null = null;
  error = '';

  get isEditMode(): boolean {
    return !!this.pet;
  }

  ngOnInit() {
    if (this.pet) {
      this.nombre = this.pet.nombre;
      this.especie = this.pet.especie;
      this.raza = this.pet.raza ?? '';
      this.edadMeses = this.pet.edad_meses ?? null;
      this.pesoKg = this.pet.peso_kg ?? null;
    }
  }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    if (!this.nombre.trim()) {
      this.error = 'Ponle un nombre a tu mascota.';
      return;
    }
    const body: PetBody = {
      nombre: this.nombre.trim(),
      especie: this.especie,
      raza: this.raza.trim() || null,
      edad_meses: this.edadMeses,
      peso_kg: this.pesoKg,
    };
    this.modalCtrl.dismiss(body, 'confirm');
  }
}
