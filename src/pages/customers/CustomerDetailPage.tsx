import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Mail, Phone, MapPin, CreditCard, Receipt, FileText } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { customersService, Customer } from '../../api/services/customers.service';
import { formatCurrency, formatDate } from '../../utils';
import { PERMISSIONS } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';

const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchCustomer(id);
    }
  }, [id]);

  const fetchCustomer = async (customerId: string) => {
    try {
      setLoading(true);
      const data = await customersService.getCustomerById(customerId);
      setCustomer(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch customer details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/customers')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Customer Not Found</h1>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p>{error}</p>
              <Button variant="outline" onClick={() => navigate('/customers')} className="mt-4">
                Back to Customers
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/customers')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {customer.businessName || customer.contactPerson || 'Customer Details'}
            </h1>
            <p className="text-muted-foreground">
              {customer.customerCode} • Created {formatDate(customer.createdAt)}
            </p>
          </div>
        </div>
        {hasPermission(PERMISSIONS.CUSTOMERS_UPDATE) && (
          <Button asChild>
            <Link to={`/customers/${customer.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Customer
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Business Name</div>
                  <div className="text-lg">{customer.businessName || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Contact Person</div>
                  <div className="text-lg">{customer.contactPerson || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Tax Number</div>
                  <div className="text-lg">{customer.taxNumber || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Credit Limit</div>
                  <div className="text-lg">{formatCurrency(customer.creditLimit)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{customer.phone}</div>
                    {customer.alternatePhone && (
                      <div className="text-sm text-muted-foreground">{customer.alternatePhone}</div>
                    )}
                  </div>
                </div>
                
                {customer.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div className="font-medium">{customer.email}</div>
                  </div>
                )}
                
                {(customer.addressLine1 || customer.city || customer.country) && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      {customer.addressLine1 && <div>{customer.addressLine1}</div>}
                      {customer.addressLine2 && <div>{customer.addressLine2}</div>}
                      <div>
                        {customer.city && `${customer.city}, `}
                        {customer.country}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Invoices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customer.invoices && customer.invoices.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customer.invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>
                            <Link 
                              to={`/invoices/${invoice.id}`}
                              className="font-medium hover:underline"
                            >
                              {invoice.invoiceNumber}
                            </Link>
                          </TableCell>
                          <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                          <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                          <TableCell>
                            <Badge variant={
                              invoice.status === 'PAID' ? 'success' :
                              invoice.status === 'OVERDUE' ? 'destructive' :
                              invoice.status === 'PARTIAL' ? 'warning' : 'secondary'
                            }>
                              {invoice.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No invoices found for this customer.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Current Balance</div>
                <div className={`text-2xl font-bold ${
                  customer.currentBalance && customer.currentBalance > 0 
                    ? 'text-red-600' 
                    : 'text-green-600'
                }`}>
                  {formatCurrency(customer.currentBalance || 0)}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-muted-foreground">Total Purchases</div>
                <div className="text-xl font-semibold">
                  {formatCurrency(customer.totalPurchases || 0)}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-muted-foreground">Status</div>
                <Badge variant={customer.isActive ? 'success' : 'secondary'}>
                  {customer.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {hasPermission(PERMISSIONS.SALES_CREATE) && (
                <Button className="w-full" asChild>
                  <Link to={`/invoices/create?customerId=${customer.id}`}>
                    <FileText className="mr-2 h-4 w-4" />
                    Create Invoice
                  </Link>
                </Button>
              )}
              
              {hasPermission(PERMISSIONS.PAYMENTS_CREATE) && (
                <Button variant="outline" className="w-full" asChild>
                  <Link to={`/payments/process?customerId=${customer.id}`}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Record Payment
                  </Link>
                </Button>
              )}
              
              <Button variant="outline" className="w-full" asChild>
                <Link to={`/customers/${customer.id}/statement`}>
                  <Receipt className="mr-2 h-4 w-4" />
                  View Statement
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Invoices</span>
                <span className="font-medium">{customer._count?.invoices || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Receipts</span>
                <span className="font-medium">{customer._count?.receipts || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Transactions</span>
                <span className="font-medium">{customer._count?.transactions || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export { CustomerDetailPage };