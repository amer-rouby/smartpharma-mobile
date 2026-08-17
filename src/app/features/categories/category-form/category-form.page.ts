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
  IonToggle,
  IonButton,
  IonSpinner,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CategoryService } from '../../../core/services/category.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-category-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './category-form.page.html',
  styleUrls: ['./category-form.page.scss'],
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
    IonToggle,
    IonButton,
    IonSpinner,
  ],
})
export class CategoryFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly translate = inject(TranslateService);

  readonly saving = signal(false);
  readonly loading = signal(false);
  private editingId: number | null = null;

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    color: ['#667eea'],
    isActive: [true],
  });

  get isEdit(): boolean {
    return this.editingId !== null;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editingId = Number(idParam);
      const state = history.state as { category?: Category };
      if (state?.category) {
        this.applyCategory(state.category);
      }
    }
  }

  private applyCategory(category: Category): void {
    this.form.patchValue({
      name: category.name,
      description: category.description ?? '',
      color: category.color ?? '#667eea',
      isActive: category.isActive,
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const request = {
      name: value.name!,
      nameAr: value.name!,
      nameEn: value.name!,
      description: value.description || undefined,
      color: value.color || '#667eea',
      pharmacyId: this.authService.getPharmacyId() ?? 0,
      isActive: value.isActive ?? true,
    };

    this.saving.set(true);
    const request$ = this.isEdit
      ? this.categoryService.update(this.editingId!, request)
      : this.categoryService.create(request);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/tabs/categories']);
      },
      error: (err) => {
        this.saving.set(false);
        this.toastService.show(err?.error?.message || this.translate.instant('categories.saveFailed'));
      },
    });
  }
}
