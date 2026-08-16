import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSpinner,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { swapVerticalOutline } from 'ionicons/icons';
import { TranslateModule } from '@ngx-translate/core';
import { StockMovementService } from '../../core/services/stock-movement.service';
import { StockMovement, StockMovementStats } from '../../core/models/stock-movement.model';

@Component({
  selector: 'app-stock-movements',
  standalone: true,
  templateUrl: './stock-movements.page.html',
  styleUrls: ['./stock-movements.page.scss'],
  imports: [
    CommonModule,
    TranslateModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSpinner,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonIcon,
  ],
})
export class StockMovementsPage implements OnInit {
  private readonly stockMovementService = inject(StockMovementService);

  readonly movements = signal<StockMovement[]>([]);
  readonly stats = signal<StockMovementStats | null>(null);
  readonly loading = signal(true);
  readonly page = signal(0);
  readonly hasMore = signal(true);
  readonly pageSize = 20;

  constructor() {
    addIcons({ swapVerticalOutline });
  }

  ngOnInit(): void {
    this.load(true);

    const end = new Date().toISOString().split('T')[0];
    const start = new Date();
    start.setDate(start.getDate() - 30);
    this.stockMovementService.getStats(start.toISOString().split('T')[0], end).subscribe({
      next: (stats) => this.stats.set(stats),
      error: () => {},
    });
  }

  load(reset: boolean, event?: CustomEvent): void {
    if (reset) this.loading.set(true);
    this.stockMovementService.getForPharmacy(this.page(), this.pageSize).subscribe({
      next: (result) => {
        this.movements.set(reset ? result.content : [...this.movements(), ...result.content]);
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

  quantityChange(movement: StockMovement): number {
    return movement.quantityAfter - movement.quantityBefore;
  }

  typeColor(type: string): string {
    if (type === 'STOCK_IN' || type === 'TRANSFER_IN') return 'success';
    if (type === 'STOCK_OUT' || type === 'TRANSFER_OUT' || type === 'EXPIRED' || type === 'DISCARDED')
      return 'danger';
    return 'medium';
  }
}
