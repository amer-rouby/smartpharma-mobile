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
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonButton,
  IonSpinner,
  ToastController,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserManagementService } from '../../../core/services/user-management.service';
import { AuthService } from '../../../core/services/auth.service';
import { StaffRole, StaffUser } from '../../../core/models/user-management.model';

const ROLES: StaffRole[] = ['ADMIN', 'PHARMACIST', 'MANAGER', 'VIEWER'];

@Component({
  selector: 'app-user-form',
  standalone: true,
  templateUrl: './user-form.page.html',
  styleUrls: ['./user-form.page.scss'],
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
    IonSelect,
    IonSelectOption,
    IonToggle,
    IonButton,
    IonSpinner,
  ],
})
export class UserFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userManagementService = inject(UserManagementService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastController = inject(ToastController);
  private readonly translate = inject(TranslateService);

  readonly saving = signal(false);
  readonly roles = ROLES;
  private editingId: number | null = null;

  readonly form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: [''],
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', Validators.email],
    phone: [''],
    role: ['PHARMACIST' as StaffRole, Validators.required],
    isActive: [true],
  });

  get isEdit(): boolean {
    return this.editingId !== null;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editingId = Number(idParam);
      this.form.get('password')?.clearValidators();
      const state = history.state as { user?: StaffUser };
      if (state?.user) {
        this.form.patchValue(state.user);
      }
    } else {
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
    this.form.get('password')?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const request = {
      username: value.username!,
      password: value.password?.trim() ? value.password : undefined,
      fullName: value.fullName!,
      email: value.email || undefined,
      phone: value.phone || undefined,
      role: value.role!,
      pharmacyId: this.authService.getPharmacyId() ?? 0,
      isActive: value.isActive ?? true,
    };

    this.saving.set(true);
    const request$ = this.isEdit
      ? this.userManagementService.update(this.editingId!, request)
      : this.userManagementService.create(request);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/tabs/users']);
      },
      error: (err) => {
        this.saving.set(false);
        this.showToast(err?.error?.message || this.translate.instant('users.saveFailed'));
      },
    });
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({ message, duration: 2500, position: 'bottom' });
    await toast.present();
  }
}
