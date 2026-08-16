import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, businessOutline, callOutline } from 'ionicons/icons';
import { TranslateModule } from '@ngx-translate/core';
import { SupplierService } from '../../core/services/supplier.service';
import { AuthService } from '../../core/services/auth.service';
import { Supplier, SUPPLIER_STATUS_COLORS } from '../../core/models/supplier.model';

@Component({
  selector: 'app-suppliers',
  standalone: true,
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
export class SuppliersPage implements OnInit {
  private readonly supplierService = inject(SupplierService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly suppliers = signal<Supplier[]>([]);
  readonly loading = signal(true);
  readonly searchTerm = signal('');
  readonly page = signal(0);
  readonly hasMore = signal(true);
  readonly pageSize = 20;
  readonly statusColors = SUPPLIER_STATUS_COLORS;
  readonly canManage = this.authService.hasRole('ADMIN', 'PHARMACIST');

  private searchDebounceTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    addIcons({ addOutline, businessOutline, callOutline });
  }

  ngOnInit(): void {
    this.loadPage(true);
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      if (!value?.trim()) {
        this.page.set(0);
        this.hasMore.set(true);
        this.loadPage(true);
        return;
      }
      this.loading.set(true);
      this.supplierService.search(value).subscribe({
        next: (results) => {
          this.suppliers.set(results);
          this.hasMore.set(false);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    }, 350);
  }

  loadPage(reset: boolean, event?: CustomEvent): void {
    if (reset) this.loading.set(true);
    this.supplierService.getPaginated(this.page(), this.pageSize).subscribe({
      next: (result) => {
        this.suppliers.set(reset ? result.content : [...this.suppliers(), ...result.content]);
        this.hasMore.set(this.page() + 1 < result.totalPages);
        this.loading.set(false);
        (event?.target as HTMLIonInfiniteScrollElement | undefined)?.complete();
      },
      error: () => {
        this.loading.set(false);
        (event?.target as HTMLIonInfiniteScrollElement | undefined)?.complete();
      },
    });
  }

  loadMore(event: CustomEvent): void {
    if (!this.hasMore() || this.searchTerm()) {
      (event.target as HTMLIonInfiniteScrollElement).complete();
      return;
    }
    this.page.update((p) => p + 1);
    this.loadPage(false, event);
  }

  addSupplier(): void {
    this.router.navigate(['/tabs/suppliers/new']);
  }

  openSupplier(supplier: Supplier): void {
    this.router.navigate(['/tabs/suppliers', supplier.id, 'edit'], { state: { supplier } });
  }
}
