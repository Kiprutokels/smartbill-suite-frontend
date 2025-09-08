import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Calculator, Send } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { FormField } from '../../components/forms/FormField';
import { Select } from '../../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Alert, AlertDescription } from '../../components/ui/Alert';
import { customersService, Customer } from '../../api/services/customers.service';
import { productsService, Product } from '../../api/services/products.service';
import { invoicesService, CreateInvoiceRequest, CreateInvoiceItemRequest } from '../../api/services/invoices.service';
import { formatCurrency } from '../../utils';

const CreateInvoicePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedCustomerId = searchParams.get('customerId');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState<CreateInvoiceRequest>({
    customerId: preSelectedCustomerId || '',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    paymentTerms: 'Net 30',
    notes: '',
    discountPercentage: 0,
    items: [],
  });

  const [currentItem, setCurrentItem] = useState<CreateInvoiceItemRequest>({
    productId: '',
    quantity: 1,
    unitPrice: 0,
    discountPercentage: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({});

  // Calculations
  const subtotal = formData.items.reduce((sum, item) => {
    const lineTotal = item.quantity * (item.unitPrice || 0);
    const lineDiscount = lineTotal * ((item.discountPercentage || 0) / 100);
    return sum + (lineTotal - lineDiscount);
  }, 0);

  const overallDiscount = subtotal * ((formData.discountPercentage || 0) / 100);
  const discountedSubtotal = subtotal - overallDiscount;
  const taxAmount = discountedSubtotal * 0.16; // 16% tax
  const totalAmount = discountedSubtotal + taxAmount;

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (preSelectedCustomerId) {
      const customer = customers.find(c => c.id === preSelectedCustomerId);
      if (customer) {
        setSelectedCustomer(customer);
      }
    }
  }, [customers, preSelectedCustomerId]);

  const fetchCustomers = async () => {
    try {
      const response = await customersService.getCustomers({ limit: 1000 });
      setCustomers(response.data.filter(c => c.isActive));
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsService.getProducts({ limit: 1000 });
      setProducts(response.data.filter(p => p.isActive));
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const handleCustomerChange = (customerId: string) => {
    setFormData(prev => ({ ...prev, customerId }));
    const customer = customers.find(c => c.id === customerId);
    setSelectedCustomer(customer || null);
    if (errors.customerId) {
      setErrors(prev => ({ ...prev, customerId: '' }));
    }
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const totalStock = product.inventory?.reduce((sum, inv) => sum + inv.quantityAvailable, 0) || 0;
      
      setCurrentItem(prev => ({
        ...prev,
        productId,
        unitPrice: Number(product.sellingPrice),
        description: product.name,
        availableStock: totalStock,
      }));
    }
  };

  const validateItem = (): boolean => {
    const errors: Record<string, string> = {};

    if (!currentItem.productId) {
      errors.productId = 'Product is required';
    }

    if (!currentItem.quantity || currentItem.quantity <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    }

    if (!currentItem.unitPrice || currentItem.unitPrice <= 0) {
      errors.unitPrice = 'Unit price must be greater than 0';
    }

    // Check stock availability
    const product = products.find(p => p.id === currentItem.productId);
    if (product && currentItem.quantity) {
      const totalStock = product.inventory?.reduce((sum, inv) => sum + inv.quantityAvailable, 0) || 0;
      
      if (currentItem.quantity > totalStock) {
        errors.quantity = `Only ${totalStock} units available in stock`;
      }
    }

    setItemErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const addItem = () => {
    if (!validateItem()) return;

    const product = products.find(p => p.id === currentItem.productId);
    if (!product) return;

    const newItem: CreateInvoiceItemRequest = {
      ...currentItem,
      description: currentItem.description || product.name,
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    // Reset current item
    setCurrentItem({
      productId: '',
      quantity: 1,
      unitPrice: 0,
      discountPercentage: 0,
    });
    setItemErrors({});
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index: number, field: keyof CreateInvoiceItemRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerId) {
      newErrors.customerId = 'Customer is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (formData.items.length === 0) {
      newErrors.items = 'At least one item is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const invoice = await invoicesService.createInvoice(formData);
      navigate(`/invoices/${invoice.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const invoice = await invoicesService.createInvoice({
        ...formData,
        // Will be set to SENT after creation
      });
      
      // Update status to SENT
      await invoicesService.updateInvoiceStatus(invoice.id, 'SENT');
      
      navigate(`/invoices/${invoice.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create and send invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/invoices')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Invoice</h1>
          <p className="text-muted-foreground">Create a new sales invoice</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Invoice Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Customer *</label>
                    <Select
                      placeholder="Select customer"
                      value={formData.customerId}
                      onChange={handleCustomerChange}
                      options={customers.map(customer => ({
                        value: customer.id,
                        label: `${customer.businessName || customer.contactPerson} (${customer.customerCode})`,
                      }))}
                    />
                    {errors.customerId && (
                      <p className="text-sm text-destructive">{errors.customerId}</p>
                    )}
                  </div>

                  <FormField
                    type="date"
                    name="dueDate"
                    label="Due Date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    error={errors.dueDate}
                    required
                  />

                  <FormField
                    type="text"
                    name="paymentTerms"
                    label="Payment Terms"
                    placeholder="Net 30"
                    value={formData.paymentTerms || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                  />

                  <FormField
                    type="number"
                    name="discountPercentage"
                    label="Overall Discount %"
                    placeholder="0"
                    value={formData.discountPercentage?.toString() || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      discountPercentage: parseFloat(e.target.value) || 0 
                    }))}
                  />
                </div>

                <FormField
                  type="textarea"
                  name="notes"
                  label="Notes"
                  placeholder="Additional notes for the invoice"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Invoice Items */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Items</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add Item Form */}
                <div className="bg-muted p-4 rounded-lg mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Product *</label>
                      <Select
                        placeholder="Select product"
                        value={currentItem.productId}
                        onChange={handleProductSelect}
                        options={products.map(product => ({
                          value: product.id,
                          label: `${product.name} (${product.sku})`,
                        }))}
                      />
                      {itemErrors.productId && (
                        <p className="text-xs text-destructive">{itemErrors.productId}</p>
                      )}
                    </div>

                    <FormField
                      type="number"
                      name="quantity"
                      label="Quantity"
                      placeholder="1"
                      value={currentItem.quantity.toString()}
                      onChange={(e) => setCurrentItem(prev => ({ 
                        ...prev, 
                        quantity: parseFloat(e.target.value) || 0 
                      }))}
                      error={itemErrors.quantity}
                    />

                    <FormField
                      type="number"
                      name="unitPrice"
                      label="Unit Price"
                      placeholder="0.00"
                      value={currentItem.unitPrice?.toString() || ''}
                      onChange={(e) => setCurrentItem(prev => ({ 
                        ...prev, 
                        unitPrice: parseFloat(e.target.value) || 0 
                      }))}
                      error={itemErrors.unitPrice}
                    />

                    <FormField
                      type="number"
                      name="discountPercentage"
                      label="Discount %"
                      placeholder="0"
                      value={currentItem.discountPercentage?.toString() || ''}
                      onChange={(e) => setCurrentItem(prev => ({ 
                        ...prev, 
                        discountPercentage: parseFloat(e.target.value) || 0 
                      }))}
                    />

                    <Button type="button" onClick={addItem}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </div>

                  {currentItem.productId && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Available stock: {products.find(p => p.id === currentItem.productId)?.inventory?.reduce((sum, inv) => sum + inv.quantityAvailable, 0) || 0} units
                    </div>
                  )}
                </div>

                {/* Items Table */}
                {formData.items.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Discount</TableHead>
                          <TableHead>Line Total</TableHead>
                          <TableHead className="w-[50px]">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formData.items.map((item, index) => {
                          const product = products.find(p => p.id === item.productId);
                          const lineTotal = item.quantity * (item.unitPrice || 0);
                          const lineDiscount = lineTotal * ((item.discountPercentage || 0) / 100);
                          const finalLineTotal = lineTotal - lineDiscount;

                          return (
                            <TableRow key={index}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {product?.name || item.description || 'Unknown Product'}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {product?.sku}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                  className="w-20 h-8 text-center border rounded px-2"
                                  min="0"
                                  step="0.001"
                                />
                              </TableCell>
                              <TableCell>
                                <input
                                  type="number"
                                  value={item.unitPrice || 0}
                                  onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                  className="w-24 h-8 text-right border rounded px-2"
                                  min="0"
                                  step="0.01"
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={item.discountPercentage || 0}
                                    onChange={(e) => updateItem(index, 'discountPercentage', parseFloat(e.target.value) || 0)}
                                    className="w-16 h-8 text-center border rounded px-2"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                  />
                                  <span className="text-sm">%</span>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                {formatCurrency(finalLineTotal)}
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeItem(index)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                    No items added yet. Add products to create the invoice.
                  </div>
                )}

                {errors.items && (
                  <p className="text-sm text-destructive">{errors.items}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            {selectedCustomer && (
              <Card>
                <CardHeader>
                  <CardTitle>Customer Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <div className="font-medium">
                      {selectedCustomer.businessName || selectedCustomer.contactPerson}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedCustomer.customerCode}
                    </div>
                  </div>
                  <div className="text-sm">{selectedCustomer.phone}</div>
                  {selectedCustomer.email && (
                    <div className="text-sm text-muted-foreground">{selectedCustomer.email}</div>
                  )}
                  <div className="pt-2">
                    <div className="text-sm text-muted-foreground">Current Balance:</div>
                    <div className={`font-medium ${
                      selectedCustomer.currentBalance && selectedCustomer.currentBalance > 0 
                        ? 'text-red-600' 
                        : 'text-green-600'
                    }`}>
                      {formatCurrency(selectedCustomer.currentBalance || 0)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Invoice Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                
                {overallDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({formData.discountPercentage}%):</span>
                    <span>-{formatCurrency(overallDiscount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Tax (16%):</span>
                  <span className="font-medium">{formatCurrency(taxAmount)}</span>
                </div>
                
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button
                    type="submit"
                    className="w-full"
                    loading={loading}
                    disabled={loading || formData.items.length === 0}
                  >
                    Save as Draft
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleSaveAndSend}
                    loading={loading}
                    disabled={loading || formData.items.length === 0}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Save & Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export { CreateInvoicePage };
