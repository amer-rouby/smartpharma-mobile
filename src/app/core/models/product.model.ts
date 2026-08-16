export interface Product {
  id: number;
  pharmacyId: number;
  name: string;
  scientificName?: string;
  barcode?: string;
  category?: string;
  unitType: string;
  minStockLevel: number;
  prescriptionRequired: boolean;
  totalStock: number;
  sellPrice: number;
  buyPrice?: number;
  extraAttributes?: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductRequest {
  name: string;
  scientificName?: string;
  barcode?: string;
  category?: string;
  unitType?: string;
  minStockLevel?: number;
  prescriptionRequired?: boolean;
  sellPrice: number;
  buyPrice?: number;
  extraAttributes?: Record<string, unknown>;
  initialStock?: number;
  expiryDate?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
