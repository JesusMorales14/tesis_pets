import { Component, EventEmitter, Output } from '@angular/core';

import { IonicModule } from '@ionic/angular';
import { Disease } from '@core/models/disease';
import { CARE_GUIDE, DISEASES } from '@core/data/diseases.data';
import { DiseaseListComponent } from './components/disease-list/disease-list';
import { DiseaseDetailComponent } from './components/disease-detail/disease-detail';
import { CareGuideComponent } from './components/care-guide/care-guide';
import { EmergencyGuideComponent } from './components/emergency-guide/emergency-guide';

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
