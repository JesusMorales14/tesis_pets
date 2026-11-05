import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';

import { FormsModule } from '@angular/forms';
import { PredictionService } from '@core/services/prediction';
import { PredictionRequest } from '@core/models/prediction';
import { ThemeService } from '@core/services/theme';
import { BreakpointService } from '@core/services/breakpoint';
import { SymptomCategory, Symptom } from '@core/models/symptom';
import { SYMPTOM_GROUPS } from '@core/data/symptoms.data';
import { SeverityGuide } from '@core/models/severity-guide';
import { getSeverityGuide as severityGuideFor } from '@core/data/severity-guides.data';
import { SymptomPickerComponent } from './symptom-picker/symptom-picker';
import { DiagnosisFlowService } from '@core/services/diagnosis-flow';
import { AuthService } from '@core/services/auth';

@Component({
  selector: 'app-symptoms-selection',
  templateUrl: './symptoms-selection.html',
  styleUrls: ['./symptoms-selection.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule],
})
export class SymptomsSelectionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private predictionService = inject(PredictionService);
  private modalCtrl = inject(ModalController);
  private flow = inject(DiagnosisFlowService);
  private auth = inject(AuthService);
  themeService = inject(ThemeService);
  breakpointService = inject(BreakpointService);

  especie: 'perro' | 'gato' = 'perro';
  especieLabel: string = 'Perro';
  petId: number | null = null;
  petNombre: string | null = null;

  symptomGroups: SymptomCategory[] = [];
  symptomMap: Record<string, Symptom> = {};

  // Síntomas que el usuario agregó: { key, severity (0-3), expanded }
  selectedSymptoms: Array<{
    key: string;
    severity: number;
    expanded: boolean;
  }> = [];

  isLoading = false;
  errorMsg: string = '';

  toggleTheme() {
    this.themeService.toggle();
  }

  ngOnInit() {
    const especieParam =
      this.route.snapshot.paramMap.get('especie') || 'canino';
    this.especie = especieParam === 'felino' ? 'gato' : 'perro';
    this.especieLabel = this.especie === 'gato' ? 'Gato' : 'Perro';

    this.syncPetFromFlow();

    // Filtrar síntomas según especie
    this.symptomGroups = SYMPTOM_GROUPS.map((group) => ({
      ...group,
      symptoms: group.symptoms.filter(
        (s) => s.species === 'both' || s.species === this.especie,
      ),
    })).filter((group) => group.symptoms.length > 0);

    // Mapa de búsqueda rápida por key
    this.symptomGroups.forEach((g) => {
      g.symptoms.forEach((s) => {
        this.symptomMap[s.key] = s;
      });
    });
  }

  // Ionic reutiliza esta página desde su caché al volver a ella, así que la
  // mascota se vuelve a leer en cada entrada y no solo en ngOnInit.
  ionViewWillEnter() {
    this.syncPetFromFlow();
  }

  // La mascota elegida en la pestaña Diagnóstico. Si se entró directo por
  // URL o la especie no coincide, es una consulta rápida sin mascota.
  private syncPetFromFlow() {
    const flow = this.flow.state;
    if (!flow || flow.especie !== this.especie) {
      this.flow.start(this.especie, this.auth.currentUser?.id ?? null);
    }
    this.petId = this.flow.petIdFor(this.auth.currentUser?.id);
    this.petNombre = this.petId ? this.flow.state?.petNombre ?? null : null;
  }

  async openPicker() {
    const modal = await this.modalCtrl.create({
      component: SymptomPickerComponent,
      cssClass: 'symptom-picker-modal',
      componentProps: {
        symptomGroups: this.symptomGroups,
        preselected: this.selectedSymptoms.map((s) => s.key),
      },
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && Array.isArray(data)) {
      this.syncSelected(data);
    }
  }

  private syncSelected(keys: string[]) {
    // Mantener severidad de los que ya estaban
    const existing = new Map(
      this.selectedSymptoms.map((s) => [s.key, s.severity]),
    );
    this.selectedSymptoms = keys.map((key) => ({
      key,
      severity: existing.get(key) ?? 0,
      expanded: false,
    }));
  }

  getSymptomLabel(key: string): string {
    return this.symptomMap[key]?.label ?? key;
  }

  toggleExpand(item: { expanded: boolean }) {
    item.expanded = !item.expanded;
  }

  setSeverity(
    item: { key: string; severity: number; expanded: boolean },
    value: number,
  ) {
    item.severity = value;
    item.expanded = false;
  }

  removeSymptom(key: string) {
    this.selectedSymptoms = this.selectedSymptoms.filter((s) => s.key !== key);
  }

  getSeverityLabel(value: number): string {
    return ['Sin definir', 'Leve', 'Moderado', 'Grave'][value];
  }

  getSeverityGuide(key: string): SeverityGuide {
    return severityGuideFor(key);
  }

  getReadyCount(): number {
    return this.selectedSymptoms.filter((s) => s.severity > 0).length;
  }

  canPredict(): boolean {
    return (
      this.selectedSymptoms.length > 0 &&
      this.selectedSymptoms.every((s) => s.severity > 0)
    );
  }

  resetAll() {
    this.selectedSymptoms = [];
    this.errorMsg = '';
  }

  predict() {
    if (!this.canPredict()) return;

    this.isLoading = true;
    this.errorMsg = '';

    // Construir payload con todos los síntomas en 0 y solo los seleccionados con su valor
    const allSymptoms: Record<string, number> = {};
    Object.keys(this.symptomMap).forEach((k) => {
      allSymptoms[k] = 0;
    });
    this.selectedSymptoms.forEach((s) => {
      allSymptoms[s.key] = s.severity;
    });

    const payload: PredictionRequest = {
      especie: this.especie,
      pet_id: this.petId,
      ...allSymptoms,
    };

    this.predictionService.predict(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.flow.setResult(
          res,
          this.selectedSymptoms.map((s) => ({
            key: s.key,
            severity: s.severity,
            label: this.getSymptomLabel(s.key),
          })),
        );
        this.router.navigate(['/diagnostic-result']);
      },
      error: (err) => {
        this.errorMsg =
          err?.error?.detail || 'Error al conectar con el servidor.';
        this.isLoading = false;
      },
    });
  }

}

