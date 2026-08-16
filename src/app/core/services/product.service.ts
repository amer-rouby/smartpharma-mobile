import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';
import { PagedResponse, Product } from '../models/product.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/products`;

  getProductsPaged(page: number, size: number, search?: string): Observable<PagedResponse<Product>> {
    const pharmacyId = this.authService.getPharmacyId();
    let params = new HttpParams()
      .set('pharmacyId', pharmacyId ?? '')
      .set('page', page)
      .set('size', size);
    if (search?.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http
      .get<ApiResponse<PagedResponse<Product>>>(`${this.apiUrl}/page`, { params })
      .pipe(map((response) => response.data));
  }

  /** No dedicated barcode-lookup endpoint exists on the backend - /page's `search`
   * param already matches against name, barcode, and scientificName server-side
   * (see ProductRepository.searchAndFilter), so an exact barcode value works as a
   * search term and returns the matching product as the (normally) only result. */
  getByBarcode(barcode: string): Observable<Product | undefined> {
    return this.getProductsPaged(0, 5, barcode).pipe(
      map((page) => page.content.find((p) => p.barcode === barcode) ?? page.content[0])
    );
  }
}
