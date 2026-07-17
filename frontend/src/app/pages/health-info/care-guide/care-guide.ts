import { Component, Input } from '@angular/core';

import { IonicModule } from '@ionic/angular';
import { CareSection } from '../disease-data';

@Component({
  selector: 'app-care-guide',
  templateUrl: './care-guide.html',
  styleUrls: ['./care-guide.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class CareGuideComponent {
  @Input() sections: CareSection[] = [];

  speciesFilter: 'ambos' | 'perro' | 'gato' = 'ambos';

  get filtered(): CareSection[] {
    return this.sections.filter(
      (s) =>
        this.speciesFilter === 'ambos' ||
        s.species === 'ambos' ||
        s.species === this.speciesFilter,
    );
  }
}
