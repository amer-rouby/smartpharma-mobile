import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
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
  ViewWillEnter,
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
import { ToastService } from '../../core/services/toast.service';
import { PagedList } from '../../core/utils/paged-list';
import { DemandPrediction, PredictionStats } from '../../core/models/demand-prediction.model';

@Component({
  selector: 'app-demand-predictions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
export class DemandPredictionsPage implements ViewWillEnter {
  private readonly predictionService = inject(DemandPredictionService);
  private readonly alertController = inject(AlertController);
  private readonly toastService = inject(ToastService);
  private readonly translate = inject(TranslateService);

  readonly list = new PagedList<DemandPrediction>((page, size) => this.predictionService.getPage(page, size));
  readonly stats = signal<PredictionStats | null>(null);
  readonly generating = signal(false);

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

  ionViewWillEnter(): void {
    this.list.load(true);
    this.predictionService.getAccuracy().subscribe({
      next: (stats) => this.stats.set(stats),
      error: () => {},
    });
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
        this.list.load(true);
        this.toastService.show(this.translate.instant('demandPrediction.generateSuccess'));
      },
      error: () => {
        this.generating.set(false);
        this.toastService.show(this.translate.instant('demandPrediction.generateFailed'));
      },
    });
  }

  createPurchase(prediction: DemandPrediction): void {
    this.predictionService.createPurchase(prediction.predictionId).subscribe({
      next: (result) => {
        if (result.status === 'NO_ORDER_NEEDED') {
          this.toastService.show(this.translate.instant('demandPrediction.noOrderNeeded'));
        } else {
          this.toastService.show(
            this.translate.instant('demandPrediction.purchaseCreated', { order: result.orderNumber })
          );
        }
      },
      error: () => this.toastService.show(this.translate.instant('demandPrediction.purchaseFailed')),
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
              this.list.items.update((items) => items.filter((p) => p.predictionId !== prediction.predictionId));
            });
          },
        },
      ],
    });
    await alert.present();
  }
}
