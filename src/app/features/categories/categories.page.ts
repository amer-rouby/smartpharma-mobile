import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonSpinner,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonButton,
  AlertController,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, pricetagOutline, trashOutline, createOutline } from 'ionicons/icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CategoryService } from '../../core/services/category.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { PagedList } from '../../core/utils/paged-list';
import { Category } from '../../core/models/category.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
  imports: [
    CommonModule,
    TranslateModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonSpinner,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonFab,
    IonFabButton,
    IonIcon,
    IonButton,
  ],
})
export class CategoriesPage implements ViewWillEnter {
  private readonly categoryService = inject(CategoryService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly alertController = inject(AlertController);
  private readonly toastService = inject(ToastService);
  private readonly translate = inject(TranslateService);

  readonly list = new PagedList<Category>((page, size, search) =>
    this.categoryService.getPage(page, size, search)
  );
  readonly canManage = this.authService.hasRole('ADMIN', 'PHARMACIST');
  readonly canDelete = this.authService.hasRole('ADMIN');

  constructor() {
    addIcons({ addOutline, pricetagOutline, trashOutline, createOutline });
  }

  ionViewWillEnter(): void {
    this.list.load(true);
  }

  addCategory(): void {
    this.router.navigate(['/tabs/categories/new']);
  }

  editCategory(category: Category): void {
    this.router.navigate(['/tabs/categories', category.id, 'edit'], { state: { category } });
  }

  async deleteCategory(category: Category): Promise<void> {
    const alert = await this.alertController.create({
      header: this.translate.instant('categories.deleteConfirmTitle'),
      message: this.translate.instant('categories.deleteConfirmMessage', { name: category.name }),
      buttons: [
        { text: this.translate.instant('common.cancel'), role: 'cancel' },
        {
          text: this.translate.instant('common.delete'),
          role: 'destructive',
          handler: () => {
            this.categoryService.delete(category.id).subscribe({
              next: () => {
                this.list.items.update((items) => items.filter((c) => c.id !== category.id));
              },
              error: () => this.toastService.show(this.translate.instant('categories.deleteFailed')),
            });
          },
        },
      ],
    });
    await alert.present();
  }
}
