import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  IonIcon,
  IonBadge,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { scanOutline, cubeOutline } from 'ionicons/icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
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
    IonIcon,
    IonBadge,
  ],
})
export class ProductsPage implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly toastController = inject(ToastController);
  private readonly translate = inject(TranslateService);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly searchTerm = signal('');
  readonly page = signal(0);
  readonly hasMore = signal(true);
  readonly pageSize = 20;

  private searchDebounceTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    addIcons({ scanOutline, cubeOutline });
  }

  ngOnInit(): void {
    this.loadProducts(true);
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.page.set(0);
      this.hasMore.set(true);
      this.loadProducts(true);
    }, 400);
  }

  loadProducts(reset: boolean, event?: CustomEvent): void {
    if (reset) {
      this.loading.set(true);
    }
    this.productService.getProductsPaged(this.page(), this.pageSize, this.searchTerm()).subscribe({
      next: (result) => {
        this.products.set(reset ? result.content : [...this.products(), ...result.content]);
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
    this.loadProducts(false, event);
  }

  stockColor(product: Product): string {
    if (product.totalStock <= 0) return 'danger';
    if (product.totalStock <= product.minStockLevel) return 'warning';
    return 'success';
  }

  async onScanBarcode(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      this.showToast(this.translate.instant('products.scanUnavailable'));
      return;
    }

    try {
      const { BarcodeScanner } = await import('@capacitor-mlkit/barcode-scanning');
      const { camera } = await BarcodeScanner.requestPermissions();
      if (camera !== 'granted' && camera !== 'limited') {
        this.showToast(this.translate.instant('products.cameraPermission'));
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
            this.searchTerm.set(product.name);
            this.products.set([product]);
          } else {
            this.showToast(this.translate.instant('products.noProductForBarcode'));
          }
        },
      });
    } catch (error) {
      this.showToast(this.translate.instant('products.scanError'));
    }
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({ message, duration: 2500, position: 'bottom' });
    await toast.present();
  }
}
