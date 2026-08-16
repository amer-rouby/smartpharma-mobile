import { PagedResponse } from './product.model';

export const EXPENSE_CATEGORIES = [
  'PURCHASES',
  'SALARIES',
  'RENT',
  'UTILITIES',
  'MAINTENANCE',
  'MARKETING',
  'INSURANCE',
  'LICENSES',
  'TRANSPORT',
  'OTHER',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const EXPENSE_PAYMENT_METHODS = ['CASH', 'VISA', 'INSTAPAY', 'BANK_TRANSFER', 'WALLET'];

export interface Expense {
  id: number;
  pharmacyId: number;
  category: ExpenseCategory;
  categoryArabic?: string;
  title: string;
  description?: string;
  amount: number;
  expenseDate: string;
  paymentMethod?: string;
  referenceNumber?: string;
  attachmentUrl?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseRequest {
  pharmacyId: number;
  category: ExpenseCategory;
  title: string;
  description?: string;
  amount: number;
  expenseDate: string;
  paymentMethod?: string;
  referenceNumber?: string;
  attachmentUrl?: string;
}

export type ExpensePage = PagedResponse<Expense>;

export interface ExpenseSummary {
  totalExpenses: number;
  totalTransactions: number;
  averageExpense: number;
  expensesByCategory: Record<string, number>;
}
