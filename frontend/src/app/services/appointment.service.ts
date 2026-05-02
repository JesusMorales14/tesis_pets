import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

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
}

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly API = 'http://localhost:8000';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private get headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.token}` });
  }

  getSlots(fecha: string): Observable<TimeSlot[]> {
    return this.http.get<TimeSlot[]>(`${this.API}/slots?fecha=${fecha}`);
  }

  createAppointment(payload: AppointmentPayload): Observable<{ id: number; fecha: string; hora: string; estado: string }> {
    return this.http.post<any>(`${this.API}/appointments`, payload, { headers: this.headers });
  }

  getMyAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.API}/appointments/mine`, { headers: this.headers });
  }

  // Admin
  getAdminSlots(fecha: string): Observable<AdminSlot[]> {
    return this.http.get<AdminSlot[]>(`${this.API}/admin/slots?fecha=${fecha}`, { headers: this.headers });
  }

  blockSlot(fecha: string, hora: string): Observable<any> {
    return this.http.post(`${this.API}/admin/block`, { fecha, hora }, { headers: this.headers });
  }

  unblockSlot(fecha: string, hora: string): Observable<any> {
    return this.http.delete(`${this.API}/admin/block/${fecha}/${hora}`, { headers: this.headers });
  }

  getAllAppointments(fecha?: string): Observable<Appointment[]> {
    const q = fecha ? `?fecha=${fecha}` : '';
    return this.http.get<Appointment[]>(`${this.API}/admin/appointments${q}`, { headers: this.headers });
  }

  updateAppointmentEstado(id: number, estado: string): Observable<any> {
    return this.http.put(`${this.API}/admin/appointments/${id}/estado`, { estado }, { headers: this.headers });
  }
}
