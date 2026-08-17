import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastController = inject(ToastController);

  async show(message: string, duration = 2500): Promise<void> {
    const toast = await this.toastController.create({ message, duration, position: 'bottom' });
    await toast.present();
  }
}
