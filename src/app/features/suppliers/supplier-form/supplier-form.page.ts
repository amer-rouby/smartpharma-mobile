import { Component, inject, signal, OnInit } from '@angular/core';
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
  ToastController,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SupplierService } from '../../../core/services/supplier.service';
import { Supplier, SupplierStatus } from '../../../core/models/supplier.model';

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  templateUrl: './supplier-form.page.html',
  styleUrls: ['./supplier-form.page.scss'],
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
export class SupplierFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly supplierService = inject(SupplierService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastController = inject(ToastController);
  private readonly translate = inject(TranslateService);

  readonly saving = signal(false);
  readonly statuses: SupplierStatus[] = ['ACTIVE', 'INACTIVE', 'BLOCKED'];
  private editingId: number | null = null;

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    contactPerson: [''],
    phone: [''],
    email: ['', Validators.email],
    address: [''],
    city: [''],
    status: ['ACTIVE' as SupplierStatus],
    notes: [''],
  });

  get isEdit(): boolean {
    return this.editingId !== null;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editingId = Number(idParam);
      const state = history.state as { supplier?: Supplier };
      if (state?.supplier) {
        this.form.patchValue(state.supplier);
      }
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const request = {
      name: value.name!,
      contactPerson: value.contactPerson || undefined,
      phone: value.phone || undefined,
      email: value.email || undefined,
      address: value.address || undefined,
      city: value.city || undefined,
      status: value.status ?? 'ACTIVE',
      notes: value.notes || undefined,
    };

    this.saving.set(true);
    const request$ = this.isEdit
      ? this.supplierService.update(this.editingId!, request)
      : this.supplierService.create(request);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/tabs/suppliers']);
      },
      error: (err) => {
        this.saving.set(false);
        this.showToast(err?.error?.message || this.translate.instant('suppliers.saveFailed'));
      },
    });
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({ message, duration: 2500, position: 'bottom' });
    await toast.present();
  }
}
