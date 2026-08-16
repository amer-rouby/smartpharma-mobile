import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';
import { Payment, PaymentPage, PaymentStats } from '../models/payment.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/payments`;

  private pharmacyIdParam(): HttpParams {
    return new HttpParams().set('pharmacyId', this.authService.getPharmacyId() ?? '');
  }

  getPage(page: number, size: number): Observable<PaymentPage> {
    const params = this.pharmacyIdParam().set('page', page).set('size', size);
    return this.http
      .get<ApiResponse<PaymentPage>>(this.apiUrl, { params })
      .pipe(map((response) => response.data));
  }

  getStats(): Observable<PaymentStats> {
    return this.http
      .get<ApiResponse<PaymentStats>>(`${this.apiUrl}/stats`, { params: this.pharmacyIdParam() })
      .pipe(map((response) => response.data));
  }

  getByReference(reference: string): Observable<Payment> {
    return this.http
      .get<ApiResponse<Payment>>(`${this.apiUrl}/${reference}/verify`)
      .pipe(map((response) => response.data));
  }

  refund(referenceNumber: string, amount: number, reason: string): Observable<Payment> {
    const params = new HttpParams().set('amount', amount).set('reason', reason);
    return this.http
      .post<ApiResponse<Payment>>(`${this.apiUrl}/${referenceNumber}/refund`, null, { params })
      .pipe(map((response) => response.data));
  }
}
