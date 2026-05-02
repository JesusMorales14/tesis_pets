import { Component, ViewChild } from '@angular/core';
import { ThemeService } from '../services/theme.service';
import { HealthInfoComponent } from '../pages/health-info/health-info.component';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {
  @ViewChild(HealthInfoComponent) private healthInfo?: HealthInfoComponent;

  currentView: 'list' | 'detail' = 'list';
  currentDiseaseName = '';

  constructor(public themeService: ThemeService) {}

  onViewChange(event: { view: 'list' | 'detail'; diseaseName?: string }): void {
    this.currentView = event.view;
    this.currentDiseaseName = event.diseaseName ?? '';
  }

  goBackFromDetail(): void {
    this.healthInfo?.goBack();
  }
}
