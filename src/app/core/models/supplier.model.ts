import { PagedResponse } from './product.model';

export type SupplierStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export interface Supplier {
  id: number;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  status: SupplierStatus;
  notes?: string;
  pharmacyId: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierRequest {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  status?: SupplierStatus;
  notes?: string;
}

export type SupplierPage = PagedResponse<Supplier>;

export const SUPPLIER_STATUS_COLORS: Record<SupplierStatus, string> = {
  ACTIVE: 'success',
  INACTIVE: 'medium',
  BLOCKED: 'danger',
};
