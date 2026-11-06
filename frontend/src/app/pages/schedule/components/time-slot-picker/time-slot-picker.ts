import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TimeSlot } from '@core/models/appointment';

/**
 * Horarios del día para reservar. Marca el primero libre como "URGENTE"
 * (la opción más pronta) y el elegido como "TU SELECCIÓN".
 */
@Component({
  selector: 'app-time-slot-picker',
  templateUrl: './time-slot-picker.html',
  styleUrls: ['./time-slot-picker.scss'],
  standalone: true,
  imports: [IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeSlotPickerComponent {
  readonly slots = input<TimeSlot[]>([]);
  readonly loading = input(false);
  readonly selectedHora = input<string | null>(null);

  readonly slotSelected = output<TimeSlot | null>();

  protected readonly skeletons = Array.from({ length: 12 }, (_, i) => i);
  protected readonly firstAvailable = computed(() => this.slots().find((s) => s.disponible)?.hora ?? null);

  protected toggle(slot: TimeSlot): void {
    if (!slot.disponible) return;
    this.slotSelected.emit(this.selectedHora() === slot.hora ? null : slot);
  }

  protected ariaLabel(slot: TimeSlot): string {
    if (!slot.disponible) return `${slot.hora}, no disponible`;
    return slot.hora === this.firstAvailable() ? `${slot.hora}, primer horario disponible` : slot.hora;
  }
}
