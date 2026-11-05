import { Component, Input, OnInit, inject } from '@angular/core';

import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SymptomCategory, Symptom } from '@core/models/symptom';

@Component({
  selector: 'app-symptom-picker',
  templateUrl: './symptom-picker.html',
  styleUrls: ['./symptom-picker.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule],
})
export class SymptomPickerComponent implements OnInit {
  private modalCtrl = inject(ModalController);

  // Ionic's ModalController sets componentProps via direct property
  // assignment on the instance (not through Angular's template binding
  // system), so these must stay as classic @Input() decorators — signal
  // inputs (input()) get overwritten by that assignment and break.
  //
  // NOTE: opening this modal logs a dev-mode-only NG0100
  // (ExpressionChangedAfterItHasBeenCheckedError) the first time, caused by
  // how Ionic applies componentProps relative to Angular's first
  // change-detection pass for a dynamically created component. It does not
  // reproduce in production builds (checkNoChanges only runs in dev mode)
  // and does not affect functionality — verified end-to-end: all
  // categories/symptoms render correctly and selection works. Tried
  // ChangeDetectorRef.detectChanges() in ngOnInit and deferring render by
  // one macrotask; neither eliminated it, so it's left as a known,
  // non-blocking console warning rather than working around it further.
  @Input() symptomGroups: SymptomCategory[] = [];
  @Input() preselected: string[] = [];

  searchTerm: string = '';
  activeCategory: string = 'all';
  selectedKeys: Set<string> = new Set();

  ngOnInit() {
    this.selectedKeys = new Set(this.preselected);
  }

  get filteredGroups(): SymptomCategory[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.symptomGroups
      .filter((g) =>
        this.activeCategory === 'all'
          ? true
          : g.groupKey === this.activeCategory,
      )
      .map((g) => ({
        ...g,
        symptoms: g.symptoms.filter((s) =>
          term === '' ? true : s.label.toLowerCase().includes(term),
        ),
      }))
      .filter((g) => g.symptoms.length > 0);
  }

  toggleSymptom(symptom: Symptom) {
    if (this.selectedKeys.has(symptom.key)) {
      this.selectedKeys.delete(symptom.key);
    } else {
      this.selectedKeys.add(symptom.key);
    }
  }

  isSelected(symptom: Symptom): boolean {
    return this.selectedKeys.has(symptom.key);
  }

  setCategory(key: string) {
    this.activeCategory = key;
  }

  clearSearch() {
    this.searchTerm = '';
  }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    this.modalCtrl.dismiss(Array.from(this.selectedKeys), 'confirm');
  }

  getSelectedCount(): number {
    return this.selectedKeys.size;
  }
}
