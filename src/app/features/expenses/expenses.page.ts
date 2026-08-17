import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
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
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, receiptOutline, trashOutline } from 'ionicons/icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ExpenseService } from '../../core/services/expense.service';
import { PagedList } from '../../core/utils/paged-list';
import { Expense, ExpenseSummary } from '../../core/models/expense.model';

@Component({
  selector: 'app-expenses',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
export class ExpensesPage implements ViewWillEnter {
  private readonly expenseService = inject(ExpenseService);
  private readonly router = inject(Router);
  private readonly alertController = inject(AlertController);
  private readonly translate = inject(TranslateService);

  readonly list = new PagedList<Expense>((page, size, search) =>
    search ? this.expenseService.search(search, page, size) : this.expenseService.getPage(page, size)
  );
  readonly summary = signal<ExpenseSummary | null>(null);

  constructor() {
    addIcons({ addOutline, receiptOutline, trashOutline });
  }

  ionViewWillEnter(): void {
    this.list.load(true);
    this.expenseService.getSummary().subscribe({
      next: (summary) => this.summary.set(summary),
      error: () => {},
    });
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
              this.list.items.update((items) => items.filter((e) => e.id !== expense.id));
            });
          },
        },
      ],
    });
    await alert.present();
  }
}
