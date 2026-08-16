import { PagedResponse } from './product.model';

export interface Payment {
  paymentId: number;
  referenceNumber: string;
  paymentMethod: string;
  amount: number;
  status: string;
  message?: string;
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
}

export type PaymentPage = PagedResponse<Payment>;
