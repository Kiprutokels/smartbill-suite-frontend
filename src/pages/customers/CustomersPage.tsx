import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Pagination } from '../../components/ui/Pagination';
import { useDebounce } from '../../hooks/useDebounce';
import { customersService, Customer } from '../../api/services/customers.service';
import { formatCurrency, formatDate } from '../../utils';
import { PERMISSIONS } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';

const CustomersPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [includeInactive, setIncludeInactive] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const limit = 10;

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await customersService.getCustomers({
        page: currentPage,
        limit,
        search: debouncedSearchTerm || undefined,
        includeInactive,
      });

      setCustomers(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalCustomers(response.meta.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, debouncedSearchTerm, includeInactive]);

  const handleDeleteCustomer = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    try {
      await customersService.deleteCustomer(id);
      fetchCustomers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete customer');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await customersService.toggleCustomerStatus(id);
      fetchCustomers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update customer status');
    }
  };

  if (loading && customers.length === 0) {
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
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer database and relationships
          </p>
        </div>
        {hasPermission(PERMISSIONS.CUSTOMERS_CREATE) && (
          <Button>
            <Link to="/customers/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setIncludeInactive(!includeInactive)}
            >
              <Filter className="mr-2 h-4 w-4" />
              {includeInactive ? 'Show Active Only' : 'Show All'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p>{error}</p>
              <Button 
                variant="outline" 
                onClick={fetchCustomers}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Customers ({totalCustomers})
            {loading && <LoadingSpinner size="sm" className="ml-2" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Total Purchases</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {searchTerm ? 'No customers found matching your search.' : 'No customers found.'}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {customer.businessName || customer.contactPerson || 'No Name'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {customer.customerCode}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{customer.phone}</div>
                          {customer.email && (
                            <div className="text-sm text-muted-foreground">
                              {customer.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`font-medium ${
                          customer.currentBalance && customer.currentBalance > 0 
                            ? 'text-red-600' 
                            : 'text-green-600'
                        }`}>
                          {formatCurrency(customer.currentBalance || 0)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(customer.totalPurchases || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={customer.isActive ? 'success' : 'secondary'}>
                          {customer.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(customer.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                          
                          >
                            <Link to={`/customers/${customer.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          
                          {hasPermission(PERMISSIONS.CUSTOMERS_UPDATE) && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                              >
                                <Link to={`/customers/${customer.id}/edit`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleStatus(customer.id)}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          
                          {hasPermission(PERMISSIONS.CUSTOMERS_DELETE) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCustomer(customer.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
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
    </div>
  );
};

export { CustomersPage };
