import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Capacitor } from '@capacitor/core';
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
import { scanOutline, addOutline, removeOutline, trashOutline, cartOutline } from 'ionicons/icons';
import { ProductService } from '../../core/services/product.service';
import { SaleService } from '../../core/services/sale.service';
import { PharmacySettingsService } from '../../core/services/pharmacy-settings.service';
import { Product } from '../../core/models/product.model';
import { ALL_PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '../../core/models/sale.model';

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
  ],
})
export class PosPage implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly saleService = inject(SaleService);
  private readonly pharmacySettingsService = inject(PharmacySettingsService);
  private readonly toastController = inject(ToastController);

  readonly searchTerm = signal('');
  readonly searchResults = signal<Product[]>([]);
  readonly searching = signal(false);
  readonly cart = signal<CartLine[]>([]);
  readonly discount = signal(0);
  readonly paymentMethod = signal('CASH');
  readonly submitting = signal(false);
  readonly enabledPaymentMethods = signal<string[]>(ALL_PAYMENT_METHODS);

  readonly paymentMethodLabels = PAYMENT_METHOD_LABELS;

  readonly subtotal = computed(() =>
    this.cart().reduce((sum, line) => sum + line.product.sellPrice * line.quantity, 0)
  );
  readonly total = computed(() => Math.max(0, this.subtotal() - this.discount()));

  private searchDebounceTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    addIcons({ scanOutline, addOutline, removeOutline, trashOutline, cartOutline });
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
      this.showToast(`المنتج "${product.name}" نفد من المخزون`);
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
          this.showToast('الكمية وصلت للحد الأقصى المتاح بالمخزون');
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
      this.showToast('المسح بالكاميرا متاح فقط داخل تطبيق الموبايل');
      return;
    }
    try {
      const { BarcodeScanner } = await import('@capacitor-mlkit/barcode-scanning');
      const { camera } = await BarcodeScanner.requestPermissions();
      if (camera !== 'granted' && camera !== 'limited') {
        this.showToast('محتاجين إذن الكاميرا عشان نقدر نمسح الباركود');
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
            this.showToast('مفيش منتج بالباركود ده');
          }
        },
      });
    } catch {
      this.showToast('حصل خطأ أثناء المسح');
    }
  }

  onSubmit(): void {
    if (this.cart().length === 0) {
      this.showToast('السلة فارغة');
      return;
    }
    const prescriptionRequired = this.cart().some((line) => line.product.prescriptionRequired);
    if (prescriptionRequired) {
      this.showToast('يوجد منتج يتطلب وصفة طبية - رفع الوصفة غير مدعوم حاليًا في تطبيق الموبايل');
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
      })
      .subscribe({
        next: (sale) => {
          this.submitting.set(false);
          this.showToast(`تمت عملية البيع بنجاح - فاتورة ${sale.invoiceNumber}`);
          this.cart.set([]);
          this.discount.set(0);
        },
        error: (err) => {
          this.submitting.set(false);
          this.showToast(err?.error?.message || 'فشلت عملية البيع');
        },
      });
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({ message, duration: 2500, position: 'bottom' });
    await toast.present();
  }
}
