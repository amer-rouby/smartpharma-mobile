import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonButton,
  IonSpinner,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { refreshOutline } from 'ionicons/icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { Category } from '../../../core/models/category.model';

const UNIT_TYPES = ['BOX', 'STRIP', 'TABLET', 'BOTTLE', 'TUBE', 'PACKET'] as const;

@Component({
  selector: 'app-product-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-form.page.html',
  styleUrls: ['./product-form.page.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonToggle,
    IonButton,
    IonSpinner,
    IonIcon,
  ],
})
export class ProductFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly translate = inject(TranslateService);

  readonly saving = signal(false);
  readonly loading = signal(false);
  readonly categories = signal<Category[]>([]);
  readonly unitTypes = UNIT_TYPES;
  private editingId: number | null = null;

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    scientificName: [''],
    barcode: [''],
    category: [''],
    unitType: ['BOX'],
    minStockLevel: [10, [Validators.min(0)]],
    prescriptionRequired: [false],
    sellPrice: [0, [Validators.required, Validators.min(0.01)]],
    buyPrice: [0],
    initialStock: [0, [Validators.min(0)]],
    expiryDate: [''],
    manufacturer: [''],
    activeIngredients: [''],
    description: [''],
    usageInstructions: [''],
    storageConditions: [''],
    drugInteractionWarning: [''],
    isControlledSubstance: [false],
  });

  constructor() {
    addIcons({ refreshOutline });
  }

  get isEdit(): boolean {
    return this.editingId !== null;
  }

  ngOnInit(): void {
    this.categoryService.getActiveCategories().subscribe({
      next: (categories) => this.categories.set(categories),
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editingId = Number(idParam);
      this.loadProduct(this.editingId);
    } else {
      this.regenerateBarcode();
    }
  }

  private loadProduct(id: number): void {
    this.loading.set(true);
    this.productService.getProduct(id).subscribe({
      next: (product) => {
        const extra = product.extraAttributes || {};
        this.form.patchValue({
          name: product.name,
          scientificName: product.scientificName || '',
          barcode: product.barcode || '',
          category: product.category || '',
          unitType: product.unitType || 'BOX',
          minStockLevel: product.minStockLevel ?? 10,
          prescriptionRequired: product.prescriptionRequired || false,
          sellPrice: product.sellPrice || 0,
          buyPrice: product.buyPrice || 0,
          manufacturer: (extra['manufacturer'] as string) || '',
          activeIngredients: (extra['activeIngredients'] as string) || '',
          description: (extra['description'] as string) || '',
          usageInstructions: (extra['usageInstructions'] as string) || '',
          storageConditions: (extra['storageConditions'] as string) || '',
          drugInteractionWarning: (extra['drugInteractionWarning'] as string) || '',
          isControlledSubstance: !!extra['isControlledSubstance'],
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.show(this.translate.instant('products.loadFailed'));
        this.router.navigate(['/tabs/products']);
      },
    });
  }

  regenerateBarcode(): void {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.form.patchValue({ barcode: `PH-${timestamp}-${random}` });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;

    if (!this.isEdit && value.initialStock && value.initialStock > 0 && !value.expiryDate) {
      this.toastService.show(this.translate.instant('products.expiryDateRequiredWithStock'));
      return;
    }

    const extraAttributes: Record<string, unknown> = {};
    if (value.manufacturer?.trim()) extraAttributes['manufacturer'] = value.manufacturer.trim();
    if (value.activeIngredients?.trim()) extraAttributes['activeIngredients'] = value.activeIngredients.trim();
    if (value.description?.trim()) extraAttributes['description'] = value.description.trim();
    if (value.usageInstructions?.trim()) extraAttributes['usageInstructions'] = value.usageInstructions.trim();
    if (value.storageConditions?.trim()) extraAttributes['storageConditions'] = value.storageConditions.trim();
    if (value.drugInteractionWarning?.trim())
      extraAttributes['drugInteractionWarning'] = value.drugInteractionWarning.trim();
    if (value.isControlledSubstance) extraAttributes['isControlledSubstance'] = true;

    const request = {
      name: value.name!,
      scientificName: value.scientificName || undefined,
      barcode: value.barcode || undefined,
      category: value.category || undefined,
      unitType: value.unitType || undefined,
      minStockLevel: value.minStockLevel ?? undefined,
      prescriptionRequired: value.prescriptionRequired ?? undefined,
      sellPrice: value.sellPrice!,
      buyPrice: value.buyPrice ?? undefined,
      extraAttributes: Object.keys(extraAttributes).length ? extraAttributes : undefined,
      initialStock: this.isEdit ? undefined : value.initialStock || undefined,
      expiryDate: this.isEdit ? undefined : value.expiryDate || undefined,
    };

    this.saving.set(true);
    const request$ = this.isEdit
      ? this.productService.updateProduct(this.editingId!, request)
      : this.productService.createProduct(request);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/tabs/products']);
      },
      error: (err) => {
        this.saving.set(false);
        this.toastService.show(err?.error?.message || this.translate.instant('products.saveFailed'));
      },
    });
  }
}
