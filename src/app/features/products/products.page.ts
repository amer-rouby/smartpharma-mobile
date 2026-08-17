import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonFab,
  IonFabButton,
  IonFabList,
  IonIcon,
  IonBadge,
  IonButton,
  AlertController,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { scanOutline, cubeOutline, addOutline, createOutline, trashOutline } from 'ionicons/icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { PagedList } from '../../core/utils/paged-list';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonFab,
    IonFabButton,
    IonFabList,
    IonIcon,
    IonBadge,
    IonButton,
  ],
})
export class ProductsPage implements ViewWillEnter {
  private readonly productService = inject(ProductService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly alertController = inject(AlertController);
  private readonly toastService = inject(ToastService);
  private readonly translate = inject(TranslateService);

  readonly list = new PagedList<Product>((page, size, search) =>
    this.productService.getProductsPaged(page, size, search)
  );
  readonly canManage = this.authService.hasRole('ADMIN', 'PHARMACIST');
  readonly canDelete = this.authService.hasRole('ADMIN');

  constructor() {
    addIcons({ scanOutline, cubeOutline, addOutline, createOutline, trashOutline });
  }

  // Ionic keeps this page's component alive in the tab stack, so returning to
  // it after adding/editing a product (a different route) doesn't re-run
  // ngOnInit - this fires on every entry, including the first, and reloads.
  ionViewWillEnter(): void {
    this.list.load(true);
  }

  stockColor(product: Product): string {
    if (product.totalStock <= 0) return 'danger';
    if (product.totalStock <= product.minStockLevel) return 'warning';
    return 'success';
  }

  async onScanBarcode(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      this.toastService.show(this.translate.instant('products.scanUnavailable'));
      return;
    }

    try {
      const { BarcodeScanner } = await import('@capacitor-mlkit/barcode-scanning');
      const { camera } = await BarcodeScanner.requestPermissions();
      if (camera !== 'granted' && camera !== 'limited') {
        this.toastService.show(this.translate.instant('products.cameraPermission'));
        return;
      }

      const { barcodes } = await BarcodeScanner.scan();
      const code = barcodes[0]?.rawValue;
      if (!code) {
        return;
      }

      this.productService.getByBarcode(code).subscribe({
        next: (product) => {
          if (product) {
            this.list.searchTerm.set(product.name);
            this.list.items.set([product]);
          } else {
            this.toastService.show(this.translate.instant('products.noProductForBarcode'));
          }
        },
      });
    } catch (error) {
      this.toastService.show(this.translate.instant('products.scanError'));
    }
  }

  addProduct(): void {
    this.router.navigate(['/tabs/products/new']);
  }

  editProduct(product: Product): void {
    this.router.navigate(['/tabs/products', product.id, 'edit']);
  }

  async deleteProduct(product: Product): Promise<void> {
    const alert = await this.alertController.create({
      header: this.translate.instant('products.deleteConfirmTitle'),
      message: this.translate.instant('products.deleteConfirmMessage', { name: product.name }),
      buttons: [
        { text: this.translate.instant('common.cancel'), role: 'cancel' },
        {
          text: this.translate.instant('common.delete'),
          role: 'destructive',
          handler: () => {
            this.productService.deleteProduct(product.id).subscribe({
              next: () => {
                this.list.items.update((items) => items.filter((p) => p.id !== product.id));
              },
              error: () => this.toastService.show(this.translate.instant('products.deleteFailed')),
            });
          },
        },
      ],
    });
    await alert.present();
  }
}
