export interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  todayAverageOrder: number;
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  inventoryValue: number;
  expiringBatches: number;
  expiredBatches: number;
  topProducts: TopProduct[];
  recentSales: RecentSale[];
}

export interface TopProduct {
  productId: number;
  productName: string;
  quantitySold: number;
  totalRevenue: number;
}

export interface RecentSale {
  id: number;
  invoiceNumber: string;
  totalAmount: number;
  transactionDate: string;
}
