import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';
import { Category, CategoryPage, CategoryRequest } from '../models/category.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/categories`;

  private pharmacyIdParam(): HttpParams {
    return new HttpParams().set('pharmacyId', this.authService.getPharmacyId() ?? '');
  }

  getPage(page: number, size: number, search: string): Observable<CategoryPage> {
    let params = this.pharmacyIdParam().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    return this.http
      .get<ApiResponse<CategoryPage>>(`${this.apiUrl}/page`, { params })
      .pipe(map((response) => response.data));
  }

  create(request: CategoryRequest): Observable<Category> {
    return this.http
      .post<ApiResponse<Category>>(this.apiUrl, request)
      .pipe(map((response) => response.data));
  }

  update(id: number, request: CategoryRequest): Observable<Category> {
    return this.http
      .put<ApiResponse<Category>>(`${this.apiUrl}/${id}`, request, { params: this.pharmacyIdParam() })
      .pipe(map((response) => response.data));
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/${id}`, { params: this.pharmacyIdParam() })
      .pipe(map((response) => response.data));
  }
}
