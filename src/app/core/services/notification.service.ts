import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';
import { NotificationModel } from '../models/notification.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/notifications`;

  private commonParams(): HttpParams {
    return new HttpParams().set('pharmacyId', this.authService.getPharmacyId() ?? '');
  }

  getUnreadNotifications(): Observable<NotificationModel[]> {
    return this.http
      .get<ApiResponse<NotificationModel[]>>(`${this.apiUrl}/unread`, { params: this.commonParams() })
      .pipe(map((response) => response.data ?? []));
  }

  getUnreadCount(): Observable<number> {
    return this.http
      .get<ApiResponse<number>>(`${this.apiUrl}/unread-count`, { params: this.commonParams() })
      .pipe(map((response) => response.data ?? 0));
  }

  markAsRead(id: number): Observable<NotificationModel> {
    return this.http
      .put<ApiResponse<NotificationModel>>(`${this.apiUrl}/${id}/read`, {})
      .pipe(map((response) => response.data));
  }

  markAllAsRead(): Observable<number> {
    return this.http
      .post<ApiResponse<number>>(`${this.apiUrl}/read-all`, {}, { params: this.commonParams() })
      .pipe(map((response) => response.data ?? 0));
  }
}
