import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-chip',
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class ChipComponent {
  @Input() label: string = '';
  @Input() icon: string = '';
  @Input() level: 'leve' | 'moderado' | 'grave' = 'leve';
  @Input() selected: boolean = false;
  @Output() chipClick = new EventEmitter<void>();

  onClick() {
    this.chipClick.emit();
  }
}
