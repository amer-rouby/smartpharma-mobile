import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonSpinner,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonFab,
  IonFabButton,
  IonIcon,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, businessOutline, callOutline } from 'ionicons/icons';
import { TranslateModule } from '@ngx-translate/core';
import { SupplierService } from '../../core/services/supplier.service';
import { AuthService } from '../../core/services/auth.service';
import { PagedList } from '../../core/utils/paged-list';
import { Supplier, SUPPLIER_STATUS_COLORS } from '../../core/models/supplier.model';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './suppliers.page.html',
  styleUrls: ['./suppliers.page.scss'],
  imports: [
    CommonModule,
    TranslateModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonSpinner,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonFab,
    IonFabButton,
    IonIcon,
  ],
})
export class SuppliersPage implements ViewWillEnter {
  private readonly supplierService = inject(SupplierService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Search hits a separate, non-paginated endpoint - wrap its plain array into
  // the same paged shape so PagedList can't ever try to load a second page of it.
  readonly list = new PagedList<Supplier>((page, size, search) =>
    search
      ? this.supplierService
          .search(search)
          .pipe(map((content) => ({ content, totalElements: content.length, totalPages: 1, number: 0, size })))
      : this.supplierService.getPaginated(page, size)
  );
  readonly statusColors = SUPPLIER_STATUS_COLORS;
  readonly canManage = this.authService.hasRole('ADMIN', 'PHARMACIST');

  constructor() {
    addIcons({ addOutline, businessOutline, callOutline });
  }

  ionViewWillEnter(): void {
    this.list.load(true);
  }

  addSupplier(): void {
    this.router.navigate(['/tabs/suppliers/new']);
  }

  openSupplier(supplier: Supplier): void {
    this.router.navigate(['/tabs/suppliers', supplier.id, 'edit'], { state: { supplier } });
  }
}
