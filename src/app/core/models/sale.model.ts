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

export interface SaleResponse {
  id: number;
  invoiceNumber: string;
  subtotal: number;
  totalAmount: number;
  discountAmount: number;
  paymentMethod: string;
  transactionDate: string;
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: 'نقدي',
  VISA: 'فيزا',
  MASTERCARD: 'ماستركارد',
  INSTAPAY: 'إنستا باي',
  FAWRY: 'فوري',
  WALLET: 'محفظة إلكترونية',
  BANK_TRANSFER: 'تحويل بنكي',
};

export const ALL_PAYMENT_METHODS = Object.keys(PAYMENT_METHOD_LABELS);
