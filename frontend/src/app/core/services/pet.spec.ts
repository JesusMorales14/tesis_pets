import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { PetService } from './pet';
import { environment } from '../../../environments/environment';
import { Pet } from '../models/pet';

describe('PetService', () => {
  let service: PetService;
  let httpMock: HttpTestingController;

  const mockPet: Pet = {
    id: 1, nombre: 'Firulais', especie: 'perro', raza: 'Mestizo', edad_meses: 24, peso_kg: 12.5,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PetService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fetches the list of pets', () => {
    service.getPets().subscribe((pets) => {
      expect(pets).toEqual([mockPet]);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/pets`);
    expect(req.request.method).toBe('GET');
    req.flush([mockPet]);
  });

  it('creates a pet with the given body', () => {
    const body = { nombre: 'Firulais', especie: 'perro' as const };
    service.createPet(body).subscribe((pet) => expect(pet).toEqual(mockPet));

    const req = httpMock.expectOne(`${environment.apiUrl}/pets`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(mockPet);
  });

  it('updates a pet by id', () => {
    const body = { nombre: 'Firu', especie: 'perro' as const };
    service.updatePet(1, body).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/pets/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ ...mockPet, nombre: 'Firu' });
  });

  it('deletes a pet by id', () => {
    service.deletePet(1).subscribe((res) => expect(res.ok).toBeTrue());

    const req = httpMock.expectOne(`${environment.apiUrl}/pets/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ ok: true });
  });

  it('fetches the diagnosis history for a pet', () => {
    const entry = {
      id: 5, diagnostico: 'gastroenteritis', probabilidad: 0.6,
      gravedad: 'moderada', sintomas: { vomitos: 2 }, created_at: '2026-01-01T00:00:00',
    };
    service.getDiagnoses(1).subscribe((entries) => expect(entries).toEqual([entry]));

    const req = httpMock.expectOne(`${environment.apiUrl}/pets/1/diagnoses`);
    expect(req.request.method).toBe('GET');
    req.flush([entry]);
  });

  it('fetches the vaccine schedule for a species without sending a token', () => {
    const schedule = [{ nombre: 'Rabia', refuerzo_meses: 12 }];
    service.getVaccineSchedule('perro').subscribe((s) => expect(s).toEqual(schedule));

    const req = httpMock.expectOne(`${environment.apiUrl}/vaccine-schedule?especie=perro`);
    expect(req.request.method).toBe('GET');
    req.flush(schedule);
  });

  it('creates a vaccination record for a pet', () => {
    const body = { nombre: 'Rabia', fecha_aplicacion: '2026-01-15', refuerzo_meses: 12 };
    const created = { id: 1, ...body, fecha_proxima: '2027-01-15', notas: null };
    service.createVaccination(1, body).subscribe((v) => expect(v).toEqual(created));

    const req = httpMock.expectOne(`${environment.apiUrl}/pets/1/vaccinations`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(created);
  });

  it('lists vaccinations for a pet', () => {
    service.getVaccinations(1).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/pets/1/vaccinations`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('deletes a vaccination record', () => {
    service.deleteVaccination(1, 5).subscribe((res) => expect(res.ok).toBeTrue());
    const req = httpMock.expectOne(`${environment.apiUrl}/pets/1/vaccinations/5`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ ok: true });
  });
});
