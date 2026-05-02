import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Disease, DISEASES, CARE_GUIDE } from './disease-data';
import { DiseaseListComponent } from './disease-list/disease-list.component';
import { DiseaseDetailComponent } from './disease-detail/disease-detail.component';
import { CareGuideComponent } from './care-guide/care-guide.component';

@Component({
  selector: 'app-health-info',
  templateUrl: './health-info.component.html',
  styleUrls: ['./health-info.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, DiseaseListComponent, DiseaseDetailComponent, CareGuideComponent],
})
export class HealthInfoComponent {
  @Output() viewChange = new EventEmitter<{ view: 'list' | 'detail'; diseaseName?: string }>();

  view: 'list' | 'detail' = 'list';
  mode: 'enfermedades' | 'cuidados' = 'enfermedades';
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
