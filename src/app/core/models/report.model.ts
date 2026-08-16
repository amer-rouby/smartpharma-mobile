export interface ReportRequest {
  pharmacyId: number;
  startDate: string;
  endDate: string;
  reportType?: string;
  category?: string;
}

export interface TopProduct {
  productId: number;
  productName: string;
  quantitySold: number;
  totalRevenue: number;
}

export interface DailySales {
  date: string;
  revenue: number;
  orders: number;
}

export interface SalesReportResponse {
  totalRevenue: number;
  totalOrders: number;
  averageOrder: number;
  totalItems: number;
  revenueByPaymentMethod: Record<string, number>;
  topProducts: TopProduct[];
  dailySales: DailySales[];
}

export interface StockByCategory {
  categoryName: string;
  itemCount: number;
  totalValue: number;
}

export interface LowStockProduct {
  productId: number;
  productName: string;
  batchNumber: string;
  currentStock: number;
  minStock: number;
  expiryDate?: string;
  daysUntilExpiry?: number;
}

export interface StockReportResponse {
  totalStockValue: number;
  totalItems: number;
  lowStockItems: number;
  expiredItems: number;
  expiringSoonItems: number;
  stockByCategory: StockByCategory[];
  lowStockProducts: LowStockProduct[];
  expiringProducts: LowStockProduct[];
}

export interface MonthlyFinancial {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface ExpenseByCategory {
  category: string;
  amount: number;
}

export interface FinancialReportResponse {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  monthlyData: MonthlyFinancial[];
  expensesByCategory: ExpenseByCategory[];
}

export interface ExpiringProduct {
  productId: number;
  productName: string;
  batchNumber: string;
  expiryDate: string;
  daysUntilExpiry: number;
  currentStock: number;
  status: string;
  estimatedValue: number;
}

export interface ExpiryReportResponse {
  totalExpiring: number;
  urgentExpiring: number;
  warningExpiring: number;
  okExpiring: number;
  expiredCount: number;
  expiringProducts: ExpiringProduct[];
}
