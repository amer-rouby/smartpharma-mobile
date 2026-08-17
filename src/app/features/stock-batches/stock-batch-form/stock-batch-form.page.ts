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
  IonSearchbar,
  IonList,
  IonButton,
  IonSpinner,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StockBatchService } from '../../../core/services/stock-batch.service';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { StockBatch } from '../../../core/models/stock-batch.model';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-stock-batch-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stock-batch-form.page.html',
  styleUrls: ['./stock-batch-form.page.scss'],
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
    IonSearchbar,
    IonList,
    IonButton,
    IonSpinner,
  ],
})
export class StockBatchFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly stockBatchService = inject(StockBatchService);
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly translate = inject(TranslateService);

  readonly saving = signal(false);
  readonly selectedProduct = signal<{ id: number; name: string } | null>(null);
  readonly productResults = signal<Product[]>([]);
  private editingId: number | null = null;
  private searchDebounceTimer?: ReturnType<typeof setTimeout>;

  readonly form = this.fb.group({
    batchNumber: ['', [Validators.required, Validators.minLength(3)]],
    quantityInitial: [0, [Validators.required, Validators.min(0)]],
    quantityCurrent: [0, [Validators.min(0)]],
    expiryDate: ['', Validators.required],
    location: [''],
    shelf: [''],
    warehouse: [''],
    notes: [''],
  });

  get isEdit(): boolean {
    return this.editingId !== null;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editingId = Number(idParam);
      const state = history.state as { batch?: StockBatch };
      if (state?.batch) {
        this.form.patchValue(state.batch);
        this.selectedProduct.set({ id: state.batch.productId, name: state.batch.productName });
      }
    }
  }

  onProductSearch(value: string): void {
    clearTimeout(this.searchDebounceTimer);
    if (!value?.trim()) {
      this.productResults.set([]);
      return;
    }
    this.searchDebounceTimer = setTimeout(() => {
      this.productService.getProductsPaged(0, 10, value).subscribe({
        next: (result) => this.productResults.set(result.content),
      });
    }, 350);
  }

  pickProduct(product: Product): void {
    this.selectedProduct.set({ id: product.id, name: product.name });
    this.productResults.set([]);
  }

  onSubmit(): void {
    if (this.form.invalid || !this.selectedProduct()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const request = {
      productId: this.selectedProduct()!.id,
      batchNumber: value.batchNumber!,
      quantityInitial: value.quantityInitial!,
      quantityCurrent: value.quantityCurrent ?? value.quantityInitial!,
      expiryDate: value.expiryDate!,
      location: value.location || undefined,
      shelf: value.shelf || undefined,
      warehouse: value.warehouse || undefined,
      notes: value.notes || undefined,
    };

    this.saving.set(true);
    const request$ = this.isEdit
      ? this.stockBatchService.update(this.editingId!, request)
      : this.stockBatchService.create(request);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/tabs/stock-batches']);
      },
      error: (err) => {
        this.saving.set(false);
        this.toastService.show(err?.error?.message || this.translate.instant('stockBatches.saveFailed'));
      },
    });
  }
}
