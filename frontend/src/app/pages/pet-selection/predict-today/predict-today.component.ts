import { Component, Output, EventEmitter } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-predict-today',
  templateUrl: './predict-today.component.html',
  styleUrls: ['./predict-today.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class PredictTodayComponent {
  @Output() predict = new EventEmitter<void>();

  onPredict() {
    this.predict.emit();
    // Aquí puedes agregar la lógica de navegación o predicción
  }
}
