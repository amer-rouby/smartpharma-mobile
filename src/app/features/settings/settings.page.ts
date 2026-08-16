import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonButton,
  IonSpinner,
  ToastController,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NotificationSettingsService } from '../../core/services/notification-settings.service';
import { NotificationSettings } from '../../core/models/notification-settings.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonToggle,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonButton,
    IonSpinner,
  ],
})
export class SettingsPage implements OnInit {
  private readonly notificationSettingsService = inject(NotificationSettingsService);
  private readonly toastController = inject(ToastController);
  private readonly translate = inject(TranslateService);

  readonly settings = signal<NotificationSettings | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);

  ngOnInit(): void {
    this.notificationSettingsService.getSettings().subscribe({
      next: (settings) => {
        this.settings.set(settings);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  save(): void {
    const current = this.settings();
    if (!current) return;

    this.saving.set(true);
    this.notificationSettingsService.updateSettings(current).subscribe({
      next: (updated) => {
        this.settings.set(updated);
        this.saving.set(false);
        this.showToast(this.translate.instant('settings.saveSuccess'));
      },
      error: () => {
        this.saving.set(false);
        this.showToast(this.translate.instant('settings.saveFailed'));
      },
    });
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({ message, duration: 2000, position: 'bottom' });
    await toast.present();
  }
}
