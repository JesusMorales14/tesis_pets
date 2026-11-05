import { Pipe, PipeTransform } from '@angular/core';
import {
  formatLongDate,
  formatShortDate,
  formatTimestampDate,
  formatWeekdayDate,
} from '@core/utils/date';

export type AppDateFormat = 'short' | 'weekday' | 'long' | 'timestamp';

const FORMATTERS: Record<AppDateFormat, (value: string) => string> = {
  short: formatShortDate,
  weekday: formatWeekdayDate,
  long: formatLongDate,
  timestamp: formatTimestampDate,
};

/**
 * Formatea fechas de la API en español:
 * - short:     '2026-10-25' → '25 Oct 2026'
 * - weekday:   '2026-10-25' → 'Dom 25 Oct 2026'
 * - long:      '2026-10-25' → 'Domingo, 25 de OCT 2026'
 * - timestamp: ISO con zona → '25 Oct 2026' (hora local)
 */
@Pipe({ name: 'appDate', standalone: true })
export class AppDatePipe implements PipeTransform {
  transform(value: string | null | undefined, format: AppDateFormat = 'short'): string {
    return value ? FORMATTERS[format](value) : '';
  }
}
