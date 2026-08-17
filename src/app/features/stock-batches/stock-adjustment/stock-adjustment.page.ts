import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
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
  IonButton,
  IonSpinner,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StockBatchService } from '../../../core/services/stock-batch.service';
import { ToastService } from '../../../core/services/toast.service';
import { StockBatch } from '../../../core/models/stock-batch.model';

const ADJUSTMENT_TYPES = ['ADD', 'REMOVE', 'CORRECTION'] as const;
const ADJUSTMENT_REASONS = ['DAMAGED', 'EXPIRED', 'RETURNED', 'COUNT_ERROR', 'OTHER'] as const;

@Component({
  selector: 'app-stock-adjustment',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stock-adjustment.page.html',
  styleUrls: ['./stock-adjustment.page.scss'],
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
    IonButton,
    IonSpinner,
  ],
})
export class StockAdjustmentPage {
  private readonly fb = inject(FormBuilder);
  private readonly stockBatchService = inject(StockBatchService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly translate = inject(TranslateService);

  readonly saving = signal(false);
  readonly types = ADJUSTMENT_TYPES;
  readonly reasons = ADJUSTMENT_REASONS;
  readonly batch: StockBatch | null = (history.state as { batch?: StockBatch }).batch ?? null;
  private readonly batchId = Number(this.route.snapshot.paramMap.get('id'));

  readonly form = this.fb.group({
    type: ['ADD' as (typeof ADJUSTMENT_TYPES)[number], Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    reason: ['OTHER' as (typeof ADJUSTMENT_REASONS)[number], Validators.required],
    notes: [''],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const request = {
      type: value.type!,
      quantity: value.quantity!,
      reason: value.reason!,
      notes: value.notes || undefined,
    };

    this.saving.set(true);
    this.stockBatchService.adjustStock(this.batchId, request).subscribe({
      next: () => {
        this.saving.set(false);
        this.toastService.show(this.translate.instant('stockBatches.adjustSuccess'));
        this.router.navigate(['/tabs/stock-batches']);
      },
      error: (err) => {
        this.saving.set(false);
        this.toastService.show(err?.error?.message || this.translate.instant('stockBatches.adjustFailed'));
      },
    });
  }
}
