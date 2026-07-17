import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PredictionRequest {
  especie: string;
  pet_id?: number | null;
  [key: string]: string | number | null | undefined;
}

export interface PredictionResult {
  especie: string;
  diagnostico: string;
  probabilidad: number;
  fase: number;
  gravedad: string;
  /** Segundo diagnóstico más probable, presente solo cuando está cerca del principal (caso ambiguo). */
  diagnostico_alternativo?: string | null;
  probabilidad_alternativa?: number | null;
  /** Tercer diagnóstico, presente solo cuando el caso es lo bastante ambiguo (siempre junto al segundo). */
  diagnostico_tercero?: string | null;
  probabilidad_tercero?: number | null;
  /** Presentes solo si la petición incluyó pet_id: el diagnóstico quedó guardado en el historial de esa mascota. */
  guardado_en_historial?: boolean;
  mascota?: string;
}

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
