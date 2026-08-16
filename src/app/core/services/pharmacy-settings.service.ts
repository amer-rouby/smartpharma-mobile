import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';

export interface PharmacySettings {
  pharmacyName: string;
  currency: string;
  enabledPaymentMethods?: string;
  largeSaleThreshold?: number;
  largeExpenseThreshold?: number;
}

@Injectable({ providedIn: 'root' })
export class PharmacySettingsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/settings/pharmacy`;

  getSettings(): Observable<PharmacySettings> {
    return this.http
      .get<ApiResponse<PharmacySettings>>(this.apiUrl)
      .pipe(map((response) => response.data));
  }
}
