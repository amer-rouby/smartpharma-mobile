import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';
import { StockBatch, StockBatchPage, StockBatchRequest } from '../models/stock-batch.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class StockBatchService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/stock`;

  private pharmacyIdParam(): HttpParams {
    return new HttpParams().set('pharmacyId', this.authService.getPharmacyId() ?? '');
  }

  getBatches(page: number, size: number): Observable<StockBatchPage> {
    const params = this.pharmacyIdParam().set('page', page).set('size', size);
    return this.http
      .get<ApiResponse<StockBatchPage>>(`${this.apiUrl}/batches`, { params })
      .pipe(map((response) => response.data));
  }

  create(request: StockBatchRequest): Observable<StockBatch> {
    return this.http
      .post<ApiResponse<StockBatch>>(`${this.apiUrl}/batches`, request, { params: this.pharmacyIdParam() })
      .pipe(map((response) => response.data));
  }

  update(id: number, request: StockBatchRequest): Observable<StockBatch> {
    return this.http
      .put<ApiResponse<StockBatch>>(`${this.apiUrl}/batches/${id}`, request, { params: this.pharmacyIdParam() })
      .pipe(map((response) => response.data));
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/batches/${id}`, { params: this.pharmacyIdParam() })
      .pipe(map((response) => response.data));
  }
}
