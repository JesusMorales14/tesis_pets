import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { SYMPTOM_GROUPS } from '@core/data/symptoms.data';
import { PredictionRequest } from '@core/models/prediction';
import { Symptom, SymptomCategory } from '@core/models/symptom';
import { AuthService } from '@core/services/auth';
import { DiagnosisFlowService } from '@core/services/diagnosis-flow';
import { PredictionService } from '@core/services/prediction';
import { getApiErrorMessage } from '@core/utils/http-error';
import { PageToolbarComponent } from '@shared/components/page-toolbar/page-toolbar';
import { ThemeToggleFabComponent } from '@shared/components/theme-toggle-fab/theme-toggle-fab';
import {
  SelectedSymptomCardComponent,
  SeverityValue,
} from './components/selected-symptom-card/selected-symptom-card';
import { SpeciesHeroComponent } from './components/species-hero/species-hero';
import { SymptomPickerComponent } from './components/symptom-picker/symptom-picker';

interface SelectedItem {
  key: string;
  severity: SeverityValue;
  expanded: boolean;
}

type Especie = 'perro' | 'gato';

/** Síntomas de la especie, sin categorías vacías. */
function groupsFor(especie: Especie): SymptomCategory[] {
  return SYMPTOM_GROUPS.map((group) => ({
    ...group,
    symptoms: group.symptoms.filter((s) => s.species === 'both' || s.species === especie),
  })).filter((group) => group.symptoms.length > 0);
}

/** Selección de síntomas y su gravedad para la predicción de IA (contenedor). */
@Component({
  selector: 'app-symptoms-selection',
  templateUrl: './symptoms-selection.html',
  styleUrls: ['./symptoms-selection.scss'],
  standalone: true,
  imports: [IonicModule, PageToolbarComponent, ThemeToggleFabComponent, SpeciesHeroComponent, SelectedSymptomCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SymptomsSelectionComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly predictionApi = inject(PredictionService);
  private readonly modalCtrl = inject(ModalController);
  private readonly flow = inject(DiagnosisFlowService);
  private readonly auth = inject(AuthService);

  protected readonly especie = signal<Especie>('perro');
  protected readonly petId = signal<number | null>(null);
  protected readonly petNombre = signal<string | null>(null);
  protected readonly selected = signal<SelectedItem[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMsg = signal('');

  private symptomGroups: SymptomCategory[] = [];
  private symptomMap = new Map<string, Symptom>();

  protected readonly heroName = computed(() => this.petNombre() ?? (this.especie() === 'gato' ? 'Gato' : 'Perro'));
  protected readonly pendingCount = computed(() => this.selected().filter((s) => s.severity === 0).length);
  protected readonly canPredict = computed(() => this.selected().length > 0 && this.pendingCount() === 0);

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('especie') ?? 'canino';
    this.especie.set(param === 'felino' ? 'gato' : 'perro');
    this.symptomGroups = groupsFor(this.especie());
    this.symptomMap = new Map(this.symptomGroups.flatMap((g) => g.symptoms.map((s) => [s.key, s] as const)));
    this.syncPetFromFlow();
  }

  // Ionic reutiliza esta página desde su caché: la mascota se relee en cada entrada.
  ionViewWillEnter(): void {
    this.syncPetFromFlow();
  }

  protected labelFor(key: string): string {
    return this.symptomMap.get(key)?.label ?? key;
  }

  protected async openPicker(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: SymptomPickerComponent,
      cssClass: 'symptom-picker-modal',
      componentProps: { symptomGroups: this.symptomGroups, preselected: this.selected().map((s) => s.key) },
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss<string[]>();
    if (role === 'confirm' && Array.isArray(data)) this.syncSelected(data);
  }

  protected toggleExpand(key: string): void {
    this.updateItem(key, (item) => ({ ...item, expanded: !item.expanded }));
  }

  protected setSeverity(key: string, severity: SeverityValue): void {
    this.updateItem(key, (item) => ({ ...item, severity, expanded: false }));
  }

  protected remove(key: string): void {
    this.selected.update((list) => list.filter((s) => s.key !== key));
  }

  protected resetAll(): void {
    this.selected.set([]);
    this.errorMsg.set('');
  }

  protected predict(): void {
    if (!this.canPredict()) return;
    this.isLoading.set(true);
    this.errorMsg.set('');

    // El modelo espera todos los síntomas: 0 para los no reportados.
    const symptoms: Record<string, number> = Object.fromEntries([...this.symptomMap.keys()].map((k) => [k, 0]));
    this.selected().forEach((s) => (symptoms[s.key] = s.severity));
    const payload: PredictionRequest = { especie: this.especie(), pet_id: this.petId(), ...symptoms };

    this.predictionApi.predict(payload).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.flow.setResult(
          res,
          this.selected().map((s) => ({ key: s.key, severity: s.severity, label: this.labelFor(s.key) })),
        );
        void this.router.navigate(['/diagnostic-result']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMsg.set(getApiErrorMessage(err, 'Error al conectar con el servidor.'));
      },
    });
  }

  // La mascota elegida en la pestaña Diagnóstico. Si se entró directo por
  // URL o la especie no coincide, es una consulta rápida sin mascota.
  private syncPetFromFlow(): void {
    const userId = this.auth.currentUser?.id ?? null;
    if (!this.flow.state || this.flow.state.especie !== this.especie()) {
      this.flow.start(this.especie(), userId);
    }
    const petId = this.flow.petIdFor(userId);
    this.petId.set(petId);
    this.petNombre.set(petId ? (this.flow.state?.petNombre ?? null) : null);
  }

  /** Mantiene la gravedad ya definida de los síntomas que siguen elegidos. */
  private syncSelected(keys: string[]): void {
    const previous = new Map(this.selected().map((s) => [s.key, s.severity]));
    this.selected.set(keys.map((key) => ({ key, severity: previous.get(key) ?? 0, expanded: false })));
  }

  private updateItem(key: string, change: (item: SelectedItem) => SelectedItem): void {
    this.selected.update((list) => list.map((item) => (item.key === key ? change(item) : item)));
  }
}
