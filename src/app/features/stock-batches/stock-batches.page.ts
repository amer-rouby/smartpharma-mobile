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
  IonButton,
  IonSpinner,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonFab,
  IonFabButton,
  IonIcon,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, cubeOutline, swapVerticalOutline } from 'ionicons/icons';
import { TranslateModule } from '@ngx-translate/core';
import { StockBatchService } from '../../core/services/stock-batch.service';
import { AuthService } from '../../core/services/auth.service';
import { PagedList } from '../../core/utils/paged-list';
import { StockBatch } from '../../core/models/stock-batch.model';

@Component({
  selector: 'app-stock-batches',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stock-batches.page.html',
  styleUrls: ['./stock-batches.page.scss'],
  imports: [
    CommonModule,
    TranslateModule,
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
    IonFab,
    IonFabButton,
    IonIcon,
    IonButton,
  ],
})
export class StockBatchesPage implements ViewWillEnter {
  private readonly stockBatchService = inject(StockBatchService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly list = new PagedList<StockBatch>((page, size) => this.stockBatchService.getBatches(page, size));
  readonly canAdjust = this.authService.hasRole('ADMIN', 'PHARMACIST');

  constructor() {
    addIcons({ addOutline, cubeOutline, swapVerticalOutline });
  }

  ionViewWillEnter(): void {
    this.list.load(true);
  }

  statusColor(batch: StockBatch): string {
    if (batch.isExpired) return 'danger';
    if (batch.isExpiringSoon) return 'warning';
    return 'success';
  }

  addBatch(): void {
    this.router.navigate(['/tabs/stock-batches/new']);
  }

  openBatch(batch: StockBatch): void {
    this.router.navigate(['/tabs/stock-batches', batch.id, 'edit'], { state: { batch } });
  }

  adjustBatch(batch: StockBatch): void {
    this.router.navigate(['/tabs/stock-batches', batch.id, 'adjust'], { state: { batch } });
  }
}
