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
  IonButton,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircleOutline, businessOutline, shieldCheckmarkOutline, logOutOutline } from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
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
    IonButton,
  ],
})
export class ProfilePage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly alertController = inject(AlertController);

  readonly user = this.authService.getCurrentUser();

  constructor() {
    addIcons({ personCircleOutline, businessOutline, shieldCheckmarkOutline, logOutOutline });
  }

  async onLogout(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'تسجيل الخروج',
      message: 'هل تريد تسجيل الخروج من الحساب؟',
      buttons: [
        { text: 'إلغاء', role: 'cancel' },
        {
          text: 'خروج',
          role: 'destructive',
          handler: () => {
            this.authService.logout().subscribe(() => {
              this.router.navigate(['/login']);
            });
          },
        },
      ],
    });
    await alert.present();
  }
}
