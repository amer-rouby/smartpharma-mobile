import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
import { ExpenseService } from '../../../core/services/expense.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { EXPENSE_CATEGORIES, EXPENSE_PAYMENT_METHODS, ExpenseCategory } from '../../../core/models/expense.model';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './expense-form.page.html',
  styleUrls: ['./expense-form.page.scss'],
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
export class ExpenseFormPage {
  private readonly fb = inject(FormBuilder);
  private readonly expenseService = inject(ExpenseService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly translate = inject(TranslateService);

  readonly saving = signal(false);
  readonly categories = EXPENSE_CATEGORIES;
  readonly paymentMethods = EXPENSE_PAYMENT_METHODS;

  readonly form = this.fb.group({
    category: ['PURCHASES' as ExpenseCategory, Validators.required],
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    expenseDate: [new Date().toISOString()],
    paymentMethod: ['CASH'],
    referenceNumber: [''],
  });

  // Backend deserializes into LocalDateTime, which rejects a trailing 'Z' -
  // ion-datetime gives back UTC ISO strings, so strip the offset before sending.
  private toLocalDateTimeString(isoValue: string): string {
    return isoValue.replace('Z', '').split('.')[0];
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const request = {
      pharmacyId: this.authService.getPharmacyId() ?? 0,
      category: value.category!,
      title: value.title!,
      description: value.description || undefined,
      amount: value.amount!,
      expenseDate: this.toLocalDateTimeString(value.expenseDate!),
      paymentMethod: value.paymentMethod || undefined,
      referenceNumber: value.referenceNumber || undefined,
    };

    this.saving.set(true);
    this.expenseService.create(request).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/tabs/expenses']);
      },
      error: (err) => {
        this.saving.set(false);
        this.toastService.show(err?.error?.message || this.translate.instant('expenses.saveFailed'));
      },
    });
  }
}
