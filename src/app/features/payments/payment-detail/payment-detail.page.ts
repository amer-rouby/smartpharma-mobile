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
  IonSpinner,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { receiptOutline } from 'ionicons/icons';
import { TranslateModule } from '@ngx-translate/core';
import { PaymentService } from '../../../core/services/payment.service';
import { Payment } from '../../../core/models/payment.model';

@Component({
  selector: 'app-payment-detail',
  standalone: true,
  templateUrl: './payment-detail.page.html',
  styleUrls: ['./payment-detail.page.scss'],
  imports: [
    CommonModule,
    TranslateModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonSpinner,
    IonIcon,
  ],
})
export class PaymentDetailPage implements OnInit {
  private readonly paymentService = inject(PaymentService);
  private readonly route = inject(ActivatedRoute);

  readonly payment = signal<Payment | null>(null);
  readonly loading = signal(true);

  constructor() {
    addIcons({ receiptOutline });
  }

  ngOnInit(): void {
    const reference = this.route.snapshot.paramMap.get('reference')!;
    this.paymentService.getByReference(reference).subscribe({
      next: (payment) => {
        this.payment.set(payment);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  statusColor(status: string): string {
    if (status === 'COMPLETED') return 'success';
    if (status === 'PENDING') return 'warning';
    if (status === 'REFUNDED') return 'medium';
    return 'danger';
  }
}
