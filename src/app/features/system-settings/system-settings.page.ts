import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonCheckbox,
  IonButton,
  IonSpinner,
  IonListHeader,
  ToastController,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PharmacySettingsService } from '../../core/services/pharmacy-settings.service';
import { ALL_PAYMENT_METHODS, PAYMENT_METHOD_KEYS } from '../../core/models/sale.model';

const CURRENCIES = ['EGP', 'USD', 'EUR', 'SAR', 'AED', 'KWD'];

@Component({
  selector: 'app-system-settings',
  standalone: true,
  templateUrl: './system-settings.page.html',
  styleUrls: ['./system-settings.page.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonCheckbox,
    IonButton,
    IonSpinner,
    IonListHeader,
  ],
})
export class SystemSettingsPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly settingsService = inject(PharmacySettingsService);
  private readonly toastController = inject(ToastController);
  private readonly translate = inject(TranslateService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly currencies = CURRENCIES;
  readonly allPaymentMethods = ALL_PAYMENT_METHODS;
  readonly paymentMethodKeys = PAYMENT_METHOD_KEYS;
  readonly selectedPaymentMethods = signal<Set<string>>(new Set());

  readonly form = this.fb.group({
    pharmacyName: ['', Validators.required],
    address: [''],
    phone: [''],
    email: ['', Validators.email],
    currency: ['EGP'],
    largeSaleThreshold: [5000],
    largeExpenseThreshold: [2000],
  });

  ngOnInit(): void {
    this.settingsService.getSettings().subscribe({
      next: (settings) => {
        this.form.patchValue(settings);
        const enabled = settings.enabledPaymentMethods
          ? settings.enabledPaymentMethods.split(',').map((m) => m.trim()).filter(Boolean)
          : this.allPaymentMethods;
        this.selectedPaymentMethods.set(new Set(enabled));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  togglePaymentMethod(method: string, checked: boolean): void {
    this.selectedPaymentMethods.update((set) => {
      const next = new Set(set);
      if (checked) next.add(method);
      else next.delete(method);
      return next;
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    this.saving.set(true);
    this.settingsService
      .update({
        pharmacyName: value.pharmacyName!,
        address: value.address || undefined,
        phone: value.phone || undefined,
        email: value.email || undefined,
        currency: value.currency ?? 'EGP',
        largeSaleThreshold: value.largeSaleThreshold ?? 5000,
        largeExpenseThreshold: value.largeExpenseThreshold ?? 2000,
        enabledPaymentMethods: Array.from(this.selectedPaymentMethods()).join(','),
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.showToast(this.translate.instant('systemSettings.saveSuccess'));
        },
        error: (err) => {
          this.saving.set(false);
          this.showToast(err?.error?.message || this.translate.instant('systemSettings.saveFailed'));
        },
      });
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({ message, duration: 2500, position: 'bottom' });
    await toast.present();
  }
}
