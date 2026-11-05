import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { DiagnosisLabelPipe } from '@shared/pipes';

const GRAVEDAD_COLORS: Record<string, string> = { leve: '#1e8449', moderada: '#d68910', grave: '#c0392b' };

/** Recordatorio del diagnóstico para el que se está reservando la cita. */
@Component({
  selector: 'app-diagnosis-summary',
  templateUrl: './diagnosis-summary.html',
  styleUrls: ['./diagnosis-summary.scss'],
  standalone: true,
  imports: [IonicModule, TitleCasePipe, DiagnosisLabelPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagnosisSummaryComponent {
  readonly diagnostico = input.required<string>();
  readonly gravedad = input<string>('');
  readonly especie = input<'perro' | 'gato'>('perro');

  protected readonly borderColor = computed(() => GRAVEDAD_COLORS[this.gravedad()] ?? '#2f6df6');
}
