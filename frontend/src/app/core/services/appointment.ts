import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PetClinicalRecord } from '../models/pet';
import {
  AdminSlot,
  Appointment,
  AppointmentEstado,
  AppointmentPayload,
  TimeSlot,
} from '../models/appointment';

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

  blockSlot(fecha: string, hora: string): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.API}/admin/block`, { fecha, hora });
  }

  unblockSlot(fecha: string, hora: string): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${this.API}/admin/block/${fecha}/${hora}`);
  }

  getAllAppointments(fecha?: string): Observable<Appointment[]> {
    const q = fecha ? `?fecha=${fecha}` : '';
    return this.http.get<Appointment[]>(`${this.API}/admin/appointments${q}`);
  }

  updateAppointmentEstado(id: number, estado: AppointmentEstado): Observable<{ ok: boolean; estado: AppointmentEstado }> {
    return this.http.put<{ ok: boolean; estado: AppointmentEstado }>(`${this.API}/admin/appointments/${id}/estado`, { estado });
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
