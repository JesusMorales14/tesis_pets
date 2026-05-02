import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PredictionRequest {
  especie: string;
  [key: string]: string | number;
}

export interface PredictionResult {
  especie: string;
  diagnostico: string;
  probabilidad: number;
  fase: number;
  gravedad: string;
}

@Injectable({ providedIn: 'root' })
export class PredictionService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  predict(data: PredictionRequest): Observable<PredictionResult> {
    return this.http.post<PredictionResult>(`${this.apiUrl}/predict`, data);
  }
}
