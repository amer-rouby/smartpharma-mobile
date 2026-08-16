import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';
import { AuthService } from './auth.service';

export interface PharmacySettings {
  pharmacyName: string;
  address?: string;
  phone?: string;
  email?: string;
  licenseNumber?: string;
  taxNumber?: string;
  commercialRegister?: string;
  logoUrl?: string;
  currency: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: string;
  enabledPaymentMethods?: string;
  largeSaleThreshold?: number;
  largeExpenseThreshold?: number;
}

@Injectable({ providedIn: 'root' })
export class PharmacySettingsService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/settings/pharmacy`;

  private pharmacyIdParam(): HttpParams {
    return new HttpParams().set('pharmacyId', this.authService.getPharmacyId() ?? '');
  }

  getSettings(): Observable<PharmacySettings> {
    return this.http
      .get<ApiResponse<PharmacySettings>>(this.apiUrl, { params: this.pharmacyIdParam() })
      .pipe(map((response) => response.data));
  }

  update(request: PharmacySettings): Observable<PharmacySettings> {
    return this.http
      .put<ApiResponse<PharmacySettings>>(this.apiUrl, request, { params: this.pharmacyIdParam() })
      .pipe(map((response) => response.data));
  }
}
