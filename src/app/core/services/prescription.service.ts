import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';

export interface PrescriptionUploadResult {
  url: string;
  filename: string;
}

@Injectable({ providedIn: 'root' })
export class PrescriptionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/sales/prescriptions`;

  upload(file: File): Observable<PrescriptionUploadResult> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http
      .post<ApiResponse<PrescriptionUploadResult>>(`${this.apiUrl}/upload`, formData)
      .pipe(map((response) => response.data));
  }
}
