import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AdminSlot } from '@core/models/appointment';

const SLOT_ICONS = { libre: 'add-circle-outline', ocupado: 'person-outline', bloqueado: 'lock-closed-outline' } as const;
const SLOT_ACTIONS = { libre: 'libre, pulsa para bloquear', ocupado: 'con cita reservada', bloqueado: 'bloqueado, pulsa para liberar' } as const;

/** Grilla de horarios del día: bloquear o liberar cada media hora. */
@Component({
  selector: 'app-slots-manager',
  templateUrl: './slots-manager.html',
  styleUrls: ['./slots-manager.scss'],
  standalone: true,
  imports: [IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlotsManagerComponent {
  readonly slots = input<AdminSlot[]>([]);
  readonly loading = input(false);
  readonly toggleSlot = output<AdminSlot>();

  protected readonly icons = SLOT_ICONS;
  protected readonly skeletons = Array.from({ length: 12 }, (_, i) => i);

  protected ariaLabel(slot: AdminSlot): string {
    return `${slot.hora}, ${SLOT_ACTIONS[slot.tipo]}`;
  }
}
