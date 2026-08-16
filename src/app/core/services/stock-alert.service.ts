import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';
import { StockAlert } from '../models/stock-alert.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class StockAlertService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/alerts`;

  private pharmacyIdParam(): HttpParams {
    return new HttpParams().set('pharmacyId', this.authService.getPharmacyId() ?? '');
  }

  getActiveAlerts(): Observable<StockAlert[]> {
    return this.http
      .get<ApiResponse<StockAlert[]>>(`${this.apiUrl}/active`, { params: this.pharmacyIdParam() })
      .pipe(map((response) => response.data ?? []));
  }

  resolveAlert(id: number): Observable<void> {
    return this.http
      .post<ApiResponse<void>>(`${this.apiUrl}/${id}/resolve`, {}, { params: this.pharmacyIdParam() })
      .pipe(map((response) => response.data));
  }
}
