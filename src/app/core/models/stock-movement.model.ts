import { PagedResponse } from './product.model';

export const MOVEMENT_TYPES = [
  'STOCK_IN',
  'STOCK_OUT',
  'STOCK_ADJUSTMENT',
  'TRANSFER_IN',
  'TRANSFER_OUT',
  'EXPIRED',
  'DISCARDED',
] as const;

export type MovementType = (typeof MOVEMENT_TYPES)[number];

export interface StockMovement {
  id: number;
  batchId: number;
  productName: string;
  batchNumber: string;
  movementType: MovementType;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  unitPrice?: number;
  totalValue?: number;
  referenceNumber?: string;
  reason?: string;
  notes?: string;
  movementDate: string;
  userId?: number;
  userName?: string;
  pharmacyId: number;
}

export type StockMovementPage = PagedResponse<StockMovement>;

export interface StockMovementStats {
  totalMovements: number;
  totalStockIn: number;
  totalStockOut: number;
  totalAdjustments: number;
  totalExpired: number;
  totalTransferred: number;
}
