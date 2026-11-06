import { Appointment } from '../models/appointment';

/** Estado único de una cita para mostrar (combina estado de la cita y del pago). */
export interface AppointmentStatusView {
  label: string;
  /** Clase CSS de la píldora: st-review | st-confirmed | st-cancelled | st-pending */
  cls: 'st-review' | 'st-confirmed' | 'st-cancelled' | 'st-pending';
  icon: string;
  color: string;
}

const STATUS = {
  review: { cls: 'st-review', icon: 'time-outline', color: '#d68910' },
  confirmed: { cls: 'st-confirmed', icon: 'checkmark-circle-outline', color: '#27ae60' },
  cancelled: { cls: 'st-cancelled', icon: 'close-circle-outline', color: '#c0392b' },
  pending: { cls: 'st-pending', icon: 'time-outline', color: '#d68910' },
} as const;

/** El comprobante fue subido y el veterinario aún no lo revisa. */
export function hasPendingPayment(a: Appointment): boolean {
  return a.pago_estado === 'pendiente' && !!a.comprobante_url;
}

/** Estado tal como lo ve el dueño de la mascota (Mi cuenta). */
export function ownerAppointmentStatus(a: Appointment): AppointmentStatusView {
  if (hasPendingPayment(a) && a.estado !== 'cancelada') {
    return { label: 'Pago en verificación', ...STATUS.review };
  }
  if (a.pago_estado === 'aprobado') return { label: 'Confirmada', ...STATUS.confirmed };
  if (a.pago_estado === 'rechazado') return { label: 'Pago rechazado', ...STATUS.cancelled };
  switch (a.estado) {
    case 'confirmada':
      return { label: 'Confirmada', ...STATUS.confirmed };
    case 'cancelada':
      return { label: 'Cancelada', ...STATUS.cancelled };
    default:
      return { label: 'Pendiente', ...STATUS.pending };
  }
}

/** Estado tal como lo ve el veterinario (agenda del panel). */
export function adminAppointmentStatus(a: Appointment): AppointmentStatusView {
  if (a.estado === 'cancelada') {
    return { label: a.pago_estado === 'rechazado' ? 'Pago rechazado' : 'Cancelada', ...STATUS.cancelled };
  }
  if (a.estado === 'confirmada') return { label: 'Confirmada', ...STATUS.confirmed };
  return hasPendingPayment(a)
    ? { label: 'Pago en revisión', ...STATUS.review, icon: 'hourglass-outline' }
    : { label: 'Por confirmar', ...STATUS.pending };
}

export function paymentMethodLabel(metodo: string, short = false): string {
  if (metodo === 'yape') return 'Billetera digital';
  return short ? 'Transferencia' : 'Transferencia bancaria';
}
