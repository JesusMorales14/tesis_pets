import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PetClinicalRecord } from '../models/pet';

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
  estado: string;
  metodo_pago: string;
  pago_estado: 'pendiente' | 'aprobado' | 'rechazado';
  probabilidad?: number | null;  // 0.0 - 1.0
  pet_id?: number | null;
  /** Nombre de la mascota al reservar (se conserva aunque luego la eliminen). */
  pet_nombre?: string | null;
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

  createWithComprobante(payload: AppointmentPayload, file: File): Observable<Appointment> {
    const formData = new FormData();
    formData.append('fecha', payload.fecha);
    formData.append('hora', payload.hora);
    formData.append('diagnostico', payload.diagnostico);
    formData.append('especie', payload.especie);
    formData.append('gravedad', payload.gravedad);
    formData.append('metodo_pago', payload.metodo_pago);
    if (payload.sintomas_json) {
      formData.append('sintomas_json', payload.sintomas_json);
    }
    if (payload.probabilidad != null) {
      formData.append('probabilidad', String(payload.probabilidad));
    }
    if (payload.pet_id != null) {
      formData.append('pet_id', String(payload.pet_id));
    }
    formData.append('file', file);
    return this.http.post<Appointment>(`${this.API}/appointments/with-comprobante`, formData);
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

  getPetClinicalRecord(petId: number): Observable<PetClinicalRecord> {
    return this.http.get<PetClinicalRecord>(`${this.API}/admin/pets/${petId}/clinical-record`);
  }

  decidePayment(id: number, aprobado: boolean): Observable<Appointment> {
    return this.http.put<Appointment>(
      `${this.API}/admin/appointments/${id}/pago`, { aprobado },
    );
  }
}
