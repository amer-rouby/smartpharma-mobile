import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';
import { Expense, ExpensePage, ExpenseRequest, ExpenseSummary } from '../models/expense.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/expenses`;

  private pharmacyIdParam(): HttpParams {
    return new HttpParams().set('pharmacyId', this.authService.getPharmacyId() ?? '');
  }

  getPage(page: number, size: number): Observable<ExpensePage> {
    const params = this.pharmacyIdParam().set('page', page).set('size', size);
    return this.http
      .get<ApiResponse<ExpensePage>>(this.apiUrl, { params })
      .pipe(map((response) => response.data));
  }

  search(query: string, page: number, size: number): Observable<ExpensePage> {
    const params = this.pharmacyIdParam().set('query', query).set('page', page).set('size', size);
    return this.http
      .get<ApiResponse<ExpensePage>>(`${this.apiUrl}/search`, { params })
      .pipe(map((response) => response.data));
  }

  getSummary(): Observable<ExpenseSummary> {
    return this.http
      .get<ApiResponse<ExpenseSummary>>(`${this.apiUrl}/summary`, { params: this.pharmacyIdParam() })
      .pipe(map((response) => response.data));
  }

  create(request: ExpenseRequest): Observable<Expense> {
    return this.http.post<ApiResponse<Expense>>(this.apiUrl, request).pipe(map((response) => response.data));
  }

  update(id: number, request: ExpenseRequest): Observable<Expense> {
    return this.http
      .put<ApiResponse<Expense>>(`${this.apiUrl}/${id}`, request, { params: this.pharmacyIdParam() })
      .pipe(map((response) => response.data));
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/${id}`, { params: this.pharmacyIdParam() })
      .pipe(map((response) => response.data));
  }
}
