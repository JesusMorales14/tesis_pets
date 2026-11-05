import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CLINIC } from '@core/constants/clinic';
import { getDiseaseInfo } from '@core/data/disease-info.data';
import { DISEASES } from '@core/data/diseases.data';
import { DiseaseInfo } from '@core/models/disease-info';
import { PredictionResult } from '@core/models/prediction';
import { DiagnosisFlowService, SelectedSymptom } from '@core/services/diagnosis-flow';
import { PageToolbarComponent } from '@shared/components/page-toolbar/page-toolbar';
import { ThemeToggleFabComponent } from '@shared/components/theme-toggle-fab/theme-toggle-fab';
import { DiagnosisLabelPipe } from '@shared/pipes';
import { AlertBannerComponent } from './components/alert-banner/alert-banner';
import { AppointmentCtaComponent } from './components/appointment-cta/appointment-cta';
import { InfoListCardComponent } from './components/info-list-card/info-list-card';
import { ReportedSymptomsComponent } from './components/reported-symptoms/reported-symptoms';
import { ResultHeroComponent } from './components/result-hero/result-hero';

const CARE_LEVELS = {
  bajo: { label: 'Bajo', icon: 'checkmark-circle-outline' },
  medio: { label: 'Moderado', icon: 'alert-circle-outline' },
  alto: { label: 'Alto', icon: 'warning-outline' },
  critico: { label: 'Crítico', icon: 'skull-outline' },
} as const;

const LOW_CONFIDENCE_PERCENT = 50;
const toPercent = (p: number | null | undefined) => Math.round((p ?? 0) * 100);

/** Resultado del diagnóstico de IA con recomendaciones de cuidado (contenedor). */
@Component({
  selector: 'app-diagnostic-result',
  templateUrl: './diagnostic-result.html',
  styleUrls: ['./diagnostic-result.scss'],
  standalone: true,
  imports: [
    IonicModule,
    DiagnosisLabelPipe,
    PageToolbarComponent,
    ThemeToggleFabComponent,
    ResultHeroComponent,
    AlertBannerComponent,
    InfoListCardComponent,
    ReportedSymptomsComponent,
    AppointmentCtaComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagnosticResultComponent {
  private readonly router = inject(Router);
  private readonly flow = inject(DiagnosisFlowService);

  protected readonly clinicPhone = CLINIC.phoneHref;
  protected readonly todayLabel = new Date().toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  protected readonly result = signal<PredictionResult | null>(null);
  protected readonly symptoms = signal<SelectedSymptom[]>([]);
  protected readonly especie = signal<'perro' | 'gato'>('perro');
  protected readonly petNombre = signal<string | null>(null);

  protected readonly diseaseInfo = computed<DiseaseInfo | null>(() => {
    const r = this.result();
    if (!r) return null;
    return getDiseaseInfo(r.diagnostico, DISEASES.find((d) => d.id === r.diagnostico));
  });
  protected readonly careLevel = computed(() => CARE_LEVELS[this.diseaseInfo()?.nivelCuidado ?? 'medio']);
  protected readonly urgent = computed(() => !!this.diseaseInfo()?.requiereAtencionInmediata);

  protected readonly percent = computed(() => toPercent(this.result()?.probabilidad));
  protected readonly altPercent = computed(() => toPercent(this.result()?.probabilidad_alternativa));
  protected readonly thirdPercent = computed(() => toPercent(this.result()?.probabilidad_tercero));
  protected readonly hasDifferential = computed(() => !!this.result()?.diagnostico_alternativo);
  // Sin un segundo diagnóstico cercano pero con probabilidad baja, el
  // usuario podría leer el resultado como más certero de lo que es.
  protected readonly lowConfidence = computed(
    () => !this.hasDifferential() && this.percent() < LOW_CONFIDENCE_PERCENT,
  );

  protected readonly backLink = computed(
    () => `/symptoms-selection/${this.especie() === 'gato' ? 'felino' : 'canino'}`,
  );

  // Ionic reutiliza esta página desde su caché: el resultado se relee en
  // cada entrada (p. ej. al repetir la predicción).
  ionViewWillEnter(): void {
    const state = this.flow.state;
    const result = state?.result ?? null;
    if (!result) {
      void this.router.navigate(['/tabs/tab2']);
      return;
    }
    this.result.set(result);
    this.symptoms.set(state?.selectedSymptoms ?? []);
    this.especie.set(state?.especie ?? 'perro');
    this.petNombre.set(result.mascota ?? state?.petNombre ?? null);
  }

  // PDF vía el diálogo de impresión del navegador ("Guardar como PDF"): sin
  // dependencias y el usuario elige el destino. El CSS @media print oculta
  // la navegación y deja solo el contenido clínico.
  protected exportPdf(): void {
    window.print();
  }
}
