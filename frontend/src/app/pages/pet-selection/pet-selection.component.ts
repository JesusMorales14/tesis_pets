import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  AnimalCardComponent,
  AnimalCard,
} from './animal-card/animal-card.component';
import { PredictTodayComponent } from './predict-today/predict-today.component';

@Component({
  selector: 'app-pet-selection',
  templateUrl: './pet-selection.component.html',
  styleUrls: ['./pet-selection.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    AnimalCardComponent,
    PredictTodayComponent,
  ],
})
export class PetSelectionComponent {
  selectedAnimal: AnimalCard | null = null;

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

  constructor(private router: Router) {}

  selectAnimal(animal: AnimalCard) {
    this.selectedAnimal = animal;
  }

  navigateToDetail(animal: AnimalCard) {
    this.selectedAnimal = animal;
    this.router.navigate(['/symptoms-selection', animal.id]);
  }
}
