import { createBrowserRouter, Navigate } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";
import { PermissionRoute } from "./PermissionRoute";

// Layout
import { MainLayout } from "../components/layout/MainLayout";

// Pages
import { LoginPage } from "../pages/auth/LoginPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { CustomersPage } from "../pages/customers/CustomersPage";
import { CreateCustomerPage } from "../pages/customers/CreateCustomerPage";
import { CustomerDetailPage } from "../pages/customers/CustomerDetailPage";
import { ProductsPage } from "../pages/products/ProductsPage";
import { CreateProductPage } from "../pages/products/CreateProductPage";
import { ProductDetailPage } from "../pages/products/ProductDetailPage";
import { CategoriesPage } from "../pages/products/CategoriesPage";
import { BrandsPage } from "../pages/products/BrandsPage";
import { InventoryPage } from "../pages/inventory/InventoryPage";
import { InvoicesPage } from "../pages/invoices/InvoicesPage";
import { CreateInvoicePage } from "../pages/invoices/CreateInvoicePage";
import { InvoiceDetailPage } from "../pages/invoices/InvoiceDetailPage";
import { PaymentsPage } from "../pages/payments/PaymentsPage";
import { ProcessPaymentPage } from "../pages/payments/ProcessPaymentPage";
import { ReceiptsPage } from "../pages/payments/ReceiptsPage";
import { ProfilePage } from "../pages/settings/ProfilePage";
import { UsersPage } from "../pages/settings/UsersPage";
import { SystemSettingsPage } from "../pages/settings/SystemSettingsPage";

// Utils
import { ROUTES, PERMISSIONS } from "../utils/constants";

export const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
  {
    path: "/",
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      {
        path: ROUTES.DASHBOARD,
        element: <DashboardPage />,
      },
      // Customer routes
      {
        path: ROUTES.CUSTOMERS,
        element: (
          <PermissionRoute requiredPermissions={[PERMISSIONS.CUSTOMERS_READ]}>
            <CustomersPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/customers/create",
        element: (
          <PermissionRoute requiredPermissions={[PERMISSIONS.CUSTOMERS_CREATE]}>
            <CreateCustomerPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/customers/:id",
        element: (
          <PermissionRoute requiredPermissions={[PERMISSIONS.CUSTOMERS_READ]}>
            <CustomerDetailPage />
          </PermissionRoute>
        ),
      },
      // Product routes
      {
        path: ROUTES.PRODUCTS,
        element: (
          <PermissionRoute requiredPermissions={[PERMISSIONS.PRODUCTS_READ]}>
            <ProductsPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/products/create",
        element: (
          <PermissionRoute requiredPermissions={[PERMISSIONS.PRODUCTS_CREATE]}>
            <CreateProductPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/products/:id",
        element: (
          <PermissionRoute requiredPermissions={[PERMISSIONS.PRODUCTS_READ]}>
            <ProductDetailPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/products/categories",
        element: (
          <PermissionRoute requiredPermissions={[PERMISSIONS.PRODUCTS_READ]}>
            <CategoriesPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/products/brands",
        element: (
          <PermissionRoute requiredPermissions={[PERMISSIONS.PRODUCTS_READ]}>
            <BrandsPage />
          </PermissionRoute>
        ),
      },
      // Inventory routes
      {
        path: ROUTES.INVENTORY,
        element: (
          <PermissionRoute requiredPermissions={[PERMISSIONS.INVENTORY_READ]}>
            <InventoryPage />
          </PermissionRoute>
        ),
      },
      // Invoice routes
      {
        path: ROUTES.INVOICES,
        element: (
          <PermissionRoute requiredPermissions={[PERMISSIONS.SALES_READ]}>
            <InvoicesPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/invoices/create",
        element: (
          <PermissionRoute requiredPermissions={[PERMISSIONS.SALES_CREATE]}>
            <CreateInvoicePage />
          </PermissionRoute>
        ),
      },
      {
        path: "/invoices/:id",
        element: (
          <PermissionRoute requiredPermissions={[PERMISSIONS.SALES_READ]}>
            <InvoiceDetailPage />
          </PermissionRoute>
        ),
      },
      // Payment routes
      {
        path: ROUTES.PAYMENTS,
        element: (
          <PermissionRoute requiredPermissions={[PERMISSIONS.PAYMENTS_READ]}>
            <PaymentsPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/payments/process",
        element: (
          <PermissionRoute requiredPermissions={[PERMISSIONS.PAYMENTS_CREATE]}>
            <ProcessPaymentPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/payments/receipts",
        element: (
          <PermissionRoute requiredPermissions={[PERMISSIONS.PAYMENTS_READ]}>
            <ReceiptsPage />
          </PermissionRoute>
        ),
      },
      // Settings routes
      {
        path: "/settings/profile",
        element: <ProfilePage />,
      },
      {
        path: "/settings/users",
        element: (
          <PermissionRoute requiredPermissions={[PERMISSIONS.USERS_READ]}>
            <UsersPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/settings/system",
        element: (
          <PermissionRoute requiredPermissions={[PERMISSIONS.USERS_READ]}>
            <SystemSettingsPage />
          </PermissionRoute>
        ),
      },
    ],
  },
  {
    path: "*",
    element: (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary">404</h1>
          <p className="text-muted-foreground mt-2">Page not found</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Go Back
          </button>
        </div>
      </div>
    ),
  },
]);
