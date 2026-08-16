import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkDoneOutline, alertCircleOutline, warningOutline, timeOutline } from 'ionicons/icons';
import { StockAlertService } from '../../core/services/stock-alert.service';
import { StockAlert } from '../../core/models/stock-alert.model';

@Component({
  selector: 'app-stock',
  standalone: true,
  templateUrl: './stock.page.html',
  styleUrls: ['./stock.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonButton,
  ],
})
export class StockPage implements OnInit {
  private readonly stockAlertService = inject(StockAlertService);

  readonly alerts = signal<StockAlert[]>([]);
  readonly loading = signal(true);

  constructor() {
    addIcons({ checkmarkDoneOutline, alertCircleOutline, warningOutline, timeOutline });
  }

  ngOnInit(): void {
    this.load();
  }

  load(event?: CustomEvent): void {
    this.loading.set(true);
    this.stockAlertService.getActiveAlerts().subscribe({
      next: (alerts) => {
        this.alerts.set(alerts);
        this.loading.set(false);
        (event?.target as HTMLIonRefresherElement | undefined)?.complete();
      },
      error: () => {
        this.loading.set(false);
        (event?.target as HTMLIonRefresherElement | undefined)?.complete();
      },
    });
  }

  onRefresh(event: CustomEvent): void {
    this.load(event);
  }

  resolve(alert: StockAlert): void {
    this.stockAlertService.resolveAlert(alert.id).subscribe(() => {
      this.alerts.update((list) => list.filter((a) => a.id !== alert.id));
    });
  }

  iconFor(alertType: string): string {
    if (alertType?.includes('EXPIR')) return 'time-outline';
    if (alertType === 'OUT_OF_STOCK') return 'alert-circle-outline';
    return 'warning-outline';
  }

  colorFor(severity: string): string {
    switch (severity) {
      case 'URGENT':
      case 'CRITICAL':
        return 'danger';
      case 'HIGH':
        return 'warning';
      default:
        return 'medium';
    }
  }
}
