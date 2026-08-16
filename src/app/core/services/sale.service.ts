import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';
import { SaleRequest, SaleResponse } from '../models/sale.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SaleService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/sales`;

  createSale(request: SaleRequest): Observable<SaleResponse> {
    // pharmacyId is required as a query param by the backend even though it always
    // overwrites it from the authenticated user's own pharmacy - see SalesController.
    const params = new HttpParams().set('pharmacyId', this.authService.getPharmacyId() ?? '');
    return this.http
      .post<ApiResponse<SaleResponse>>(this.apiUrl, request, { params })
      .pipe(map((response) => response.data));
  }
}
