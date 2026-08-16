import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('../features/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'pos',
        loadComponent: () => import('../features/pos/pos.page').then((m) => m.PosPage),
      },
      {
        path: 'products',
        loadComponent: () => import('../features/products/products.page').then((m) => m.ProductsPage),
      },
      {
        path: 'stock',
        loadComponent: () => import('../features/stock/stock.page').then((m) => m.StockPage),
      },
      {
        path: 'more',
        loadComponent: () => import('../features/more/more.page').then((m) => m.MorePage),
      },
      // Reachable from the "More" tab but not shown in the tab bar itself.
      {
        path: 'notifications',
        loadComponent: () =>
          import('../features/notifications/notifications.page').then((m) => m.NotificationsPage),
      },
      {
        path: 'purchases',
        loadComponent: () => import('../features/purchases/purchases.page').then((m) => m.PurchasesPage),
      },
      {
        path: 'purchases/:id',
        loadComponent: () =>
          import('../features/purchases/purchase-detail/purchase-detail.page').then(
            (m) => m.PurchaseDetailPage
          ),
      },
      {
        path: 'settings',
        loadComponent: () => import('../features/settings/settings.page').then((m) => m.SettingsPage),
      },
      {
        path: 'profile',
        loadComponent: () => import('../features/profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: 'categories',
        loadComponent: () => import('../features/categories/categories.page').then((m) => m.CategoriesPage),
      },
      {
        path: 'categories/new',
        loadComponent: () =>
          import('../features/categories/category-form/category-form.page').then((m) => m.CategoryFormPage),
      },
      {
        path: 'categories/:id/edit',
        loadComponent: () =>
          import('../features/categories/category-form/category-form.page').then((m) => m.CategoryFormPage),
      },
      {
        path: 'suppliers',
        loadComponent: () => import('../features/suppliers/suppliers.page').then((m) => m.SuppliersPage),
      },
      {
        path: 'suppliers/new',
        loadComponent: () =>
          import('../features/suppliers/supplier-form/supplier-form.page').then((m) => m.SupplierFormPage),
      },
      {
        path: 'suppliers/:id/edit',
        loadComponent: () =>
          import('../features/suppliers/supplier-form/supplier-form.page').then((m) => m.SupplierFormPage),
      },
      {
        path: 'expenses',
        loadComponent: () => import('../features/expenses/expenses.page').then((m) => m.ExpensesPage),
      },
      {
        path: 'expenses/new',
        loadComponent: () =>
          import('../features/expenses/expense-form/expense-form.page').then((m) => m.ExpenseFormPage),
      },
      {
        path: 'reports',
        loadComponent: () => import('../features/reports/reports.page').then((m) => m.ReportsPage),
      },
      {
        path: 'reports/sales',
        loadComponent: () =>
          import('../features/reports/sales-report/sales-report.page').then((m) => m.SalesReportPage),
      },
      {
        path: 'reports/stock',
        loadComponent: () =>
          import('../features/reports/stock-report/stock-report.page').then((m) => m.StockReportPage),
      },
      {
        path: 'reports/financial',
        loadComponent: () =>
          import('../features/reports/financial-report/financial-report.page').then(
            (m) => m.FinancialReportPage
          ),
      },
      {
        path: 'reports/expiry',
        loadComponent: () =>
          import('../features/reports/expiry-report/expiry-report.page').then((m) => m.ExpiryReportPage),
      },
      {
        path: 'system-settings',
        loadComponent: () =>
          import('../features/system-settings/system-settings.page').then((m) => m.SystemSettingsPage),
      },
      {
        path: 'users',
        loadComponent: () => import('../features/users/users.page').then((m) => m.UsersPage),
      },
      {
        path: 'users/new',
        loadComponent: () => import('../features/users/user-form/user-form.page').then((m) => m.UserFormPage),
      },
      {
        path: 'users/:id/edit',
        loadComponent: () => import('../features/users/user-form/user-form.page').then((m) => m.UserFormPage),
      },
      {
        path: 'stock-batches',
        loadComponent: () =>
          import('../features/stock-batches/stock-batches.page').then((m) => m.StockBatchesPage),
      },
      {
        path: 'stock-batches/new',
        loadComponent: () =>
          import('../features/stock-batches/stock-batch-form/stock-batch-form.page').then(
            (m) => m.StockBatchFormPage
          ),
      },
      {
        path: 'stock-batches/:id/edit',
        loadComponent: () =>
          import('../features/stock-batches/stock-batch-form/stock-batch-form.page').then(
            (m) => m.StockBatchFormPage
          ),
      },
      {
        path: 'stock-movements',
        loadComponent: () =>
          import('../features/stock-movements/stock-movements.page').then((m) => m.StockMovementsPage),
      },
      {
        path: 'demand-predictions',
        loadComponent: () =>
          import('../features/demand-predictions/demand-predictions.page').then(
            (m) => m.DemandPredictionsPage
          ),
      },
      {
        path: 'payments',
        loadComponent: () => import('../features/payments/payments.page').then((m) => m.PaymentsPage),
      },
      {
        path: '',
        redirectTo: '/tabs/dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/dashboard',
    pathMatch: 'full',
  },
];
