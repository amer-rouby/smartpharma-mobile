import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonSpinner,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { PurchaseOrderService } from '../../../core/services/purchase-order.service';
import { PurchaseOrder, STATUS_COLORS, STATUS_LABEL_KEYS } from '../../../core/models/purchase-order.model';

@Component({
  selector: 'app-purchase-detail',
  standalone: true,
  templateUrl: './purchase-detail.page.html',
  styleUrls: ['./purchase-detail.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonSpinner,
    TranslateModule,
  ],
})
export class PurchaseDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly purchaseOrderService = inject(PurchaseOrderService);

  readonly order = signal<PurchaseOrder | null>(null);
  readonly loading = signal(true);
  readonly statusLabelKeys = STATUS_LABEL_KEYS;
  readonly statusColors = STATUS_COLORS;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.purchaseOrderService.getOrder(id).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
