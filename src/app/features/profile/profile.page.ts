import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonSpinner,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personCircleOutline,
  cameraOutline,
  logOutOutline,
  lockClosedOutline,
  closeOutline,
} from 'ionicons/icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { ToastService } from '../../core/services/toast.service';
import { Profile } from '../../core/models/profile.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
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
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
    IonSpinner,
  ],
})
export class ProfilePage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);
  private readonly alertController = inject(AlertController);
  private readonly toastService = inject(ToastService);
  private readonly translate = inject(TranslateService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly uploadingPhoto = signal(false);
  readonly changingPassword = signal(false);
  readonly showPasswordForm = signal(false);
  readonly profile = signal<Profile | null>(null);

  readonly genders = ['MALE', 'FEMALE', 'OTHER'];

  readonly form = this.fb.group({
    fullName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    phone: [''],
    gender: [''],
    jobTitle: [''],
    department: [''],
    address: [''],
    city: [''],
    country: [''],
    bio: ['', Validators.maxLength(500)],
  });

  readonly passwordForm = this.fb.group({
    oldPassword: ['', [Validators.required, Validators.minLength(6)]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  });

  constructor() {
    addIcons({ personCircleOutline, cameraOutline, logOutOutline, lockClosedOutline, closeOutline });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  get avatarUrl(): string | null {
    return this.profileService.resolveImageUrl(this.profile()?.profileImageUrl);
  }

  private loadProfile(): void {
    this.loading.set(true);
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.form.patchValue(profile);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  async onChangePhoto(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      this.toastService.show(this.translate.instant('profile.photoUnavailable'));
      return;
    }

    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt,
        quality: 80,
      });
      if (!photo.webPath) return;

      const blob = await (await fetch(photo.webPath)).blob();
      const ext = photo.format || 'jpeg';
      const file = new File([blob], `profile-${Date.now()}.${ext}`, { type: blob.type || `image/${ext}` });

      this.uploadingPhoto.set(true);
      this.profileService.uploadImage(file).subscribe({
        next: (result) => {
          this.profile.update((p) => (p ? { ...p, profileImageUrl: result.url } : p));
          this.uploadingPhoto.set(false);
          this.toastService.show(this.translate.instant('profile.photoUpdated'));
        },
        error: () => {
          this.uploadingPhoto.set(false);
          this.toastService.show(this.translate.instant('profile.photoUploadFailed'));
        },
      });
    } catch {
      // user cancelled the camera/gallery prompt
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const request = {
      fullName: value.fullName!,
      email: value.email!,
      phone: value.phone || undefined,
      gender: value.gender || undefined,
      jobTitle: value.jobTitle || undefined,
      department: value.department || undefined,
      address: value.address || undefined,
      city: value.city || undefined,
      country: value.country || undefined,
      bio: value.bio || undefined,
    };

    this.saving.set(true);
    this.profileService.updateProfile(request).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.saving.set(false);
        this.toastService.show(this.translate.instant('profile.updateSuccess'));
      },
      error: () => {
        this.saving.set(false);
        this.toastService.show(this.translate.instant('profile.updateFailed'));
      },
    });
  }

  togglePasswordForm(): void {
    this.showPasswordForm.update((v) => !v);
    if (!this.showPasswordForm()) {
      this.passwordForm.reset();
    }
  }

  onChangePassword(): void {
    const value = this.passwordForm.value;
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    if (value.newPassword !== value.confirmPassword) {
      this.toastService.show(this.translate.instant('profile.passwordMismatch'));
      return;
    }

    this.changingPassword.set(true);
    this.profileService.changePassword({ oldPassword: value.oldPassword!, newPassword: value.newPassword! }).subscribe({
      next: () => {
        this.changingPassword.set(false);
        this.passwordForm.reset();
        this.showPasswordForm.set(false);
        this.toastService.show(this.translate.instant('profile.passwordChanged'));
      },
      error: (err) => {
        this.changingPassword.set(false);
        this.toastService.show(err?.error?.message || this.translate.instant('profile.passwordChangeFailed'));
      },
    });
  }

  async onLogout(): Promise<void> {
    const alert = await this.alertController.create({
      header: this.translate.instant('profile.logoutConfirmTitle'),
      message: this.translate.instant('profile.logoutConfirmMessage'),
      buttons: [
        { text: this.translate.instant('common.cancel'), role: 'cancel' },
        {
          text: this.translate.instant('profile.logout'),
          role: 'destructive',
          handler: () => {
            this.authService.logout().subscribe(() => {
              this.router.navigate(['/login']);
            });
          },
        },
      ],
    });
    await alert.present();
  }
}
