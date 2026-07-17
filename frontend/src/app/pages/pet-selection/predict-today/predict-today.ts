import { Component, Output, EventEmitter } from '@angular/core';
import { IonicModule } from '@ionic/angular';


@Component({
  selector: 'app-predict-today',
  templateUrl: './predict-today.html',
  styleUrls: ['./predict-today.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class PredictTodayComponent {
  @Output() predict = new EventEmitter<void>();

  onPredict() {
    this.predict.emit();
    // Aquí puedes agregar la lógica de navegación o predicción
  }
}
