/** Modelos del dominio de citas (contratos de la API /appointments y /admin). */

export type AppointmentEstado = 'pendiente' | 'confirmada' | 'cancelada';
export type PagoEstado = 'pendiente' | 'aprobado' | 'rechazado';
export type MetodoPago = 'yape' | 'transferencia';
export type SlotTipo = 'libre' | 'ocupado' | 'bloqueado';

export interface TimeSlot {
  hora: string;
  disponible: boolean;
  tipo: SlotTipo;
}

export interface AdminSlot extends TimeSlot {
  block_id: number | null;
  cita_info: { user_nombre: string; diagnostico: string } | null;
}

export interface AppointmentPayload {
  fecha: string;
  hora: string;
  diagnostico: string;
  especie: string;
  gravedad: string;
  metodo_pago: string;
  probabilidad?: number;  // 0.0 - 1.0
  pet_id?: number;  // ID de mascota registrada
  sintomas_json?: string;
}

export interface Appointment {
  id: number;
  user_nombre?: string;
  user_email?: string;
  fecha: string;
  hora: string;
  diagnostico: string;
  especie: string;
  gravedad: string;
  estado: AppointmentEstado;
  metodo_pago: string;
  pago_estado: PagoEstado;
  probabilidad?: number | null;  // 0.0 - 1.0
  pet_id?: number | null;
  /** Nombre de la mascota al reservar (se conserva aunque luego la eliminen). */
  pet_nombre?: string | null;
  comprobante_url: string | null;
}
