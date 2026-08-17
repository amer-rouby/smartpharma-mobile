import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
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
  IonSpinner,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { documentTextOutline } from 'ionicons/icons';
import { TranslateModule } from '@ngx-translate/core';
import { SaleService } from '../../../core/services/sale.service';
import { SaleResponse } from '../../../core/models/sale.model';

@Component({
  selector: 'app-sale-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sale-detail.page.html',
  styleUrls: ['./sale-detail.page.scss'],
  imports: [
    CommonModule,
    TranslateModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner,
    IonIcon,
  ],
})
export class SaleDetailPage implements OnInit {
  private readonly saleService = inject(SaleService);
  private readonly route = inject(ActivatedRoute);

  readonly sale = signal<SaleResponse | null>(null);
  readonly loading = signal(true);

  constructor() {
    addIcons({ documentTextOutline });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.saleService.getSaleById(id).subscribe({
      next: (sale) => {
        this.sale.set(sale);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
