import { Component, inject } from '@angular/core';
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
  IonIcon,
  IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  notificationsOutline,
  cartOutline,
  settingsOutline,
  personCircleOutline,
  chevronBackOutline,
} from 'ionicons/icons';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval, startWith, switchMap } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-more',
  standalone: true,
  templateUrl: './more.page.html',
  styleUrls: ['./more.page.scss'],
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonIcon, IonBadge],
})
export class MorePage {
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly unreadCount = toSignal(
    interval(60000).pipe(
      startWith(0),
      switchMap(() => this.notificationService.getUnreadCount())
    ),
    { initialValue: 0 }
  );

  readonly userName = () => this.authService.getCurrentUser()?.fullName ?? '';

  constructor() {
    addIcons({ notificationsOutline, cartOutline, settingsOutline, personCircleOutline, chevronBackOutline });
  }

  goTo(path: string): void {
    this.router.navigate([path]);
  }
}
