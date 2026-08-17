import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
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
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { swapVerticalOutline } from 'ionicons/icons';
import { TranslateModule } from '@ngx-translate/core';
import { StockMovementService } from '../../core/services/stock-movement.service';
import { PagedList } from '../../core/utils/paged-list';
import { StockMovement, StockMovementStats } from '../../core/models/stock-movement.model';

@Component({
  selector: 'app-stock-movements',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
export class StockMovementsPage implements ViewWillEnter {
  private readonly stockMovementService = inject(StockMovementService);

  readonly list = new PagedList<StockMovement>((page, size) => this.stockMovementService.getForPharmacy(page, size));
  readonly stats = signal<StockMovementStats | null>(null);

  constructor() {
    addIcons({ swapVerticalOutline });
  }

  ionViewWillEnter(): void {
    this.list.load(true);

    const end = new Date().toISOString().split('T')[0];
    const start = new Date();
    start.setDate(start.getDate() - 30);
    this.stockMovementService.getStats(start.toISOString().split('T')[0], end).subscribe({
      next: (stats) => this.stats.set(stats),
      error: () => {},
    });
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
