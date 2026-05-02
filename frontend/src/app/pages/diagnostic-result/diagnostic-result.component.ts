import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { PredictionResult } from '../../services/prediction-service';
import { DiseaseInfo, getDiseaseInfo } from '../../models/disease-info.model';
import { ThemeService } from '../../services/theme.service';

const SEVERITY_COLORS = { 1: 'leve', 2: 'moderado', 3: 'grave' };

const CARE_LEVEL_CONFIG = {
  bajo: { label: 'Bajo', icon: 'checkmark-circle-outline', color: '#2a7d3f' },
  medio: { label: 'Moderado', icon: 'alert-circle-outline', color: '#9b6200' },
  alto: { label: 'Alto', icon: 'warning-outline', color: '#c0392b' },
  critico: { label: 'Crítico', icon: 'skull-outline', color: '#7b0000' },
};

@Component({
  selector: 'app-diagnostic-result',
  templateUrl: './diagnostic-result.component.html',
  styleUrls: ['./diagnostic-result.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class DiagnosticResultComponent implements OnInit {
  result: PredictionResult | null = null;
  selectedSymptoms: Array<{ key: string; severity: number; label: string }> = [];
  especie = 'perro';
  diseaseInfo: DiseaseInfo | null = null;

  readonly careLevelConfig = CARE_LEVEL_CONFIG;

  constructor(
    private router: Router,
    public themeService: ThemeService,
  ) {}

  toggleTheme() {
    this.themeService.toggle();
  }

  ngOnInit() {
    const state = history.state;

    this.result = state?.result ?? null;
    this.selectedSymptoms = state?.selectedSymptoms ?? [];
    this.especie = state?.especie ?? 'perro';

    if (!this.result) {
      this.router.navigate(['/tabs/tab2']);
      return;
    }

    this.diseaseInfo = getDiseaseInfo(this.result.diagnostico);
  }

  getProbabilityPercent(): number {
    return Math.round((this.result?.probabilidad ?? 0) * 100);
  }

  getDiagnosticoLabel(): string {
    return (this.result?.diagnostico ?? '').replace(/_/g, ' ');
  }

  getSeverityLabel(value: number): string {
    return (['', 'Leve', 'Moderado', 'Grave'])[value] ?? '';
  }

  getSeverityClass(value: number): string {
    return (SEVERITY_COLORS as any)[value] ?? '';
  }

  getSeverityIcon(value: number): string {
    const icons = { 1: 'remove-circle-outline', 2: 'alert-circle-outline', 3: 'warning-outline' };
    return (icons as any)[value] ?? 'ellipse-outline';
  }

  getGravedadIcon(): string {
    const map = { leve: 'checkmark-circle', moderada: 'alert-circle', grave: 'warning' };
    return (map as any)[this.result?.gravedad ?? ''] ?? 'information-circle';
  }

  getCareLevel() {
    return this.careLevelConfig[this.diseaseInfo?.nivelCuidado ?? 'medio'];
  }

  goToSchedule() {
    this.router.navigate(['/schedule'], {
      state: { result: this.result, especie: this.especie },
    });
  }

  goBack() {
    const param = this.especie === 'gato' ? 'felino' : 'canino';
    this.router.navigate(['/symptoms-selection/' + param]);
  }
}
