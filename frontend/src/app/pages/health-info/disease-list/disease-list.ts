import { Component, EventEmitter, Input, Output } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Disease, Species } from '../disease-data';
import { PaginationComponent } from '@shared/components/pagination/pagination';

@Component({
  selector: 'app-disease-list',
  templateUrl: './disease-list.html',
  styleUrls: ['./disease-list.scss'],
  standalone: true,
  imports: [FormsModule, IonicModule, PaginationComponent],
})
export class DiseaseListComponent {
  @Input() diseases: Disease[] = [];
  @Output() diseaseSelected = new EventEmitter<Disease>();

  readonly pageSize = 9;
  page = 1;

  private _searchTerm = '';
  get searchTerm(): string { return this._searchTerm; }
  set searchTerm(value: string) { this._searchTerm = value; this.page = 1; }

  private _speciesFilter: 'todos' | Species = 'todos';
  get speciesFilter(): 'todos' | Species { return this._speciesFilter; }
  set speciesFilter(value: 'todos' | Species) { this._speciesFilter = value; this.page = 1; }

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

  get paged(): Disease[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
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
