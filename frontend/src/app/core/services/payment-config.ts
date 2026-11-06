import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaymentConfig, PaymentConfigBody } from '../models/payment-config';

@Injectable({ providedIn: 'root' })
export class PaymentConfigService {
  private http = inject(HttpClient);
  private readonly API = environment.apiUrl;

  getConfig(): Observable<PaymentConfig> {
    return this.http.get<PaymentConfig>(`${this.API}/payment-config`);
  }

  updateConfig(body: PaymentConfigBody): Observable<PaymentConfig> {
    return this.http.put<PaymentConfig>(`${this.API}/admin/payment-config`, body);
  }

  uploadQr(file: File): Observable<PaymentConfig> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<PaymentConfig>(
      `${this.API}/admin/payment-config/qr`, formData,
    );
  }
}
