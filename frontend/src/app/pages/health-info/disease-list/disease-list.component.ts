import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Disease, Species } from '../disease-data';

@Component({
  selector: 'app-disease-list',
  templateUrl: './disease-list.component.html',
  styleUrls: ['./disease-list.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class DiseaseListComponent {
  @Input() diseases: Disease[] = [];
  @Output() diseaseSelected = new EventEmitter<Disease>();

  searchTerm = '';
  speciesFilter: 'todos' | Species = 'todos';

  get filtered(): Disease[] {
    return this.diseases.filter((d) => {
      const matchesSpecies =
        this.speciesFilter === 'todos' ||
        d.species === this.speciesFilter ||
        d.species === 'ambos';

      const term = this.searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        d.displayName.toLowerCase().includes(term) ||
        d.categoryLabel.toLowerCase().includes(term) ||
        d.shortDescription.toLowerCase().includes(term);

      return matchesSpecies && matchesSearch;
    });
  }

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
      ambos: 'Ambos',
    };
    return map[species];
  }
}
