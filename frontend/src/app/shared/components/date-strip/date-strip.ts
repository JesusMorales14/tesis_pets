import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DateOption, formatMonthYear, formatWeekdayDate } from '@core/utils/date';

/**
 * Selector horizontal de días (reserva de cita y agenda del veterinario).
 * Componente de presentación: recibe los días y emite el elegido.
 */
let nextId = 0;

@Component({
  selector: 'app-date-strip',
  templateUrl: './date-strip.html',
  styleUrls: ['./date-strip.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.compact]': 'compact()' },
})
export class DateStripComponent {
  protected readonly labelId = `date-strip-label-${nextId++}`;
  readonly label = input('Selecciona fecha');
  readonly dates = input.required<DateOption[]>();
  readonly selectedIso = input<string | null>(null);
  /** Variante más pequeña, usada en el panel de administración. */
  readonly compact = input(false);

  readonly dateSelected = output<DateOption>();

  protected readonly monthYear = computed(() => {
    const selected = this.dates().find((d) => d.isoDate === this.selectedIso()) ?? this.dates()[0];
    return selected ? formatMonthYear(selected.date) : '';
  });

  protected ariaLabel(d: DateOption): string {
    return (d.isToday ? 'Hoy, ' : '') + formatWeekdayDate(d.isoDate);
  }
}
