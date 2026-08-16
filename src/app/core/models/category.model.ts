import { PagedResponse } from './product.model';

export interface Category {
  id: number;
  name: string;
  nameAr?: string;
  nameEn?: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  pharmacyId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRequest {
  name: string;
  nameAr?: string;
  nameEn?: string;
  description?: string;
  icon?: string;
  color?: string;
  pharmacyId: number;
  isActive?: boolean;
}

export type CategoryPage = PagedResponse<Category>;
