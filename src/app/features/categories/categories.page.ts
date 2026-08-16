import { Component, inject, signal, OnInit } from '@angular/core';
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
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, pricetagOutline, trashOutline, createOutline } from 'ionicons/icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CategoryService } from '../../core/services/category.service';
import { AuthService } from '../../core/services/auth.service';
import { Category } from '../../core/models/category.model';

@Component({
  selector: 'app-categories',
  standalone: true,
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
export class CategoriesPage implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly alertController = inject(AlertController);
  private readonly toastController = inject(ToastController);
  private readonly translate = inject(TranslateService);

  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly searchTerm = signal('');
  readonly page = signal(0);
  readonly hasMore = signal(true);
  readonly pageSize = 20;
  readonly canManage = this.authService.hasRole('ADMIN', 'PHARMACIST');
  readonly canDelete = this.authService.hasRole('ADMIN');

  private searchDebounceTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    addIcons({ addOutline, pricetagOutline, trashOutline, createOutline });
  }

  ngOnInit(): void {
    this.load(true);
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.page.set(0);
      this.hasMore.set(true);
      this.load(true);
    }, 350);
  }

  load(reset: boolean, event?: CustomEvent): void {
    if (reset) this.loading.set(true);
    this.categoryService.getPage(this.page(), this.pageSize, this.searchTerm()).subscribe({
      next: (result) => {
        this.categories.set(reset ? result.content : [...this.categories(), ...result.content]);
        this.hasMore.set(this.page() + 1 < result.totalPages);
        this.loading.set(false);
        (event?.target as HTMLIonInfiniteScrollElement | undefined)?.complete();
      },
      error: () => {
        this.loading.set(false);
        (event?.target as HTMLIonInfiniteScrollElement | undefined)?.complete();
      },
    });
  }

  loadMore(event: CustomEvent): void {
    if (!this.hasMore()) {
      (event.target as HTMLIonInfiniteScrollElement).complete();
      return;
    }
    this.page.update((p) => p + 1);
    this.load(false, event);
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
                this.categories.update((list) => list.filter((c) => c.id !== category.id));
              },
              error: () => this.showToast(this.translate.instant('categories.deleteFailed')),
            });
          },
        },
      ],
    });
    await alert.present();
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({ message, duration: 2500, position: 'bottom' });
    await toast.present();
  }
}
