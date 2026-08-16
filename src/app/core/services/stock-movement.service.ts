import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';
import { StockMovementPage, StockMovementStats } from '../models/stock-movement.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class StockMovementService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/stock/movements`;

  getForPharmacy(page: number, size: number): Observable<StockMovementPage> {
    const pharmacyId = this.authService.getPharmacyId() ?? 0;
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http
      .get<ApiResponse<StockMovementPage>>(`${this.apiUrl}/pharmacy/${pharmacyId}`, { params })
      .pipe(map((response) => response.data));
  }

  getStats(startDate: string, endDate: string): Observable<StockMovementStats> {
    const params = new HttpParams()
      .set('pharmacyId', this.authService.getPharmacyId() ?? '')
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http
      .get<ApiResponse<StockMovementStats>>(`${this.apiUrl}/stats`, { params })
      .pipe(map((response) => response.data));
  }
}
