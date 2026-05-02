import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Disease, Species } from '../disease-data';

@Component({
  selector: 'app-disease-detail',
  templateUrl: './disease-detail.component.html',
  styleUrls: ['./disease-detail.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class DiseaseDetailComponent {
  @Input() disease!: Disease;

  activeSegment = 'descripcion';

  urgencyLabel(urgency: string): string {
    const map: Record<string, string> = {
      baja: 'Leve',
      media: 'Moderada',
      alta: 'Alta',
      critica: 'Crítica',
    };
    return map[urgency] ?? urgency;
  }

  speciesLabel(species: Species): string {
    const map: Record<Species, string> = {
      perro: 'Perro',
      gato: 'Gato',
      ambos: 'Perro y Gato',
    };
    return map[species];
  }
}
