import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { PredictionResult } from '@core/services/prediction';
import { DiseaseInfo, getDiseaseInfo } from '@core/models/disease-info';
import { ThemeService } from '@core/services/theme';
import { BreakpointService } from '@core/services/breakpoint';

const SEVERITY_COLORS = { 1: 'leve', 2: 'moderado', 3: 'grave' };

const CARE_LEVEL_CONFIG = {
  bajo: { label: 'Bajo', icon: 'checkmark-circle-outline', color: '#2a7d3f' },
  medio: { label: 'Moderado', icon: 'alert-circle-outline', color: '#9b6200' },
  alto: { label: 'Alto', icon: 'warning-outline', color: '#c0392b' },
  critico: { label: 'Crítico', icon: 'skull-outline', color: '#7b0000' },
};

@Component({
  selector: 'app-diagnostic-result',
  templateUrl: './diagnostic-result.html',
  styleUrls: ['./diagnostic-result.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class DiagnosticResultComponent implements OnInit {
  private router = inject(Router);
  themeService = inject(ThemeService);
  breakpointService = inject(BreakpointService);

  result: PredictionResult | null = null;
  selectedSymptoms: Array<{ key: string; severity: number; label: string }> = [];
  especie = 'perro';
  petNombre: string | null = null;
  diseaseInfo: DiseaseInfo | null = null;

  readonly todayLabel = new Date().toLocaleDateString('es-PE', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  readonly careLevelConfig = CARE_LEVEL_CONFIG;

  toggleTheme() {
    this.themeService.toggle();
  }

  ngOnInit() {
    const state = history.state;

    this.result = state?.result ?? null;
    this.selectedSymptoms = state?.selectedSymptoms ?? [];
    this.especie = state?.especie ?? 'perro';
    this.petNombre = state?.petNombre ?? null;

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

  get savedToHistory(): boolean {
    return !!this.result?.guardado_en_historial;
  }

  get hasDifferential(): boolean {
    return !!this.result?.diagnostico_alternativo;
  }

  get hasThirdOption(): boolean {
    return !!this.result?.diagnostico_tercero;
  }

  getDiagnosticoTerceroLabel(): string {
    return (this.result?.diagnostico_tercero ?? '').replace(/_/g, ' ');
  }

  getProbabilidadTerceroPercent(): number {
    return Math.round((this.result?.probabilidad_tercero ?? 0) * 100);
  }

  // Cuando no hay un segundo diagnóstico cercano pero la probabilidad del
  // principal igual es baja, el banner de diferencial no se muestra y el
  // usuario podría leer el resultado como más certero de lo que es. Se
  // avisa aparte para no depender solo del diferencial.
  get hasLowConfidence(): boolean {
    return !this.hasDifferential && this.getProbabilityPercent() < 50;
  }

  getDiagnosticoAlternativoLabel(): string {
    return (this.result?.diagnostico_alternativo ?? '').replace(/_/g, ' ');
  }

  getProbabilidadAlternativaPercent(): number {
    return Math.round((this.result?.probabilidad_alternativa ?? 0) * 100);
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

  // Genera un PDF vía el diálogo "Guardar como PDF" de impresión del
  // navegador en vez de una librería de generación de PDF: sin dependencia
  // nueva, y el usuario controla el destino (imprimir o guardar) igual que
  // con cualquier documento. El CSS @media print de este componente oculta
  // la navegación y deja solo el contenido clínico relevante.
  exportPdf() {
    window.print();
  }

  goBack() {
    const param = this.especie === 'gato' ? 'felino' : 'canino';
    this.router.navigate(['/symptoms-selection/' + param]);
  }
}
