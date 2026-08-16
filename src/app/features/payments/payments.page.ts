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
  IonButton,
  AlertController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cardOutline, arrowUndoOutline } from 'ionicons/icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PaymentService } from '../../core/services/payment.service';
import { AuthService } from '../../core/services/auth.service';
import { Payment, PaymentStats } from '../../core/models/payment.model';

@Component({
  selector: 'app-payments',
  standalone: true,
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
export class PaymentsPage implements OnInit {
  private readonly paymentService = inject(PaymentService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly alertController = inject(AlertController);
  private readonly toastController = inject(ToastController);
  private readonly translate = inject(TranslateService);

  readonly payments = signal<Payment[]>([]);
  readonly stats = signal<PaymentStats | null>(null);
  readonly loading = signal(true);
  readonly page = signal(0);
  readonly hasMore = signal(true);
  readonly pageSize = 20;
  readonly canRefund = this.authService.hasRole('ADMIN', 'PHARMACIST');

  constructor() {
    addIcons({ cardOutline, arrowUndoOutline });
  }

  ngOnInit(): void {
    this.load(true);
    this.paymentService.getStats().subscribe({
      next: (stats) => this.stats.set(stats),
      error: () => {},
    });
  }

  openReceipt(payment: Payment): void {
    this.router.navigate(['/tabs/payments', payment.referenceNumber]);
  }

  load(reset: boolean, event?: CustomEvent): void {
    if (reset) this.loading.set(true);
    this.paymentService.getPage(this.page(), this.pageSize).subscribe({
      next: (result) => {
        this.payments.set(reset ? result.content : [...this.payments(), ...result.content]);
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
              this.showToast(this.translate.instant('payments.refundInvalidAmount'));
              return false;
            }
            this.paymentService.refund(payment.referenceNumber, amount, data.reason || 'Customer request').subscribe({
              next: (result) => {
                if (result.status === 'COMPLETED') {
                  this.showToast(this.translate.instant('payments.refundSuccess'));
                  this.load(true);
                } else {
                  this.showToast(result.message || this.translate.instant('payments.refundFailed'));
                }
              },
              error: (err) => this.showToast(err?.error?.message || this.translate.instant('payments.refundFailed')),
            });
            return true;
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
