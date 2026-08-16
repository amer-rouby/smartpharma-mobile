import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonIcon,
  IonBadge,
  IonNote,
  IonToggle,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  notificationsOutline,
  cartOutline,
  settingsOutline,
  personCircleOutline,
  chevronBackOutline,
  languageOutline,
  moonOutline,
  sunnyOutline,
} from 'ionicons/icons';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval, startWith, switchMap, map } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-more',
  standalone: true,
  templateUrl: './more.page.html',
  styleUrls: ['./more.page.scss'],
  imports: [
    CommonModule,
    TranslateModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonIcon,
    IonBadge,
    IonNote,
    IonToggle,
  ],
})
export class MorePage {
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);
  readonly languageService = inject(LanguageService);

  readonly unreadCount = toSignal(
    interval(60000).pipe(
      startWith(0),
      switchMap(() => this.notificationService.getUnreadCount())
    ),
    { initialValue: 0 }
  );

  readonly themeIsDark = toSignal(
    this.themeService.currentTheme$.pipe(map((theme) => theme === 'dark')),
    { initialValue: this.themeService.isDark() }
  );

  readonly userName = () => this.authService.getCurrentUser()?.fullName ?? '';

  constructor() {
    addIcons({
      notificationsOutline,
      cartOutline,
      settingsOutline,
      personCircleOutline,
      chevronBackOutline,
      languageOutline,
      moonOutline,
      sunnyOutline,
    });
  }

  goTo(path: string): void {
    this.router.navigate([path]);
  }

  onThemeToggle(event: CustomEvent): void {
    this.themeService.setTheme((event.detail as { checked: boolean }).checked ? 'dark' : 'light');
  }
}
