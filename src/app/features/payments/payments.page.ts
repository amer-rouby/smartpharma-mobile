import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
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
  IonButton,
  AlertController,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cardOutline, arrowUndoOutline } from 'ionicons/icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PaymentService } from '../../core/services/payment.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { PagedList } from '../../core/utils/paged-list';
import { Payment, PaymentStats } from '../../core/models/payment.model';

@Component({
  selector: 'app-payments',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payments.page.html',
  styleUrls: ['./payments.page.scss'],
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
    IonIcon,
    IonButton,
  ],
})
export class PaymentsPage implements ViewWillEnter {
  private readonly paymentService = inject(PaymentService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly alertController = inject(AlertController);
  private readonly toastService = inject(ToastService);
  private readonly translate = inject(TranslateService);

  readonly list = new PagedList<Payment>((page, size) => this.paymentService.getPage(page, size));
  readonly stats = signal<PaymentStats | null>(null);
  readonly canRefund = this.authService.hasRole('ADMIN', 'PHARMACIST');

  constructor() {
    addIcons({ cardOutline, arrowUndoOutline });
  }

  ionViewWillEnter(): void {
    this.list.load(true);
    this.paymentService.getStats().subscribe({
      next: (stats) => this.stats.set(stats),
      error: () => {},
    });
  }

  openReceipt(payment: Payment): void {
    this.router.navigate(['/tabs/payments', payment.referenceNumber]);
  }

  statusColor(status: string): string {
    if (status === 'COMPLETED') return 'success';
    if (status === 'PENDING') return 'warning';
    if (status === 'REFUNDED') return 'medium';
    return 'danger';
  }

  async refund(payment: Payment): Promise<void> {
    const alert = await this.alertController.create({
      header: this.translate.instant('payments.refundTitle'),
      inputs: [
        {
          name: 'amount',
          type: 'number',
          placeholder: this.translate.instant('payments.refundAmount'),
          value: payment.amount,
          min: 0.01,
          max: payment.amount,
        },
        {
          name: 'reason',
          type: 'text',
          placeholder: this.translate.instant('payments.refundReason'),
        },
      ],
      buttons: [
        { text: this.translate.instant('common.cancel'), role: 'cancel' },
        {
          text: this.translate.instant('payments.refundConfirm'),
          handler: (data) => {
            const amount = Number(data.amount);
            if (!amount || amount <= 0 || amount > payment.amount) {
              this.toastService.show(this.translate.instant('payments.refundInvalidAmount'));
              return false;
            }
            this.paymentService.refund(payment.referenceNumber, amount, data.reason || 'Customer request').subscribe({
              next: (result) => {
                if (result.status === 'COMPLETED') {
                  this.toastService.show(this.translate.instant('payments.refundSuccess'));
                  this.list.load(true);
                } else {
                  this.toastService.show(result.message || this.translate.instant('payments.refundFailed'));
                }
              },
              error: (err) =>
                this.toastService.show(err?.error?.message || this.translate.instant('payments.refundFailed')),
            });
            return true;
          },
        },
      ],
    });
    await alert.present();
  }
}
