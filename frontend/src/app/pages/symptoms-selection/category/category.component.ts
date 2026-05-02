import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ChipComponent } from '../chip/chip.component';
import {
  SymptomCategory,
  SEVERITY_LABELS,
} from '../../../models/symptom.model';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ChipComponent],
})
export class CategoryComponent {
  @Input() category!: SymptomCategory;
  @Input() symptoms: Record<string, number> = {};
  @Input() collapsed: boolean = false;
  @Output() severityChange = new EventEmitter<{ key: string; value: number }>();
  @Output() toggle = new EventEmitter<string>();

  severityLabels = SEVERITY_LABELS;

  onSeverity(key: string, value: number) {
    const newValue = this.symptoms[key] === value ? 0 : value;
    this.severityChange.emit({ key, value: newValue });
  }

  onToggle() {
    this.toggle.emit(this.category.groupKey);
  }
}
