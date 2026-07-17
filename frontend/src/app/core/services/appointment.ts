import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TimeSlot {
  hora: string;
  disponible: boolean;
  tipo: 'libre' | 'ocupado' | 'bloqueado';
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
  estado: string;
  metodo_pago: string;
  pago_estado: 'pendiente' | 'aprobado' | 'rechazado';
  comprobante_url: string | null;
}

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private http = inject(HttpClient);

  private readonly API = environment.apiUrl;

  getSlots(fecha: string): Observable<TimeSlot[]> {
    return this.http.get<TimeSlot[]>(`${this.API}/slots?fecha=${fecha}`);
  }

  createAppointment(payload: AppointmentPayload): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.API}/appointments`, payload);
  }

  getMyAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.API}/appointments/mine`);
  }

  uploadComprobante(appointmentId: number, file: File): Observable<Appointment> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Appointment>(
      `${this.API}/appointments/${appointmentId}/comprobante`, formData,
    );
  }

  // Admin
  getAdminSlots(fecha: string): Observable<AdminSlot[]> {
    return this.http.get<AdminSlot[]>(`${this.API}/admin/slots?fecha=${fecha}`);
  }

  blockSlot(fecha: string, hora: string): Observable<any> {
    return this.http.post(`${this.API}/admin/block`, { fecha, hora });
  }

  unblockSlot(fecha: string, hora: string): Observable<any> {
    return this.http.delete(`${this.API}/admin/block/${fecha}/${hora}`);
  }

  getAllAppointments(fecha?: string): Observable<Appointment[]> {
    const q = fecha ? `?fecha=${fecha}` : '';
    return this.http.get<Appointment[]>(`${this.API}/admin/appointments${q}`);
  }

  updateAppointmentEstado(id: number, estado: string): Observable<any> {
    return this.http.put(`${this.API}/admin/appointments/${id}/estado`, { estado });
  }

  getPendingPayments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.API}/admin/appointments/pending-payments`);
  }

  decidePayment(id: number, aprobado: boolean): Observable<Appointment> {
    return this.http.put<Appointment>(
      `${this.API}/admin/appointments/${id}/pago`, { aprobado },
    );
  }
}
