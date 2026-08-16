import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';
import { NotificationSettings, NotificationSettingsRequest } from '../models/notification-settings.model';

@Injectable({ providedIn: 'root' })
export class NotificationSettingsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/settings/notifications`;

  getSettings(): Observable<NotificationSettings> {
    return this.http
      .get<ApiResponse<NotificationSettings>>(this.apiUrl)
      .pipe(map((response) => response.data));
  }

  updateSettings(request: NotificationSettingsRequest): Observable<NotificationSettings> {
    return this.http
      .put<ApiResponse<NotificationSettings>>(this.apiUrl, request)
      .pipe(map((response) => response.data));
  }
}
