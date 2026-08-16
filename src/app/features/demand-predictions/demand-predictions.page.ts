import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonSpinner,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonIcon,
  AlertController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  analyticsOutline,
  trendingUpOutline,
  trendingDownOutline,
  removeOutline,
  cartOutline,
  trashOutline,
  refreshOutline,
} from 'ionicons/icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DemandPredictionService } from '../../core/services/demand-prediction.service';
import { DemandPrediction, PredictionStats } from '../../core/models/demand-prediction.model';

@Component({
  selector: 'app-demand-predictions',
  standalone: true,
  templateUrl: './demand-predictions.page.html',
  styleUrls: ['./demand-predictions.page.scss'],
  imports: [
    CommonModule,
    TranslateModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonSpinner,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonIcon,
  ],
})
export class DemandPredictionsPage implements OnInit {
  private readonly predictionService = inject(DemandPredictionService);
  private readonly alertController = inject(AlertController);
  private readonly toastController = inject(ToastController);
  private readonly translate = inject(TranslateService);

  readonly predictions = signal<DemandPrediction[]>([]);
  readonly stats = signal<PredictionStats | null>(null);
  readonly loading = signal(true);
  readonly generating = signal(false);
  readonly page = signal(0);
  readonly hasMore = signal(true);
  readonly pageSize = 20;

  constructor() {
    addIcons({
      analyticsOutline,
      trendingUpOutline,
      trendingDownOutline,
      removeOutline,
      cartOutline,
      trashOutline,
      refreshOutline,
    });
  }

  ngOnInit(): void {
    this.load(true);
    this.predictionService.getAccuracy().subscribe({
      next: (stats) => this.stats.set(stats),
      error: () => {},
    });
  }

  load(reset: boolean, event?: CustomEvent): void {
    if (reset) this.loading.set(true);
    this.predictionService.getPage(this.page(), this.pageSize).subscribe({
      next: (result) => {
        this.predictions.set(reset ? result.content : [...this.predictions(), ...result.content]);
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

  trendIcon(trend: string): string {
    if (trend === 'increasing') return 'trending-up-outline';
    if (trend === 'decreasing') return 'trending-down-outline';
    return 'remove-outline';
  }

  trendColor(trend: string): string {
    if (trend === 'increasing') return 'success';
    if (trend === 'decreasing') return 'danger';
    return 'medium';
  }

  generate(): void {
    this.generating.set(true);
    this.predictionService.generate().subscribe({
      next: () => {
        this.generating.set(false);
        this.page.set(0);
        this.load(true);
        this.showToast(this.translate.instant('demandPrediction.generateSuccess'));
      },
      error: () => {
        this.generating.set(false);
        this.showToast(this.translate.instant('demandPrediction.generateFailed'));
      },
    });
  }

  createPurchase(prediction: DemandPrediction): void {
    this.predictionService.createPurchase(prediction.predictionId).subscribe({
      next: (result) => {
        if (result.status === 'NO_ORDER_NEEDED') {
          this.showToast(this.translate.instant('demandPrediction.noOrderNeeded'));
        } else {
          this.showToast(this.translate.instant('demandPrediction.purchaseCreated', { order: result.orderNumber }));
        }
      },
      error: () => this.showToast(this.translate.instant('demandPrediction.purchaseFailed')),
    });
  }

  async deletePrediction(prediction: DemandPrediction): Promise<void> {
    const alert = await this.alertController.create({
      header: this.translate.instant('demandPrediction.deleteConfirmTitle'),
      buttons: [
        { text: this.translate.instant('common.cancel'), role: 'cancel' },
        {
          text: this.translate.instant('common.delete'),
          role: 'destructive',
          handler: () => {
            this.predictionService.delete(prediction.predictionId).subscribe(() => {
              this.predictions.update((list) => list.filter((p) => p.predictionId !== prediction.predictionId));
            });
          },
        },
      ],
    });
    await alert.present();
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({ message, duration: 2500, position: 'bottom' });
    await toast.present();
  }
}
