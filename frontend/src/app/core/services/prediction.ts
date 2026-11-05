import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PredictionRequest, PredictionResult } from '../models/prediction';

@Injectable({ providedIn: 'root' })
export class PredictionService {
  private http = inject(HttpClient);

  private apiUrl = environment.apiUrl;

  predict(data: PredictionRequest): Observable<PredictionResult> {
    // Sin sesión iniciada, /predict funciona igual (diagnóstico anónimo sin
    // guardar historial) — el authInterceptor solo adjunta el header cuando
    // hay token, así que esta petición ya se comporta igual con o sin sesión.
    return this.http.post<PredictionResult>(`${this.apiUrl}/predict`, data);
  }
}
