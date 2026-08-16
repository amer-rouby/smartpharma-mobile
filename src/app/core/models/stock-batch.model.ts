import { PagedResponse } from './product.model';

export interface StockBatch {
  id: number;
  productId: number;
  productName: string;
  productBarcode?: string;
  pharmacyId: number;
  batchNumber: string;
  quantityCurrent: number;
  quantityInitial: number;
  expiryDate: string;
  productionDate?: string;
  buyPrice?: number;
  sellPrice?: number;
  location?: string;
  shelf?: string;
  warehouse?: string;
  notes?: string;
  status?: string;
  isExpired: boolean;
  isExpiringSoon: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockBatchRequest {
  productId: number;
  batchNumber: string;
  quantityInitial: number;
  quantityCurrent?: number;
  expiryDate: string;
  productionDate?: string;
  buyPrice?: number;
  sellPrice?: number;
  location?: string;
  shelf?: string;
  warehouse?: string;
  notes?: string;
  status?: string;
}

export type StockBatchPage = PagedResponse<StockBatch>;

export interface StockAdjustment {
  type: 'ADD' | 'REMOVE' | 'CORRECTION';
  quantity: number;
  reason: 'DAMAGED' | 'EXPIRED' | 'RETURNED' | 'COUNT_ERROR' | 'OTHER';
  notes?: string;
}
