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
