import { Component, Input, Output, EventEmitter } from '@angular/core';

import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-chip',
  templateUrl: './chip.html',
  styleUrls: ['./chip.scss'],
  standalone: true,
  imports: [IonicModule],
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
