import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';

import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import {
  AnimalCardComponent,
  AnimalCard,
} from './animal-card/animal-card';
import { PredictTodayComponent } from './predict-today/predict-today';
import { PetFormModalComponent } from './pet-form-modal/pet-form-modal';
import { AuthService } from '@core/services/auth';
import { PetService } from '@core/services/pet';
import { Pet, PetBody } from '@core/models/pet';

@Component({
  selector: 'app-pet-selection',
  templateUrl: './pet-selection.html',
  styleUrls: ['./pet-selection.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    AnimalCardComponent,
    PredictTodayComponent
],
})
export class PetSelectionComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private modalCtrl = inject(ModalController);
  auth = inject(AuthService);
  private petService = inject(PetService);

  private navSubscription?: Subscription;

  selectedAnimal: AnimalCard | null = null;

  myPets: Pet[] = [];
  isLoadingPets = false;

  canino: AnimalCard = {
    id: 'canino',
    name: 'Canino',
    subtitle: 'Perro',
    icon: 'paw-outline',
    color: 'blue',
    gradient: 'linear-gradient(135deg, #2f6df6 0%, #185fa5 100%)',
    imagePlaceholder: '',
    imageUrl: 'assets/img/dog.jpg',
  };

  felino: AnimalCard = {
    id: 'felino',
    name: 'Felino',
    subtitle: 'Gato',
    icon: 'paw-outline',
    color: 'teal',
    gradient: 'linear-gradient(135deg, #0f6e56 0%, #0a4d3c 100%)',
    imagePlaceholder: '',
    imageUrl: 'assets/img/cat.jpg',
  };

  // Esta pestaña vive dentro de <ion-tabs>, cuyo propio outlet nunca se
  // entera cuando el usuario sale a una ruta fuera de las pestañas (p. ej.
  // "Mi cuenta", que vive en el outlet superior del app-shell) y vuelve —
  // por eso ionViewWillEnter no sirve aquí. Se escuchan directamente los
  // NavigationEnd del router, que sí se disparan siempre que la URL
  // vuelve a esta pestaña, sin importar el reuso de componentes de Ionic.
  ngOnInit() {
    if (this.auth.isLoggedIn) {
      this.loadPets();
    }
    this.navSubscription = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        if (this.auth.isLoggedIn && e.urlAfterRedirects.startsWith('/tabs/tab2')) {
          this.loadPets();
        }
      });
  }

  ngOnDestroy() {
    this.navSubscription?.unsubscribe();
  }

  loadPets() {
    this.isLoadingPets = true;
    this.petService.getPets().subscribe({
      next: (pets) => { this.myPets = pets; this.isLoadingPets = false; },
      error: () => { this.isLoadingPets = false; },
    });
  }

  selectAnimal(animal: AnimalCard) {
    this.selectedAnimal = animal;
  }

  navigateToDetail(animal: AnimalCard) {
    this.selectedAnimal = animal;
    this.router.navigate(['/symptoms-selection', animal.id]);
  }

  selectPet(pet: Pet) {
    const especieParam = pet.especie === 'gato' ? 'felino' : 'canino';
    this.router.navigate(['/symptoms-selection', especieParam], {
      state: { petId: pet.id, petNombre: pet.nombre },
    });
  }

  async openAddPetModal() {
    const modal = await this.modalCtrl.create({
      component: PetFormModalComponent,
      cssClass: 'pet-form-modal',
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data) {
      this.petService.createPet(data as PetBody).subscribe({
        next: () => this.loadPets(),
      });
    }
  }

  petIcon(pet: Pet): string {
    return pet.especie === 'gato' ? 'assets/img/cat.jpg' : 'assets/img/dog.jpg';
  }
}
