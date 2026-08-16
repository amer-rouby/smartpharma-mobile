import { PagedResponse } from './product.model';

export interface DemandPrediction {
  predictionId: number;
  productId: number;
  productName: string;
  productCode?: string;
  pharmacyId: number;
  predictionDate: string;
  predictedQuantity: number;
  currentStock: number;
  recommendedOrder: number;
  confidenceLevel: number;
  algorithmVersion?: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonalityFactor: 'high' | 'medium' | 'low';
  recommendation: string;
  createdAt: string;
}

export type DemandPredictionPage = PagedResponse<DemandPrediction>;

export interface PredictionStats {
  averageAccuracy: number;
  totalPredictions: number;
  lastUpdated?: string;
}

export interface PurchaseOrderSummary {
  purchaseOrderId?: number;
  orderNumber?: string;
  productId: number;
  productName: string;
  quantity: number;
  status: string;
  message?: string;
}
