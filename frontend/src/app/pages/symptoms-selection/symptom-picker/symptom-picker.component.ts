import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SymptomCategory, Symptom } from '../../../models/symptom.model';

@Component({
  selector: 'app-symptom-picker',
  templateUrl: './symptom-picker.component.html',
  styleUrls: ['./symptom-picker.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class SymptomPickerComponent implements OnInit {
  @Input() symptomGroups: SymptomCategory[] = [];
  @Input() preselected: string[] = [];

  searchTerm: string = '';
  activeCategory: string = 'all';
  selectedKeys: Set<string> = new Set();

  constructor(private modalCtrl: ModalController) {}

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
