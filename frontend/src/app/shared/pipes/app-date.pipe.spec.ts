import { AppDatePipe } from './app-date.pipe';

describe('AppDatePipe', () => {
  const pipe = new AppDatePipe();

  it('formatea un día de calendario sin desfase de zona horaria', () => {
    expect(pipe.transform('2026-10-25')).toBe('25 Oct 2026');
  });

  it('incluye el día de la semana', () => {
    expect(pipe.transform('2026-10-25', 'weekday')).toBe('Dom 25 Oct 2026');
  });

  it('usa el formato largo de la pantalla de pago', () => {
    expect(pipe.transform('2026-10-25', 'long')).toBe('Domingo, 25 de OCT 2026');
  });

  it('devuelve cadena vacía sin valor', () => {
    expect(pipe.transform(null)).toBe('');
  });
});
