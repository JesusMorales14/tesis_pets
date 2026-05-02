import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

export interface AnimalCard {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  color: string;
  gradient: string;
  imagePlaceholder: string;
  imageUrl: string;
}

@Component({
  selector: 'app-animal-card',
  templateUrl: './animal-card.component.html',
  styleUrls: ['./animal-card.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class AnimalCardComponent {
  @Input() animal!: AnimalCard;
  @Input() isSelected: boolean = false;
  @Output() selected = new EventEmitter<AnimalCard>();
  @Output() navigate = new EventEmitter<AnimalCard>();

  onSelect() {
    this.selected.emit(this.animal);
  }

  onNavigate() {
    this.selected.emit(this.animal);
    this.navigate.emit(this.animal);
  }
}
