export interface StockAlert {
  id: number;
  pharmacyId: number;
  productId: number;
  productName: string;
  batchId?: number;
  batchNumber?: string;
  alertType: string;
  title: string;
  message: string;
  severity: string;
  status: string;
  createdAt: string;
  readAt?: string;
  resolvedAt?: string;
}
