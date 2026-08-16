import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonBadge,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonFooter,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  scanOutline,
  addOutline,
  removeOutline,
  trashOutline,
  cartOutline,
  cameraOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
} from 'ionicons/icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProductService } from '../../core/services/product.service';
import { SaleService } from '../../core/services/sale.service';
import { PharmacySettingsService } from '../../core/services/pharmacy-settings.service';
import { PrescriptionService } from '../../core/services/prescription.service';
import { Product } from '../../core/models/product.model';
import { ALL_PAYMENT_METHODS, PAYMENT_METHOD_KEYS } from '../../core/models/sale.model';

interface CartLine {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-pos',
  standalone: true,
  templateUrl: './pos.page.html',
  styleUrls: ['./pos.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonContent,
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonBadge,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonFooter,
    TranslateModule,
  ],
})
export class PosPage implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly saleService = inject(SaleService);
  private readonly pharmacySettingsService = inject(PharmacySettingsService);
  private readonly prescriptionService = inject(PrescriptionService);
  private readonly toastController = inject(ToastController);
  private readonly translate = inject(TranslateService);

  readonly searchTerm = signal('');
  readonly searchResults = signal<Product[]>([]);
  readonly searching = signal(false);
  readonly cart = signal<CartLine[]>([]);
  readonly discount = signal(0);
  readonly paymentMethod = signal('CASH');
  readonly submitting = signal(false);
  readonly enabledPaymentMethods = signal<string[]>(ALL_PAYMENT_METHODS);
  readonly prescriptionImageUrl = signal<string | null>(null);
  readonly prescriptionUploading = signal(false);

  readonly paymentMethodKeys = PAYMENT_METHOD_KEYS;

  readonly subtotal = computed(() =>
    this.cart().reduce((sum, line) => sum + line.product.sellPrice * line.quantity, 0)
  );
  readonly total = computed(() => Math.max(0, this.subtotal() - this.discount()));
  readonly hasPrescriptionRequiredItem = computed(() =>
    this.cart().some((line) => line.product.prescriptionRequired)
  );

  private searchDebounceTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    addIcons({
      scanOutline,
      addOutline,
      removeOutline,
      trashOutline,
      cartOutline,
      cameraOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
    });
  }

  ngOnInit(): void {
    this.pharmacySettingsService.getSettings().subscribe({
      next: (settings) => {
        const enabled = settings.enabledPaymentMethods
          ? settings.enabledPaymentMethods.split(',').map((m) => m.trim()).filter(Boolean)
          : ALL_PAYMENT_METHODS;
        this.enabledPaymentMethods.set(enabled);
        if (!enabled.includes(this.paymentMethod())) {
          this.paymentMethod.set(enabled[0] ?? 'CASH');
        }
      },
      error: () => {
        // Keep the full default list if settings can't be loaded - better to let
        // the user try than to silently block checkout entirely.
      },
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    clearTimeout(this.searchDebounceTimer);
    if (!value?.trim()) {
      this.searchResults.set([]);
      return;
    }
    this.searchDebounceTimer = setTimeout(() => {
      this.searching.set(true);
      this.productService.getProductsPaged(0, 15, value).subscribe({
        next: (result) => {
          this.searchResults.set(result.content);
          this.searching.set(false);
        },
        error: () => this.searching.set(false),
      });
    }, 350);
  }

  addToCart(product: Product): void {
    if (product.totalStock <= 0) {
      this.showToast(this.translate.instant('pos.outOfStockProduct', { name: product.name }));
      return;
    }
    const existing = this.cart().find((line) => line.product.id === product.id);
    if (existing) {
      this.incrementLine(product.id);
    } else {
      this.cart.update((lines) => [...lines, { product, quantity: 1 }]);
    }
    this.searchTerm.set('');
    this.searchResults.set([]);
  }

  incrementLine(productId: number): void {
    this.cart.update((lines) =>
      lines.map((line) => {
        if (line.product.id !== productId) return line;
        if (line.quantity >= line.product.totalStock) {
          this.showToast(this.translate.instant('pos.maxQuantity'));
          return line;
        }
        return { ...line, quantity: line.quantity + 1 };
      })
    );
  }

  decrementLine(productId: number): void {
    this.cart.update((lines) =>
      lines
        .map((line) => (line.product.id === productId ? { ...line, quantity: line.quantity - 1 } : line))
        .filter((line) => line.quantity > 0)
    );
  }

  removeLine(productId: number): void {
    this.cart.update((lines) => lines.filter((line) => line.product.id !== productId));
  }

  async onScanBarcode(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      this.showToast(this.translate.instant('pos.scanUnavailable'));
      return;
    }
    try {
      const { BarcodeScanner } = await import('@capacitor-mlkit/barcode-scanning');
      const { camera } = await BarcodeScanner.requestPermissions();
      if (camera !== 'granted' && camera !== 'limited') {
        this.showToast(this.translate.instant('pos.cameraPermission'));
        return;
      }
      const { barcodes } = await BarcodeScanner.scan();
      const code = barcodes[0]?.rawValue;
      if (!code) return;

      this.productService.getByBarcode(code).subscribe({
        next: (product) => {
          if (product) {
            this.addToCart(product);
          } else {
            this.showToast(this.translate.instant('pos.noProductForBarcode'));
          }
        },
      });
    } catch {
      this.showToast(this.translate.instant('pos.scanError'));
    }
  }

  async onCapturePrescription(): Promise<void> {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt,
        quality: 80,
      });
      if (!photo.webPath) return;

      const blob = await (await fetch(photo.webPath)).blob();
      const ext = photo.format || 'jpeg';
      const file = new File([blob], `prescription-${Date.now()}.${ext}`, { type: blob.type || `image/${ext}` });

      this.prescriptionUploading.set(true);
      this.prescriptionService.upload(file).subscribe({
        next: (result) => {
          this.prescriptionImageUrl.set(result.url);
          this.prescriptionUploading.set(false);
        },
        error: () => {
          this.prescriptionUploading.set(false);
          this.showToast(this.translate.instant('pos.prescriptionUploadFailed'));
        },
      });
    } catch {
      // User cancelled the camera/gallery picker - nothing to do.
    }
  }

  removePrescription(): void {
    this.prescriptionImageUrl.set(null);
  }

  onSubmit(): void {
    if (this.cart().length === 0) {
      this.showToast(this.translate.instant('pos.cartEmpty'));
      return;
    }
    if (this.hasPrescriptionRequiredItem() && !this.prescriptionImageUrl()) {
      this.showToast(this.translate.instant('pos.prescriptionRequired'));
      return;
    }

    this.submitting.set(true);
    this.saleService
      .createSale({
        pharmacyId: 0, // overwritten by the query param + backend anyway
        items: this.cart().map((line) => ({
          productId: line.product.id,
          quantity: line.quantity,
          unitPrice: line.product.sellPrice,
        })),
        paymentMethod: this.paymentMethod(),
        discountAmount: this.discount(),
        totalAmount: this.total(),
        prescriptionImageUrl: this.prescriptionImageUrl() ?? undefined,
      })
      .subscribe({
        next: (sale) => {
          this.submitting.set(false);
          this.showToast(this.translate.instant('pos.saleSuccess', { invoice: sale.invoiceNumber }));
          this.cart.set([]);
          this.discount.set(0);
          this.prescriptionImageUrl.set(null);
        },
        error: (err) => {
          this.submitting.set(false);
          this.showToast(err?.error?.message || this.translate.instant('pos.saleFailed'));
        },
      });
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({ message, duration: 2500, position: 'bottom' });
    await toast.present();
  }
}
