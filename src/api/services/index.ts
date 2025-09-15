export { authService } from './auth.service';
export { usersService } from './users.service';
export { customersService } from './customers.service';
export { productsService } from './products.service';
export { inventoryService } from './inventory.service';
export { invoicesService } from './invoices.service';
export { paymentsService } from './payments.service';
export { transactionsService } from './transactions.service';

// Export types
export type { User, CreateUserRequest, UpdateUserRequest } from './users.service';
export type { Customer, CreateCustomerRequest, UpdateCustomerRequest } from './customers.service';
export type { Product, ProductCategory, CreateProductRequest, UpdateProductRequest } from './products.service';
export type { InventoryItem, InventorySummary } from './inventory.service';
export type { Invoice, InvoiceItem, CreateInvoiceRequest, UpdateInvoiceRequest } from './invoices.service';
export type { Receipt, PaymentMethod, CreatePaymentRequest, PaymentSummary } from './payments.service';
export type { Transaction, TransactionSummary } from './transactions.service';
export type { Role, Permission } from './roles.service';
export type { CreateBrandRequest, UpdateBrandRequest } from './brands.service';
export type { CreateCategoryRequest, UpdateCategoryRequest } from './categories.service';
