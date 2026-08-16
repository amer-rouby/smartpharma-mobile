import { Component, inject, signal, OnInit } from '@angular/core';
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
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { receiptOutline, cartOutline } from 'ionicons/icons';
import { PurchaseOrderService } from '../../core/services/purchase-order.service';
import { PurchaseOrder, STATUS_COLORS, STATUS_LABELS } from '../../core/models/purchase-order.model';

@Component({
  selector: 'app-purchases',
  standalone: true,
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
  ],
})
export class PurchasesPage implements OnInit {
  private readonly purchaseOrderService = inject(PurchaseOrderService);
  private readonly router = inject(Router);

  readonly orders = signal<PurchaseOrder[]>([]);
  readonly loading = signal(true);
  readonly page = signal(0);
  readonly hasMore = signal(true);
  readonly statusLabels = STATUS_LABELS;
  readonly statusColors = STATUS_COLORS;

  constructor() {
    addIcons({ receiptOutline, cartOutline });
  }

  ngOnInit(): void {
    this.load(true);
  }

  load(reset: boolean, event?: CustomEvent): void {
    if (reset) this.loading.set(true);
    this.purchaseOrderService.getOrders(this.page(), 15).subscribe({
      next: (result) => {
        this.orders.set(reset ? result.content : [...this.orders(), ...result.content]);
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
    if (!this.hasMore()) {
      (event.target as HTMLIonInfiniteScrollElement).complete();
      return;
    }
    this.page.update((p) => p + 1);
    this.load(false, event);
  }

  openOrder(order: PurchaseOrder): void {
    this.router.navigate(['/tabs/purchases', order.id]);
  }
}
