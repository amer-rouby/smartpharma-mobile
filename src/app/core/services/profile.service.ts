import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';
import {
  PasswordChangeRequest,
  Profile,
  ProfileImageUploadResult,
  ProfileUpdateRequest,
} from '../models/profile.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/profile`;
  private readonly apiOrigin = environment.apiUrl.replace(/\/api\/?$/, '');

  private userIdParam(): HttpParams {
    return new HttpParams().set('userId', this.authService.getUserId() ?? '');
  }

  getProfile(): Observable<Profile> {
    return this.http
      .get<ApiResponse<Profile>>(this.apiUrl, { params: this.userIdParam() })
      .pipe(map((response) => response.data));
  }

  updateProfile(request: ProfileUpdateRequest): Observable<Profile> {
    return this.http
      .put<ApiResponse<Profile>>(this.apiUrl, request, { params: this.userIdParam() })
      .pipe(map((response) => response.data));
  }

  changePassword(request: PasswordChangeRequest): Observable<Profile> {
    return this.http
      .post<ApiResponse<Profile>>(`${this.apiUrl}/change-password`, request, { params: this.userIdParam() })
      .pipe(map((response) => response.data));
  }

  uploadImage(file: File): Observable<ProfileImageUploadResult> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http
      .post<ApiResponse<ProfileImageUploadResult>>(`${this.apiUrl}/upload-image`, formData)
      .pipe(map((response) => response.data));
  }

  resolveImageUrl(url?: string): string | null {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${this.apiOrigin}${url}`;
  }
}
