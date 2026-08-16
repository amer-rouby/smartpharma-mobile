import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';
import { PagedResponse } from '../models/product.model';
import { PurchaseOrder } from '../models/purchase-order.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PurchaseOrderService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/purchase-orders`;

  // pharmacyId is a required @RequestParam on the backend but always overwritten
  // there by the authenticated user's real pharmacy - sent here only to satisfy
  // that required-param validation, not because the value itself is trusted.
  private pharmacyIdParam(): HttpParams {
    return new HttpParams().set('pharmacyId', this.authService.getPharmacyId() ?? '');
  }

  getOrders(page: number, size: number): Observable<PagedResponse<PurchaseOrder>> {
    const params = this.pharmacyIdParam().set('page', page).set('size', size);
    return this.http
      .get<ApiResponse<PagedResponse<PurchaseOrder>>>(this.apiUrl, { params })
      .pipe(map((response) => response.data));
  }

  getOrder(id: number): Observable<PurchaseOrder> {
    return this.http
      .get<ApiResponse<PurchaseOrder>>(`${this.apiUrl}/${id}`, { params: this.pharmacyIdParam() })
      .pipe(map((response) => response.data));
  }
}
