import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';
import { SalePage, SaleRequest, SaleResponse } from '../models/sale.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SaleService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/sales`;

  private pharmacyIdParam(): HttpParams {
    return new HttpParams().set('pharmacyId', this.authService.getPharmacyId() ?? '');
  }

  createSale(request: SaleRequest): Observable<SaleResponse> {
    // pharmacyId is required as a query param by the backend even though it always
    // overwrites it from the authenticated user's own pharmacy - see SalesController.
    return this.http
      .post<ApiResponse<SaleResponse>>(this.apiUrl, request, { params: this.pharmacyIdParam() })
      .pipe(map((response) => response.data));
  }

  getSalesPaged(page: number, size: number): Observable<SalePage> {
    const params = this.pharmacyIdParam().set('page', page).set('size', size);
    return this.http
      .get<ApiResponse<SalePage>>(this.apiUrl, { params })
      .pipe(map((response) => response.data));
  }

  searchSales(query: string): Observable<SalePage> {
    const params = this.pharmacyIdParam().set('query', query);
    return this.http
      .get<ApiResponse<SalePage>>(`${this.apiUrl}/search`, { params })
      .pipe(map((response) => response.data));
  }

  getSaleById(id: number): Observable<SaleResponse> {
    return this.http
      .get<ApiResponse<SaleResponse>>(`${this.apiUrl}/${id}`, { params: this.pharmacyIdParam() })
      .pipe(map((response) => response.data));
  }
}
