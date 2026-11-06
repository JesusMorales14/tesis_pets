import { HttpErrorResponse } from '@angular/common/http';
import { getApiErrorMessage } from './http-error';

describe('getApiErrorMessage', () => {
  it('usa el detail de la API cuando es texto', () => {
    const err = new HttpErrorResponse({ status: 409, error: { detail: 'Horario ocupado' } });
    expect(getApiErrorMessage(err, 'fallback')).toBe('Horario ocupado');
  });

  it('usa el mensaje por defecto con errores de validación (422)', () => {
    const err = new HttpErrorResponse({ status: 422, error: { detail: [{ msg: 'x' }] } });
    expect(getApiErrorMessage(err, 'fallback')).toBe('fallback');
  });

  it('avisa cuando no hay conexión', () => {
    const err = new HttpErrorResponse({ status: 0 });
    expect(getApiErrorMessage(err, 'fallback')).toContain('No se pudo conectar');
  });

  it('acepta errores que no son HTTP', () => {
    expect(getApiErrorMessage(new Error('x'), 'fallback')).toBe('fallback');
  });
});
