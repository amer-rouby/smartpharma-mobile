import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';
import { DashboardStats } from '../models/dashboard.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/dashboard`;

  getStats(): Observable<DashboardStats> {
    const pharmacyId = this.authService.getPharmacyId();
    return this.http
      .get<ApiResponse<DashboardStats>>(`${this.apiUrl}/stats`, {
        params: new HttpParams().set('pharmacyId', pharmacyId ?? ''),
      })
      .pipe(map((response) => response.data));
  }
}
