import { buildDateOptions, formatLongDate, formatWeekdayDate, isTomorrow, toLocalIsoDate } from './date';

describe('date utils', () => {
  const now = new Date(2026, 9, 25, 20, 30); // 25 Oct 2026, 20:30 local

  it('toLocalIsoDate no se adelanta un día de noche (UTC-5)', () => {
    expect(toLocalIsoDate(now)).toBe('2026-10-25');
  });

  it('buildDateOptions genera días consecutivos desde hoy', () => {
    const opts = buildDateOptions(3, now);
    expect(opts.map((o) => o.isoDate)).toEqual(['2026-10-25', '2026-10-26', '2026-10-27']);
    expect(opts[0].isToday).toBeTrue();
    expect(opts[0].dayAbbr).toBe('DOM');
    expect(opts[0].monthAbbr).toBe('OCT');
  });

  it('isTomorrow compara contra el día siguiente local', () => {
    expect(isTomorrow('2026-10-26', now)).toBeTrue();
    expect(isTomorrow('2026-10-25', now)).toBeFalse();
  });

  it('formatea fechas largas y con día de semana', () => {
    expect(formatWeekdayDate('2026-10-28')).toBe('Mié 28 Oct 2026');
    expect(formatLongDate('2026-10-28')).toBe('Miércoles, 28 de OCT 2026');
  });
});
