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
import { PetImageService } from '@core/services/pet-image';
import { DiagnosisFlowService } from '@core/services/diagnosis-flow';
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
  private flow = inject(DiagnosisFlowService);

  private navSubscription?: Subscription;
  private authSub?: Subscription;

  selectedAnimal: AnimalCard | null = null;

  myPets: Pet[] = [];
  isLoadingPets = false;
  petImages: Record<number, string> = {};

  private petImageService = inject(PetImageService);

  async loadPetImages(pets: Pet[]) {
    for (const pet of pets) {
      const url = await this.petImageService.imageFor(pet);
      this.petImages = { ...this.petImages, [pet.id]: url };
    }
  }

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
    // Suscribirse a cambios de autenticación para limpiar/recargar datos
    this.authSub = this.auth.user$.subscribe((user) => {
      if (user) {
        this.loadPets();
      } else {
        this.clearPetData();
      }
    });

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
    this.authSub?.unsubscribe();
  }

  private clearPetData() {
    this.myPets = [];
    this.petImages = {};
    this.isLoadingPets = false;
  }

  loadPets() {
    this.isLoadingPets = true;
    this.petService.getPets().subscribe({
      next: (pets) => {
        this.myPets = pets;
        this.isLoadingPets = false;
        // Las imágenes van por id: se reinician para que una mascota nueva
        // nunca muestre la foto de una eliminada.
        this.petImages = {};
        console.log('[PetSelection] Mascotas cargadas:', pets.length);
        this.loadPetImages(pets);
      },
      error: (err) => { 
        this.isLoadingPets = false; 
        console.error('[PetSelection] Error cargando mascotas:', err);
      },
    });
  }

  selectAnimal(animal: AnimalCard) {
    this.selectedAnimal = animal;
  }

  // Consulta rápida por especie: no se asocia a ninguna mascota, así que
  // el diagnóstico no queda guardado en ningún historial.
  navigateToDetail(animal: AnimalCard) {
    this.selectedAnimal = animal;
    this.flow.start(animal.id === 'felino' ? 'gato' : 'perro', this.auth.currentUser?.id ?? null);
    this.router.navigate(['/symptoms-selection', animal.id]);
  }

  selectPet(pet: Pet) {
    this.flow.start(pet.especie, this.auth.currentUser?.id ?? null, pet);
    this.router.navigate(['/symptoms-selection', pet.especie === 'gato' ? 'felino' : 'canino']);
  }

  onPetImageError(pet: Pet) {
    this.petImages = { ...this.petImages, [pet.id]: this.petIcon(pet) };
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
        next: () => {
          this.loadPets();
          this.showToast('Mascota agregada correctamente');
        },
        error: (err) => {
          console.error('Error creating pet:', err);
          this.showToast('Error al crear la mascota', true);
        },
      });
    }
  }

  petIcon(pet: Pet): string {
    return pet.especie === 'gato' ? 'assets/img/cat.jpg' : 'assets/img/dog.jpg';
  }

  private showToast(message: string, isError = false) {
    const toast = document.createElement('ion-toast');
    toast.message = message;
    toast.duration = 2500;
    toast.color = isError ? 'danger' : 'success';
    toast.position = 'bottom';
    toast.buttons = [{ text: 'OK', role: 'cancel' }];
    document.body.appendChild(toast);
    toast.present();
  }
}
