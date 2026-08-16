import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  notificationsOffOutline,
  warningOutline,
  closeCircleOutline,
  checkmarkCircleOutline,
  receiptOutline,
  cardOutline,
  serverOutline,
  shieldOutline,
  informationCircleOutline,
} from 'ionicons/icons';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationModel } from '../../core/models/notification.model';

const TYPE_ICONS: Record<string, string> = {
  LOW_STOCK: 'warning-outline',
  OUT_OF_STOCK: 'close-circle-outline',
  EXPIRY_WARNING: 'warning-outline',
  EXPIRED: 'close-circle-outline',
  SALE_COMPLETED: 'checkmark-circle-outline',
  LARGE_SALE: 'checkmark-circle-outline',
  EXPENSE_ADDED: 'receipt-outline',
  LARGE_EXPENSE: 'receipt-outline',
  BACKUP_REMINDER: 'server-outline',
  SECURITY_ALERT: 'shield-outline',
  SYSTEM: 'information-circle-outline',
};

@Component({
  selector: 'app-notifications',
  standalone: true,
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    TranslateModule,
  ],
})
export class NotificationsPage implements OnInit {
  private readonly notificationService = inject(NotificationService);

  readonly notifications = signal<NotificationModel[]>([]);
  readonly loading = signal(true);

  constructor() {
    addIcons({
      notificationsOffOutline,
      warningOutline,
      closeCircleOutline,
      checkmarkCircleOutline,
      receiptOutline,
      cardOutline,
      serverOutline,
      shieldOutline,
      informationCircleOutline,
    });
  }

  ngOnInit(): void {
    this.load();
  }

  load(event?: CustomEvent): void {
    this.loading.set(true);
    this.notificationService.getUnreadNotifications().subscribe({
      next: (list) => {
        this.notifications.set(list);
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

  markAsRead(notification: NotificationModel): void {
    this.notificationService.markAsRead(notification.id).subscribe(() => {
      this.notifications.update((list) => list.filter((n) => n.id !== notification.id));
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.set([]);
    });
  }

  iconFor(type: string): string {
    return TYPE_ICONS[type] ?? 'information-circle-outline';
  }

  priorityColor(priority: string): string {
    switch (priority) {
      case 'URGENT':
        return 'danger';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'primary';
      default:
        return 'medium';
    }
  }
}
