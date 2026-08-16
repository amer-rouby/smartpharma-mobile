export type PurchaseOrderStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'RECEIVED' | 'CANCELLED';
export type PurchaseOrderPriority = 'LOW' | 'NORMAL' | 'URGENT';

export interface PurchaseOrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  receivedQuantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  fullyReceived: boolean;
  pendingQuantity: number;
}

export interface PurchaseOrder {
  id: number;
  orderNumber: string;
  pharmacyId: number;
  supplierId: number;
  supplierName: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  totalAmount: number;
  status: PurchaseOrderStatus;
  priority: PurchaseOrderPriority;
  paymentTerms?: string;
  notes?: string;
  createdByFullName?: string;
  createdAt: string;
  updatedAt: string;
  items: PurchaseOrderItem[];
}

export const STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  DRAFT: 'مسودة',
  PENDING: 'معلّق',
  APPROVED: 'معتمد',
  RECEIVED: 'تم الاستلام',
  CANCELLED: 'ملغي',
};

export const STATUS_COLORS: Record<PurchaseOrderStatus, string> = {
  DRAFT: 'medium',
  PENDING: 'warning',
  APPROVED: 'primary',
  RECEIVED: 'success',
  CANCELLED: 'danger',
};
