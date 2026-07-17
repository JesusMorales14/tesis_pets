import { Component, Input, Output, EventEmitter } from '@angular/core';

import { IonicModule } from '@ionic/angular';
import { ChipComponent } from '../chip/chip';
import {
  SymptomCategory,
  SEVERITY_LABELS,
} from '@core/models/symptom';

@Component({
  selector: 'app-category',
  templateUrl: './category.html',
  styleUrls: ['./category.scss'],
  standalone: true,
  imports: [IonicModule, ChipComponent],
})
export class CategoryComponent {
  @Input() category!: SymptomCategory;
  @Input() symptoms: Record<string, number> = {};
  @Input() collapsed: boolean = false;
  @Output() severityChange = new EventEmitter<{ key: string; value: number }>();
  @Output() toggleCategory = new EventEmitter<string>();

  severityLabels = SEVERITY_LABELS;

  onSeverity(key: string, value: number) {
    const newValue = this.symptoms[key] === value ? 0 : value;
    this.severityChange.emit({ key, value: newValue });
  }

  onToggle() {
    this.toggleCategory.emit(this.category.groupKey);
  }
}
