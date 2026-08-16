import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonFab,
  IonFabButton,
  IonIcon,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, receiptOutline, trashOutline } from 'ionicons/icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ExpenseService } from '../../core/services/expense.service';
import { Expense, ExpenseSummary } from '../../core/models/expense.model';

@Component({
  selector: 'app-expenses',
  standalone: true,
  templateUrl: './expenses.page.html',
  styleUrls: ['./expenses.page.scss'],
  imports: [
    CommonModule,
    TranslateModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonFab,
    IonFabButton,
    IonIcon,
  ],
})
export class ExpensesPage implements OnInit {
  private readonly expenseService = inject(ExpenseService);
  private readonly router = inject(Router);
  private readonly alertController = inject(AlertController);
  private readonly translate = inject(TranslateService);

  readonly expenses = signal<Expense[]>([]);
  readonly summary = signal<ExpenseSummary | null>(null);
  readonly loading = signal(true);
  readonly searchTerm = signal('');
  readonly page = signal(0);
  readonly hasMore = signal(true);
  readonly pageSize = 20;

  private searchDebounceTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    addIcons({ addOutline, receiptOutline, trashOutline });
  }

  ngOnInit(): void {
    this.load(true);
    this.expenseService.getSummary().subscribe({
      next: (summary) => this.summary.set(summary),
      error: () => {},
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    clearTimeout(this.searchDebounceTimer);
    this.page.set(0);
    this.hasMore.set(true);
    this.searchDebounceTimer = setTimeout(() => this.load(true), 350);
  }

  load(reset: boolean, event?: CustomEvent): void {
    if (reset) this.loading.set(true);
    const request$ = this.searchTerm()
      ? this.expenseService.search(this.searchTerm(), this.page(), this.pageSize)
      : this.expenseService.getPage(this.page(), this.pageSize);

    request$.subscribe({
      next: (result) => {
        this.expenses.set(reset ? result.content : [...this.expenses(), ...result.content]);
        this.hasMore.set(this.page() + 1 < result.totalPages);
        this.loading.set(false);
        (event?.target as HTMLIonInfiniteScrollElement | undefined)?.complete();
      },
      error: () => {
        this.loading.set(false);
        (event?.target as HTMLIonInfiniteScrollElement | undefined)?.complete();
      },
    });
  }

  loadMore(event: CustomEvent): void {
    if (!this.hasMore()) {
      (event.target as HTMLIonInfiniteScrollElement).complete();
      return;
    }
    this.page.update((p) => p + 1);
    this.load(false, event);
  }

  addExpense(): void {
    this.router.navigate(['/tabs/expenses/new']);
  }

  async deleteExpense(expense: Expense): Promise<void> {
    const alert = await this.alertController.create({
      header: this.translate.instant('expenses.deleteConfirmTitle'),
      message: this.translate.instant('expenses.deleteConfirmMessage', { title: expense.title }),
      buttons: [
        { text: this.translate.instant('common.cancel'), role: 'cancel' },
        {
          text: this.translate.instant('common.delete'),
          role: 'destructive',
          handler: () => {
            this.expenseService.delete(expense.id).subscribe(() => {
              this.expenses.update((list) => list.filter((e) => e.id !== expense.id));
            });
          },
        },
      ],
    });
    await alert.present();
  }
}
