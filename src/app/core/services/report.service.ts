import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';
import { AuthService } from './auth.service';
import {
  ReportRequest,
  SalesReportResponse,
  StockReportResponse,
  FinancialReportResponse,
  ExpiryReportResponse,
} from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/reports`;

  private buildRequest(startDate: string, endDate: string): ReportRequest {
    return {
      pharmacyId: this.authService.getPharmacyId() ?? 0,
      startDate,
      endDate,
    };
  }

  getSales(startDate: string, endDate: string): Observable<SalesReportResponse> {
    return this.http
      .post<ApiResponse<SalesReportResponse>>(`${this.apiUrl}/sales`, this.buildRequest(startDate, endDate))
      .pipe(map((response) => response.data));
  }

  getStock(startDate: string, endDate: string): Observable<StockReportResponse> {
    return this.http
      .post<ApiResponse<StockReportResponse>>(`${this.apiUrl}/stock`, this.buildRequest(startDate, endDate))
      .pipe(map((response) => response.data));
  }

  getFinancial(startDate: string, endDate: string): Observable<FinancialReportResponse> {
    return this.http
      .post<ApiResponse<FinancialReportResponse>>(
        `${this.apiUrl}/financial`,
        this.buildRequest(startDate, endDate)
      )
      .pipe(map((response) => response.data));
  }

  getExpiry(startDate: string, endDate: string): Observable<ExpiryReportResponse> {
    return this.http
      .post<ApiResponse<ExpiryReportResponse>>(`${this.apiUrl}/expiry`, this.buildRequest(startDate, endDate))
      .pipe(map((response) => response.data));
  }
}
