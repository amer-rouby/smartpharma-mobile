import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
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
import { receiptOutline, cartOutline } from 'ionicons/icons';
import { TranslateModule } from '@ngx-translate/core';
import { PurchaseOrderService } from '../../core/services/purchase-order.service';
import { PagedList } from '../../core/utils/paged-list';
import { PurchaseOrder, STATUS_COLORS, STATUS_LABEL_KEYS } from '../../core/models/purchase-order.model';

@Component({
  selector: 'app-purchases',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './purchases.page.html',
  styleUrls: ['./purchases.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonSpinner,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonIcon,
    TranslateModule,
  ],
})
export class PurchasesPage implements ViewWillEnter {
  private readonly purchaseOrderService = inject(PurchaseOrderService);
  private readonly router = inject(Router);

  readonly list = new PagedList<PurchaseOrder>((page, size) => this.purchaseOrderService.getOrders(page, size), 15);
  readonly statusLabelKeys = STATUS_LABEL_KEYS;
  readonly statusColors = STATUS_COLORS;

  constructor() {
    addIcons({ receiptOutline, cartOutline });
  }

  ionViewWillEnter(): void {
    this.list.load(true);
  }

  openOrder(order: PurchaseOrder): void {
    this.router.navigate(['/tabs/purchases', order.id]);
  }
}
