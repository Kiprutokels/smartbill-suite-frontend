import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Send, DollarSign, Download, Printer, Mail, Copy, MoreVertical } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { invoicesService, Invoice } from '../../api/services/invoices.service';
import { formatCurrency, formatDate } from '../../utils';
import { PERMISSIONS } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';

const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showActionsModal, setShowActionsModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchInvoice(id);
    }
  }, [id]);

  const fetchInvoice = async (invoiceId: string) => {
    try {
      setLoading(true);
      const data = await invoicesService.getInvoiceById(invoiceId);
      setInvoice(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch invoice details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'DRAFT': return { variant: 'secondary' as const, label: 'Draft' };
      case 'SENT': return { variant: 'default' as const, label: 'Sent' };
      case 'PARTIAL': return { variant: 'warning' as const, label: 'Partially Paid' };
      case 'PAID': return { variant: 'success' as const, label: 'Paid' };
      case 'OVERDUE': return { variant: 'destructive' as const, label: 'Overdue' };
      case 'CANCELLED': return { variant: 'secondary' as const, label: 'Cancelled' };
      default: return { variant: 'secondary' as const, label: status };
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!invoice) return;

    try {
      await invoicesService.updateInvoiceStatus(invoice.id, newStatus);
      await fetchInvoice(invoice.id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update invoice status');
    }
  };

  const handleCancelInvoice = async () => {
    if (!invoice) return;

    if (!window.confirm('Are you sure you want to cancel this invoice? This action cannot be undone.')) {
      return;
    }

    try {
      await invoicesService.cancelInvoice(invoice.id);
      await fetchInvoice(invoice.id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel invoice');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implement PDF download
    alert('PDF download functionality would be implemented here');
  };

  const handleEmail = () => {
    // Implement email functionality
    alert('Email functionality would be implemented here');
  };

  const copyInvoiceNumber = () => {
    if (invoice) {
      navigator.clipboard.writeText(invoice.invoiceNumber);
      alert('Invoice number copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/invoices')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Invoice Not Found</h1>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p>{error}</p>
              <Button variant="outline" onClick={() => navigate('/invoices')} className="mt-4">
                Back to Invoices
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(invoice.status);
  const isOverdue = invoice.status === 'SENT' && new Date(invoice.dueDate) < new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/invoices')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{invoice.invoiceNumber}</h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyInvoiceNumber}
                title="Copy invoice number"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-muted-foreground">
              Created {formatDate(invoice.createdAt)} by {invoice.createdByUser.firstName} {invoice.createdByUser.lastName}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          
          {invoice.status !== 'CANCELLED' && (
            <Button onClick={() => setShowActionsModal(true)}>
              <MoreVertical className="mr-2 h-4 w-4" />
              Actions
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Invoice Details</CardTitle>
                <Badge variant={isOverdue ? 'destructive' : statusInfo.variant}>
                  {isOverdue ? 'Overdue' : statusInfo.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Bill To:</div>
                    <div className="mt-1">
                      <div className="font-medium text-lg">
                        {invoice.customer.businessName || invoice.customer.contactPerson}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {invoice.customer.customerCode}
                      </div>
                      <div className="text-sm">{invoice.customer.phone}</div>
                      {invoice.customer.email && (
                        <div className="text-sm text-muted-foreground">{invoice.customer.email}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Invoice Date</div>
                      <div className="font-medium">{formatDate(invoice.invoiceDate)}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Due Date</div>
                      <div className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                        {formatDate(invoice.dueDate)}
                        {isOverdue && <div className="text-xs text-red-500">Overdue</div>}
                      </div>
                    </div>
                  </div>
                  
                  {invoice.paymentTerms && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Payment Terms</div>
                      <div className="font-medium">{invoice.paymentTerms}</div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead className="text-right">Line Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.items.map((item) => {
                      const lineTotal = Number(item.quantity) * Number(item.unitPrice);
                      const lineDiscount = lineTotal * (Number(item.discountPercentage) / 100);
                      const finalTotal = lineTotal - lineDiscount;

                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.description}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.product.sku}
                                {item.product.category && ` • ${item.product.category.name}`}
                                {item.product.brand && ` • ${item.product.brand.name}`}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{Number(item.quantity).toLocaleString()}</TableCell>
                          <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell>
                            {item.discountPercentage > 0 && (
                              <span className="text-green-600">
                                {item.discountPercentage}% (-{formatCurrency(lineDiscount)})
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(finalTotal)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Invoice Totals */}
              <div className="flex justify-end mt-6">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  
                  {invoice.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-{formatCurrency(invoice.discountAmount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span className="font-medium">{formatCurrency(invoice.taxAmount)}</span>
                  </div>
                  
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(invoice.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          {invoice.receipts && invoice.receipts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoice.receipts.map((receipt) => (
                    <div key={receipt.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div>
                        <div className="font-medium">{receipt.receiptNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {receipt.paymentMethod.name} • {formatDate(receipt.paymentDate)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">
                          {formatCurrency(receipt.amount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Amount:</span>
                <span className="font-medium">{formatCurrency(invoice.totalAmount)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount Paid:</span>
                <span className="font-medium text-green-600">{formatCurrency(invoice.amountPaid)}</span>
              </div>
              
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Balance Due:</span>
                <span className={invoice.balanceDue > 0 ? 'text-red-600' : 'text-green-600'}>
                  {formatCurrency(invoice.balanceDue)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {invoice.status === 'DRAFT' && hasPermission(PERMISSIONS.SALES_UPDATE) && (
                <Button 
                  className="w-full" 
                  onClick={() => handleStatusUpdate('SENT')}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send Invoice
                </Button>
              )}

              {invoice.balanceDue > 0 && hasPermission(PERMISSIONS.PAYMENTS_CREATE) && (
                <Button 
                  className="w-full" 
                  asChild
                >
                  <Link to={`/payments/process?invoiceId=${invoice.id}`}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Record Payment
                  </Link>
                </Button>
              )}

              {hasPermission(PERMISSIONS.SALES_UPDATE) && invoice.status !== 'CANCELLED' && (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  asChild
                >
                  <Link to={`/invoices/${invoice.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Invoice
                  </Link>
                </Button>
              )}

              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleEmail}
              >
                <Mail className="mr-2 h-4 w-4" />
                Email Invoice
              </Button>

              <Button 
                variant="outline" 
                className="w-full" 
                asChild
              >
                <Link to={`/customers/${invoice.customer.id}`}>
                  View Customer
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Invoice Info */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={isOverdue ? 'destructive' : statusInfo.variant}>
                  {isOverdue ? 'Overdue' : statusInfo.label}
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Items Count:</span>
                <span className="font-medium">{invoice.items.length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Payments:</span>
                <span className="font-medium">{invoice._count?.receipts || 0}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Created By:</span>
                <span className="font-medium">
                  {invoice.createdByUser.firstName} {invoice.createdByUser.lastName}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last Updated:</span>
                <span className="font-medium">{formatDate(invoice.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions Modal */}
      <Modal
        isOpen={showActionsModal}
        onClose={() => setShowActionsModal(false)}
        title="Invoice Actions"
        description="Choose an action to perform on this invoice"
        size="md"
      >
        <div className="space-y-4">
          {invoice.status === 'DRAFT' && (
            <Button 
              className="w-full justify-start" 
              onClick={() => {
                handleStatusUpdate('SENT');
                setShowActionsModal(false);
              }}
            >
              <Send className="mr-2 h-4 w-4" />
              Mark as Sent
            </Button>
          )}

          {(invoice.status === 'SENT' || invoice.status === 'PARTIAL') && (
            <Button 
              className="w-full justify-start"
              onClick={() => {
                handleStatusUpdate('OVERDUE');
                setShowActionsModal(false);
              }}
            >
              Mark as Overdue
            </Button>
          )}

          {invoice.balanceDue === 0 && invoice.status !== 'PAID' && (
            <Button 
              className="w-full justify-start"
              onClick={() => {
                handleStatusUpdate('PAID');
                setShowActionsModal(false);
              }}
            >
              Mark as Paid
            </Button>
          )}

          {invoice.status !== 'CANCELLED' && invoice.amountPaid === 0 && hasPermission(PERMISSIONS.SALES_DELETE) && (
            <Button 
              variant="destructive"
              className="w-full justify-start"
              onClick={() => {
                handleCancelInvoice();
                setShowActionsModal(false);
              }}
            >
              Cancel Invoice
            </Button>
          )}
        </div>
      </Modal>
    </div>
  );
};

export { InvoiceDetailPage };
