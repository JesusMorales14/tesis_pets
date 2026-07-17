import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Pet,
  PetBody,
  DiagnosisHistoryEntry,
  Vaccination,
  VaccinationBody,
  VaccineScheduleEntry,
} from '../models/pet';

@Injectable({ providedIn: 'root' })
export class PetService {
  private http = inject(HttpClient);
  private readonly API = environment.apiUrl;

  getPets(): Observable<Pet[]> {
    return this.http.get<Pet[]>(`${this.API}/pets`);
  }

  createPet(body: PetBody): Observable<Pet> {
    return this.http.post<Pet>(`${this.API}/pets`, body);
  }

  updatePet(id: number, body: PetBody): Observable<Pet> {
    return this.http.put<Pet>(`${this.API}/pets/${id}`, body);
  }

  deletePet(id: number): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${this.API}/pets/${id}`);
  }

  getDiagnoses(petId: number): Observable<DiagnosisHistoryEntry[]> {
    return this.http.get<DiagnosisHistoryEntry[]>(`${this.API}/pets/${petId}/diagnoses`);
  }

  getVaccineSchedule(especie: 'perro' | 'gato'): Observable<VaccineScheduleEntry[]> {
    return this.http.get<VaccineScheduleEntry[]>(`${this.API}/vaccine-schedule`, { params: { especie } });
  }

  getVaccinations(petId: number): Observable<Vaccination[]> {
    return this.http.get<Vaccination[]>(`${this.API}/pets/${petId}/vaccinations`);
  }

  createVaccination(petId: number, body: VaccinationBody): Observable<Vaccination> {
    return this.http.post<Vaccination>(`${this.API}/pets/${petId}/vaccinations`, body);
  }

  deleteVaccination(petId: number, vaccinationId: number): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(
      `${this.API}/pets/${petId}/vaccinations/${vaccinationId}`,
    );
  }
}
