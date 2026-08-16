import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';
import {
  DemandPredictionPage,
  PredictionStats,
  PurchaseOrderSummary,
} from '../models/demand-prediction.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class DemandPredictionService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/predictions`;

  private pharmacyIdParam(): HttpParams {
    return new HttpParams().set('pharmacyId', this.authService.getPharmacyId() ?? '');
  }

  getPage(page: number, size: number): Observable<DemandPredictionPage> {
    const params = this.pharmacyIdParam().set('page', page).set('size', size);
    return this.http
      .get<ApiResponse<DemandPredictionPage>>(this.apiUrl, { params })
      .pipe(map((response) => response.data));
  }

  getAccuracy(): Observable<PredictionStats> {
    return this.http
      .get<ApiResponse<PredictionStats>>(`${this.apiUrl}/accuracy`, { params: this.pharmacyIdParam() })
      .pipe(map((response) => response.data));
  }

  generate(): Observable<void> {
    return this.http
      .post<ApiResponse<void>>(`${this.apiUrl}/generate`, {}, { params: this.pharmacyIdParam() })
      .pipe(map((response) => response.data));
  }

  createPurchase(id: number): Observable<PurchaseOrderSummary> {
    return this.http
      .post<ApiResponse<PurchaseOrderSummary>>(`${this.apiUrl}/${id}/create-purchase`, {})
      .pipe(map((response) => response.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(map((response) => response.data));
  }
}
