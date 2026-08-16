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
  IonFab,
  IonFabButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, cubeOutline } from 'ionicons/icons';
import { TranslateModule } from '@ngx-translate/core';
import { StockBatchService } from '../../core/services/stock-batch.service';
import { StockBatch } from '../../core/models/stock-batch.model';

@Component({
  selector: 'app-stock-batches',
  standalone: true,
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
  ],
})
export class StockBatchesPage implements OnInit {
  private readonly stockBatchService = inject(StockBatchService);
  private readonly router = inject(Router);

  readonly batches = signal<StockBatch[]>([]);
  readonly loading = signal(true);
  readonly page = signal(0);
  readonly hasMore = signal(true);
  readonly pageSize = 20;

  constructor() {
    addIcons({ addOutline, cubeOutline });
  }

  ngOnInit(): void {
    this.load(true);
  }

  load(reset: boolean, event?: CustomEvent): void {
    if (reset) this.loading.set(true);
    this.stockBatchService.getBatches(this.page(), this.pageSize).subscribe({
      next: (result) => {
        this.batches.set(reset ? result.content : [...this.batches(), ...result.content]);
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
}
