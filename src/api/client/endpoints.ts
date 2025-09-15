export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/auth/login",
    PROFILE: "/auth/profile",
    CHANGE_PASSWORD: "/auth/change-password",
  },

  // Users
  USERS: {
    BASE: "/users",
    BY_ID: (id: string) => `/users/${id}`,
    TOGGLE_STATUS: (id: string) => `/users/${id}/toggle-status`,
    RESET_PASSWORD: (id: string) => `/users/${id}/reset-password`,
  },

  // Customers
  CUSTOMERS: {
    BASE: "/customers",
    BY_ID: (id: string) => `/customers/${id}`,
    TOGGLE_STATUS: (id: string) => `/customers/${id}/toggle-status`,
    STATEMENT: (id: string) => `/customers/${id}/statement`,
    OUTSTANDING_BALANCE: "/customers/outstanding-balance",
    TOP_CUSTOMERS: "/customers/top-customers",
  },

  // Products
  PRODUCTS: {
    BASE: "/products",
    BY_ID: (id: string) => `/products/${id}`,
    BY_SKU: (sku: string) => `/products/sku/${sku}`,
    TOGGLE_STATUS: (id: string) => `/products/${id}/toggle-status`,
    LOW_STOCK: "/products/low-stock",
  },

  // Product Categories
  CATEGORIES: {
    BASE: "/product-categories",
    BY_ID: (id: string) => `/product-categories/${id}`,
    HIERARCHY: "/product-categories/hierarchy",
    TOGGLE_STATUS: (id: string) => `/product-categories/${id}/toggle-status`,
  },

  // Brands
  BRANDS: {
    BASE: "/brands",
    BY_ID: (id: string) => `/brands/${id}`,
    TOGGLE_STATUS: (id: string) => `/brands/${id}/toggle-status`,
  },

  // Inventory
  INVENTORY: {
    BASE: "/inventory",
    BY_ID: (id: string) => `/inventory/${id}`,
    BY_PRODUCT: (productId: string) => `/inventory/product/${productId}`,
    ADJUST_STOCK: (id: string) => `/inventory/${id}/adjust-stock`, // Fixed: separate endpoint
    SUMMARY: "/inventory/summary",
    LOCATIONS: "/inventory/locations",
    LOW_STOCK: "/inventory/low-stock",
  },
  PRODUCT_BATCHES: {
    BASE: "/product-batches",
    BY_ID: (id: string) => `/product-batches/${id}`,
    EXPIRING: "/product-batches/expiring",
    FIFO: (productId: string, quantity: number) =>
      `/product-batches/fifo/${productId}/${quantity}`,
    ADJUST_STOCK: (id: string) => `/product-batches/${id}/adjust-stock`,
  },

PAYMENTS: {
  BASE: "/payments",
  PAYMENT_METHODS: "/payments/payment-methods",
  PROCESS: "/payments/process",
  RECEIPTS: "/payments/receipts",
  RECEIPT_BY_ID: (id: string) => `/payments/receipts/${id}`,
  CUSTOMER_OUTSTANDING: (customerId: string) => `/payments/customers/${customerId}/outstanding-invoices`,
},

  TRANSACTIONS: {
    BASE: "/transactions",
    BY_ID: (id: string) => `/transactions/${id}`,
    SUMMARY: "/transactions/summary",
    CUSTOMER_STATEMENT: (customerId: string) => `/transactions/customers/${customerId}/statement`,
  },

  // Payment Methods
  PAYMENT_METHODS: {
    BASE: "/payment-methods",
    BY_ID: (id: string) => `/payment-methods/${id}`,
    TOGGLE_STATUS: (id: string) => `/payment-methods/${id}/toggle-status`,
  },

  // Roles & Permissions
  ROLES: {
    BASE: "/roles",
    BY_ID: (id: string) => `/roles/${id}`,
  },

  PERMISSIONS: {
    BASE: "/permissions",
    BY_MODULE: (module: string) => `/permissions/modules/${module}`,
  },

  // Quotations
  QUOTATIONS: {
    BASE: "/quotations",
    BY_ID: (id: string) => `/quotations/${id}`,
    STATUS: (id: string) => `/quotations/${id}/status`,
    CONVERT_TO_INVOICE: (id: string) => `/quotations/${id}/convert-to-invoice`,
    SEARCH_PRODUCTS: "/quotations/search-products",
  },

  // Invoices
  INVOICES: {
    BASE: "/invoices",
    BY_ID: (id: string) => `/invoices/${id}`,
    STATUS: (id: string) => `/invoices/${id}/status`,
    CANCEL: (id: string) => `/invoices/${id}/cancel`,
    SUMMARY: "/invoices/summary",
    SEARCH_PRODUCTS: "/invoices/search-products",
  },
  DASHBOARD: {
    OVERVIEW: "/dashboard/overview",
  },

    SETTINGS: {
    BASE: "/settings",
    BY_ID: (id: string) => `/settings/${id}`,
    ALL: "/settings/all",
  },
} as const;
