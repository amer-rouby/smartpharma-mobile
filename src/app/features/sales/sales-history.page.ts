import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  IonIcon,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { receiptOutline } from 'ionicons/icons';
import { TranslateModule } from '@ngx-translate/core';
import { SaleService } from '../../core/services/sale.service';
import { PagedList } from '../../core/utils/paged-list';
import { SaleResponse } from '../../core/models/sale.model';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
export class SalesHistoryPage implements ViewWillEnter {
  private readonly saleService = inject(SaleService);
  private readonly router = inject(Router);

  // The search endpoint doesn't take page/size params, so it can only ever
  // return a single page - capping totalPages to 1 stops loadMore from firing
  // a second, identical request while a search term is active.
  readonly list = new PagedList<SaleResponse>((page, size, search) =>
    search
      ? this.saleService.searchSales(search).pipe(map((result) => ({ ...result, totalPages: 1 })))
      : this.saleService.getSalesPaged(page, size)
  );

  constructor() {
    addIcons({ receiptOutline });
  }

  ionViewWillEnter(): void {
    this.list.load(true);
  }

  openSale(sale: SaleResponse): void {
    this.router.navigate(['/tabs/sales', sale.id]);
  }
}
