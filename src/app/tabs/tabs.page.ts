import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, cartOutline, cubeOutline, alertCircleOutline, menuOutline } from 'ionicons/icons';
import { inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval, startWith, switchMap } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '../core/services/notification.service';

@Component({
  selector: 'app-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge, TranslateModule],
})
export class TabsPage {
  private readonly notificationService = inject(NotificationService);

  // Polls every 60s rather than a live stream (SSE reconnect-on-resume is more
  // fiddly on mobile than on web), which is a fine trade-off for a badge count.
  readonly unreadCount = toSignal(
    interval(60000).pipe(
      startWith(0),
      switchMap(() => this.notificationService.getUnreadCount())
    ),
    { initialValue: 0 }
  );

  constructor() {
    addIcons({ homeOutline, cartOutline, cubeOutline, alertCircleOutline, menuOutline });
  }
}
