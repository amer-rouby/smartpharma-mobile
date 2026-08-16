import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';
import { StaffUser, StaffUserRequest } from '../models/user-management.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  private pharmacyIdParam(): HttpParams {
    return new HttpParams().set('pharmacyId', this.authService.getPharmacyId() ?? '');
  }

  getAll(): Observable<StaffUser[]> {
    return this.http
      .get<ApiResponse<StaffUser[]>>(this.apiUrl, { params: this.pharmacyIdParam() })
      .pipe(map((response) => response.data ?? []));
  }

  search(query: string): Observable<StaffUser[]> {
    const params = this.pharmacyIdParam().set('query', query);
    return this.http
      .get<ApiResponse<StaffUser[]>>(`${this.apiUrl}/search`, { params })
      .pipe(map((response) => response.data ?? []));
  }

  create(request: StaffUserRequest): Observable<StaffUser> {
    return this.http.post<ApiResponse<StaffUser>>(this.apiUrl, request).pipe(map((response) => response.data));
  }

  update(id: number, request: StaffUserRequest): Observable<StaffUser> {
    return this.http
      .put<ApiResponse<StaffUser>>(`${this.apiUrl}/${id}`, request, { params: this.pharmacyIdParam() })
      .pipe(map((response) => response.data));
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/${id}`, { params: this.pharmacyIdParam() })
      .pipe(map((response) => response.data));
  }
}
