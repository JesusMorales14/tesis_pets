import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { PredictionService, PredictionRequest } from './prediction';
import { environment } from '../../../environments/environment';

describe('PredictionService', () => {
  let service: PredictionService;
  let httpMock: HttpTestingController;

  const payload: PredictionRequest = { especie: 'perro', fiebre: 1 };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PredictionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('sends pet_id in the payload when linking a prediction to a pet, so it can be saved to history', () => {
    localStorage.setItem('vet_token', 'fake-jwt-token');

    service.predict({ ...payload, pet_id: 7 }).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/predict`);
    expect(req.request.body.pet_id).toBe(7);
    req.flush({
      especie: 'perro', diagnostico: 'gastroenteritis', probabilidad: 0.5, fase: 2,
      gravedad: 'moderada', guardado_en_historial: true, mascota: 'Rocky',
    });
  });
});
