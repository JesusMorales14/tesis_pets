import { Appointment } from '@core/models/appointment';
import { countByEspecie, organizeAgenda, paginate } from './agenda.utils';

function appt(id: number, overrides: Partial<Appointment>): Appointment {
  return {
    id, fecha: '2026-11-10', hora: '10:00', diagnostico: 'x', especie: 'perro', gravedad: 'leve',
    estado: 'pendiente', metodo_pago: 'yape', pago_estado: 'pendiente', comprobante_url: null, ...overrides,
  };
}

describe('agenda.utils', () => {
  const list = [
    appt(1, { hora: '09:00', gravedad: 'leve' }),
    appt(2, { hora: '11:00', gravedad: 'grave', especie: 'gato' }),
    appt(3, { hora: '08:00', gravedad: 'grave', estado: 'cancelada' }),
    appt(4, { hora: '10:00', gravedad: 'moderada' }),
  ];

  it('ordena por gravedad y deja las canceladas al final', () => {
    expect(organizeAgenda(list, 'todas', 'gravedad').map((a) => a.id)).toEqual([2, 4, 1, 3]);
  });

  it('ordena por hora', () => {
    expect(organizeAgenda(list, 'todas', 'hora').map((a) => a.id)).toEqual([1, 4, 2, 3]);
  });

  it('filtra por especie sin mutar la lista original', () => {
    expect(organizeAgenda(list, 'gato', 'hora').map((a) => a.id)).toEqual([2]);
    expect(list.map((a) => a.id)).toEqual([1, 2, 3, 4]);
  });

  it('cuenta por especie', () => {
    expect(countByEspecie(list, 'todas')).toBe(4);
    expect(countByEspecie(list, 'perro')).toBe(3);
  });

  it('pagina', () => {
    expect(paginate([1, 2, 3, 4, 5], 2, 2)).toEqual([3, 4]);
  });
});
