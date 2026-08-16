import { PagedResponse } from './product.model';

export interface SaleItemRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface SaleRequest {
  pharmacyId: number;
  items: SaleItemRequest[];
  customerPhone?: string;
  paymentMethod: string;
  discountAmount: number;
  totalAmount: number;
  prescriptionImageUrl?: string;
}

export interface SaleItemResponse {
  id: number;
  productId: number;
  productName: string;
  barcode?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SaleResponse {
  id: number;
  invoiceNumber: string;
  subtotal: number;
  totalAmount: number;
  discountAmount: number;
  paymentMethod: string;
  customerPhone?: string;
  prescriptionImageUrl?: string;
  transactionDate: string;
  items?: SaleItemResponse[];
}

export type SalePage = PagedResponse<SaleResponse>;

export const PAYMENT_METHOD_KEYS: Record<string, string> = {
  CASH: 'payment.CASH',
  VISA: 'payment.VISA',
  MASTERCARD: 'payment.MASTERCARD',
  INSTAPAY: 'payment.INSTAPAY',
  FAWRY: 'payment.FAWRY',
  WALLET: 'payment.WALLET',
  BANK_TRANSFER: 'payment.BANK_TRANSFER',
};

export const ALL_PAYMENT_METHODS = Object.keys(PAYMENT_METHOD_KEYS);
