import { Component, ViewChild, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { ThemeService } from '@core/services/theme';
import { HealthInfoComponent } from '@pages/health-info/health-info';
import { HeaderComponent } from '@shared/components/header/header';

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.html',
  styleUrls: ['./tab3.scss'],
  standalone: true,
  imports: [IonicModule, HeaderComponent, HealthInfoComponent],
})
export class Tab3Page {
  themeService = inject(ThemeService);

  @ViewChild(HealthInfoComponent) private healthInfo?: HealthInfoComponent;

  currentView: 'list' | 'detail' = 'list';
  currentDiseaseName = '';

  onViewChange(event: { view: 'list' | 'detail'; diseaseName?: string }): void {
    this.currentView = event.view;
    this.currentDiseaseName = event.diseaseName ?? '';
  }

  goBackFromDetail(): void {
    this.healthInfo?.goBack();
  }
}
