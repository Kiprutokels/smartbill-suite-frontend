import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Send, DollarSign, FileText } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Pagination } from '../../components/ui/Pagination';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useDebounce } from '../../hooks/useDebounce';
import { invoicesService, Invoice, InvoiceSummary } from '../../api/services/invoices.service';
import { formatCurrency, formatDate } from '../../utils';
import { PERMISSIONS } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';

const InvoicesPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<InvoiceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInvoices, setTotalInvoices] = useState(0);

  // Bulk actions
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<'mark-sent' | 'mark-overdue' | 'export'>('mark-sent');
  const [bulkLoading, setBulkLoading] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const limit = 10;

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'SENT', label: 'Sent' },
    { value: 'PARTIAL', label: 'Partially Paid' },
    { value: 'PAID', label: 'Paid' },
    { value: 'OVERDUE', label: 'Overdue' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  useEffect(() => {
    fetchInvoices();
    fetchSummary();
  }, [currentPage, debouncedSearchTerm, selectedStatus, startDate, endDate]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await invoicesService.getInvoices({
        page: currentPage,
        limit,
        search: debouncedSearchTerm || undefined,
        status: selectedStatus || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      setInvoices(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalInvoices(response.meta.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const summaryData = await invoicesService.getInvoiceSummary({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setSummary(summaryData);
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'DRAFT': return { variant: 'secondary' as const, label: 'Draft' };
      case 'SENT': return { variant: 'default' as const, label: 'Sent' };
      case 'PARTIAL': return { variant: 'warning' as const, label: 'Partial' };
      case 'PAID': return { variant: 'success' as const, label: 'Paid' };
      case 'OVERDUE': return { variant: 'destructive' as const, label: 'Overdue' };
      case 'CANCELLED': return { variant: 'secondary' as const, label: 'Cancelled' };
      default: return { variant: 'secondary' as const, label: status };
    }
  };

  const handleStatusUpdate = async (invoiceId: string, newStatus: string) => {
    try {
      await invoicesService.updateInvoiceStatus(invoiceId, newStatus);
      fetchInvoices();
      fetchSummary();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update invoice status');
    }
  };

  const handleCancelInvoice = async (invoiceId: string) => {
    if (!window.confirm('Are you sure you want to cancel this invoice? This action cannot be undone.')) {
      return;
    }

    try {
      await invoicesService.cancelInvoice(invoiceId);
      fetchInvoices();
      fetchSummary();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel invoice');
    }
  };

  const handleBulkAction = async () => {
    if (selectedInvoices.length === 0) {
      alert('Please select at least one invoice');
      return;
    }

    setBulkLoading(true);
    try {
      switch (bulkAction) {
        case 'mark-sent':
          await Promise.all(selectedInvoices.map(id => invoicesService.updateInvoiceStatus(id, 'SENT')));
          break;
        case 'mark-overdue':
          await Promise.all(selectedInvoices.map(id => invoicesService.updateInvoiceStatus(id, 'OVERDUE')));
          break;
        case 'export':
          // Implement export functionality
          alert('Export functionality would be implemented here');
          break;
      }
      
      setShowBulkModal(false);
      setSelectedInvoices([]);
      fetchInvoices();
      fetchSummary();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to perform bulk action');
    } finally {
      setBulkLoading(false);
    }
  };

  const toggleInvoiceSelection = (invoiceId: string) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const selectAllInvoices = () => {
    setSelectedInvoices(invoices.map(inv => inv.id));
  };

  const clearSelection = () => {
    setSelectedInvoices([]);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  if (loading && invoices.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">
            Manage your sales invoices and track payments
          </p>
        </div>
        {hasPermission(PERMISSIONS.SALES_CREATE) && (
          <Button asChild>
            <Link to="/invoices/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Link>
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalInvoices.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                this period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.totalAmount)}</div>
              <p className="text-xs text-muted-foreground">
                invoiced amount
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.paidAmount)}</div>
              <p className="text-xs text-muted-foreground">
                collected payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <DollarSign className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.pendingAmount)}</div>
              <p className="text-xs text-muted-foreground">
                pending payments
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            
            <Select
              placeholder="All Statuses"
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={statusOptions}
            />
            
            <Input
              type="date"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            
            <Input
              type="date"
              placeholder="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            
            <Button variant="outline" onClick={resetFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedInvoices.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedInvoices.length} invoice{selectedInvoices.length !== 1 ? 's' : ''} selected
                </span>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear Selection
                </Button>
              </div>
              <Button onClick={() => setShowBulkModal(true)}>
                Bulk Actions
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p>{error}</p>
              <Button variant="outline" onClick={fetchInvoices} className="mt-2">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Invoices ({totalInvoices})
              {loading && <LoadingSpinner size="sm" className="ml-2" />}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectedInvoices.length === invoices.length ? clearSelection : selectAllInvoices}
              >
                {selectedInvoices.length === invoices.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.length === invoices.length && invoices.length > 0}
                      onChange={selectedInvoices.length === invoices.length ? clearSelection : selectAllInvoices}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {searchTerm || selectedStatus || startDate || endDate
                          ? 'No invoices found matching your filters.'
                          : 'No invoices found. Create your first invoice to get started.'
                        }
                      </div>
                      {!searchTerm && !selectedStatus && !startDate && !endDate && hasPermission(PERMISSIONS.SALES_CREATE) && (
                        <Button asChild className="mt-4">
                          <Link to="/invoices/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Your First Invoice
                          </Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => {
                    const statusInfo = getStatusInfo(invoice.status);
                    const isOverdue = invoice.status === 'SENT' && new Date(invoice.dueDate) < new Date();
                    
                    return (
                      <TableRow 
                        key={invoice.id}
                        className={selectedInvoices.includes(invoice.id) ? 'bg-muted/50' : ''}
                      >
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedInvoices.includes(invoice.id)}
                            onChange={() => toggleInvoiceSelection(invoice.id)}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <Link 
                              to={`/invoices/${invoice.id}`}
                              className="font-medium hover:underline text-primary"
                            >
                              {invoice.invoiceNumber}
                            </Link>
                            <div className="text-sm text-muted-foreground">
                              {invoice.items?.length || 0} items
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {invoice.customer.businessName || invoice.customer.contactPerson}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {invoice.customer.customerCode}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                        <TableCell>
                          <div className={isOverdue ? 'text-red-600 font-medium' : ''}>
                            {formatDate(invoice.dueDate)}
                            {isOverdue && (
                              <div className="text-xs text-red-500">Overdue</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(invoice.totalAmount)}
                        </TableCell>
                        <TableCell className="text-green-600 font-medium">
                          {formatCurrency(invoice.amountPaid)}
                        </TableCell>
                        <TableCell>
                          <div className={invoice.balanceDue > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                            {formatCurrency(invoice.balanceDue)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={isOverdue ? 'destructive' : statusInfo.variant}>
                            {isOverdue ? 'Overdue' : statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              title="View Details"
                            >
                              <Link to={`/invoices/${invoice.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            
                            {hasPermission(PERMISSIONS.SALES_UPDATE) && invoice.status !== 'CANCELLED' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                title="Edit Invoice"
                              >
                                <Link to={`/invoices/${invoice.id}/edit`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}

                            {hasPermission(PERMISSIONS.SALES_UPDATE) && invoice.status === 'DRAFT' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleStatusUpdate(invoice.id, 'SENT')}
                                title="Mark as Sent"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            )}

                            {hasPermission(PERMISSIONS.PAYMENTS_CREATE) && invoice.balanceDue > 0 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                title="Record Payment"
                              >
                                <Link to={`/payments/process?invoiceId=${invoice.id}`}>
                                  <DollarSign className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                showFirstLast
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions Modal */}
      <Modal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title="Bulk Actions"
        description={`Perform actions on ${selectedInvoices.length} selected invoices`}
        size="md"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Action</label>
            <Select
              value={bulkAction}
              onChange={(value) => setBulkAction(value as typeof bulkAction)}
              options={[
                { value: 'mark-sent', label: 'Mark as Sent' },
                { value: 'mark-overdue', label: 'Mark as Overdue' },
                { value: 'export', label: 'Export to PDF' },
              ]}
            />
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <div className="text-sm font-medium">Selected Invoices:</div>
            <div className="text-sm text-muted-foreground">
              {selectedInvoices.length} invoice{selectedInvoices.length !== 1 ? 's' : ''} selected
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={handleBulkAction} loading={bulkLoading} disabled={bulkLoading}>
              Execute Action
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowBulkModal(false)}
              disabled={bulkLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export { InvoicesPage };
