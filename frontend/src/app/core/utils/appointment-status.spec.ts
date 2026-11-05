import { Appointment } from '../models/appointment';
import { adminAppointmentStatus, hasPendingPayment, ownerAppointmentStatus } from './appointment-status';

function appt(overrides: Partial<Appointment>): Appointment {
  return {
    id: 1, fecha: '2026-11-10', hora: '10:00', diagnostico: 'parvovirus', especie: 'perro',
    gravedad: 'grave', estado: 'pendiente', metodo_pago: 'yape', pago_estado: 'pendiente',
    comprobante_url: null, ...overrides,
  };
}

describe('appointment-status', () => {
  it('detecta un comprobante pendiente de revisión', () => {
    expect(hasPendingPayment(appt({ comprobante_url: '/uploads/x.png' }))).toBeTrue();
    expect(hasPendingPayment(appt({}))).toBeFalse();
  });

  it('el dueño ve "Pago en verificación" mientras se revisa el comprobante', () => {
    expect(ownerAppointmentStatus(appt({ comprobante_url: '/x.png' })).label).toBe('Pago en verificación');
  });

  it('el dueño ve "Pago rechazado" cuando el pago no se validó', () => {
    const s = ownerAppointmentStatus(appt({ estado: 'cancelada', pago_estado: 'rechazado' }));
    expect(s.label).toBe('Pago rechazado');
    expect(s.cls).toBe('st-cancelled');
  });

  it('el veterinario ve "Por confirmar" en una cita sin comprobante', () => {
    expect(adminAppointmentStatus(appt({})).label).toBe('Por confirmar');
  });

  it('el veterinario ve "Pago en revisión" con comprobante pendiente', () => {
    const s = adminAppointmentStatus(appt({ comprobante_url: '/x.png' }));
    expect(s.label).toBe('Pago en revisión');
    expect(s.icon).toBe('hourglass-outline');
  });
});
