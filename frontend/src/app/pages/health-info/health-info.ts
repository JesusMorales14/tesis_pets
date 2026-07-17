import { Component, EventEmitter, Output } from '@angular/core';

import { IonicModule } from '@ionic/angular';
import { Disease, DISEASES, CARE_GUIDE } from './disease-data';
import { DiseaseListComponent } from './disease-list/disease-list';
import { DiseaseDetailComponent } from './disease-detail/disease-detail';
import { CareGuideComponent } from './care-guide/care-guide';
import { EmergencyGuideComponent } from './emergency-guide/emergency-guide';

@Component({
  selector: 'app-health-info',
  templateUrl: './health-info.html',
  styleUrls: ['./health-info.scss'],
  standalone: true,
  imports: [
    IonicModule,
    DiseaseListComponent,
    DiseaseDetailComponent,
    CareGuideComponent,
    EmergencyGuideComponent
],
})
export class HealthInfoComponent {
  @Output() viewChange = new EventEmitter<{ view: 'list' | 'detail'; diseaseName?: string }>();

  view: 'list' | 'detail' = 'list';
  mode: 'enfermedades' | 'cuidados' | 'emergencias' = 'enfermedades';
  selectedDisease: Disease | null = null;

  readonly allDiseases = DISEASES;
  readonly careGuide = CARE_GUIDE;

  onDiseaseSelected(disease: Disease): void {
    this.selectedDisease = disease;
    this.view = 'detail';
    this.viewChange.emit({ view: 'detail', diseaseName: disease.displayName });
  }

  goBack(): void {
    this.view = 'list';
    this.selectedDisease = null;
    this.viewChange.emit({ view: 'list' });
  }
}
