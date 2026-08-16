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
  createdAt: string;
  updatedAt?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
