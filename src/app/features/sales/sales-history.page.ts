import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { receiptOutline } from 'ionicons/icons';
import { TranslateModule } from '@ngx-translate/core';
import { SaleService } from '../../core/services/sale.service';
import { SaleResponse } from '../../core/models/sale.model';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  templateUrl: './sales-history.page.html',
  styleUrls: ['./sales-history.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
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
    IonIcon,
  ],
})
export class SalesHistoryPage implements OnInit {
  private readonly saleService = inject(SaleService);
  private readonly router = inject(Router);

  readonly sales = signal<SaleResponse[]>([]);
  readonly loading = signal(true);
  readonly searchTerm = signal('');
  readonly page = signal(0);
  readonly hasMore = signal(true);
  readonly pageSize = 20;

  private searchDebounceTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    addIcons({ receiptOutline });
  }

  ngOnInit(): void {
    this.load(true);
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.page.set(0);
      this.hasMore.set(true);
      this.load(true);
    }, 400);
  }

  load(reset: boolean, event?: CustomEvent): void {
    if (reset) this.loading.set(true);
    const search = this.searchTerm().trim();
    // The search endpoint doesn't take page/size params, so it can only ever
    // return a single page - no infinite scroll continuation while searching.
    const request$ = search
      ? this.saleService.searchSales(search)
      : this.saleService.getSalesPaged(this.page(), this.pageSize);

    request$.subscribe({
      next: (result) => {
        this.sales.set(reset ? result.content : [...this.sales(), ...result.content]);
        this.hasMore.set(search ? false : this.page() + 1 < result.totalPages);
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
    if (!this.hasMore()) {
      (event.target as HTMLIonInfiniteScrollElement).complete();
      return;
    }
    this.page.update((p) => p + 1);
    this.load(false, event);
  }

  openSale(sale: SaleResponse): void {
    this.router.navigate(['/tabs/sales', sale.id]);
  }
}
