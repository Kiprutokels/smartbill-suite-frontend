import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, AlertTriangle, TrendingUp, Settings, Search, Filter, RotateCcw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Modal } from '../../components/ui/Modal';
import { FormField } from '../../components/forms/FormField';
import { Select } from '../../components/ui/Select';
import { Alert, AlertDescription } from '../../components/ui/Alert';
import { Input } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Pagination';
import { useDebounce } from '../../hooks/useDebounce';
import { inventoryService, InventoryItem, StockAdjustment } from '../../api/services/inventory.service';
import { formatDate } from '../../utils';
import { PERMISSIONS } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';

const InventoryPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [locations, setLocations] = useState<string[]>([]);
  const [summary, setSummary] = useState<any>(null);

  // Stock adjustment modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [adjustmentData, setAdjustmentData] = useState<StockAdjustment>({
    quantity: 0,
    type: 'INCREASE',
    reason: '',
    location: '',
  });
  const [adjustmentErrors, setAdjustmentErrors] = useState<Record<string, string>>({});
  const [adjusting, setAdjusting] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const limit = 10;

  useEffect(() => {
    fetchInventory();
    fetchLocations();
    fetchSummary();
  }, [currentPage, debouncedSearchTerm, selectedLocation, showLowStockOnly]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await inventoryService.getInventory({
        page: currentPage,
        limit,
        search: debouncedSearchTerm || undefined,
        location: selectedLocation || undefined,
        lowStock: showLowStockOnly,
      });

      setInventory(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalItems(response.meta.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const locationsData = await inventoryService.getLocations();
      setLocations(locationsData);
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    }
  };

  const fetchSummary = async () => {
    try {
      const summaryData = await inventoryService.getInventorySummary();
      setSummary(summaryData);
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantityAvailable === 0) {
      return { status: 'Out of Stock', variant: 'destructive' as const, icon: AlertTriangle };
    } else if (item.quantityAvailable <= item.product.reorderLevel) {
      return { status: 'Low Stock', variant: 'warning' as const, icon: AlertTriangle };
    } else {
      return { status: 'In Stock', variant: 'success' as const, icon: Package };
    }
  };

  const handleAdjustStock = (item: InventoryItem) => {
    setAdjustingItem(item);
    setAdjustmentData({
      quantity: 0,
      type: 'INCREASE',
      reason: '',
      location: item.location,
    });
    setAdjustmentErrors({});
    setShowAdjustModal(true);
  };

  const validateAdjustment = (): boolean => {
    const errors: Record<string, string> = {};

    if (!adjustmentData.quantity || adjustmentData.quantity <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    }

    if (!adjustmentData.reason.trim()) {
      errors.reason = 'Reason is required';
    }

    if (adjustmentData.type === 'DECREASE' && adjustingItem) {
      if (adjustmentData.quantity > adjustingItem.quantityAvailable) {
        errors.quantity = `Cannot decrease more than available stock (${adjustingItem.quantityAvailable})`;
      }
    }

    setAdjustmentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adjustingItem || !validateAdjustment()) return;

    setAdjusting(true);

    try {
      await inventoryService.adjustStock(adjustingItem.id, adjustmentData);
      setShowAdjustModal(false);
      fetchInventory();
      fetchSummary();
    } catch (err: any) {
      setAdjustmentErrors({ submit: err.response?.data?.message || 'Failed to adjust stock' });
    } finally {
      setAdjusting(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedLocation('');
    setShowLowStockOnly(false);
    setCurrentPage(1);
  };

  if (loading && inventory.length === 0) {
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
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">
            Track and manage your product inventory across all locations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Link to="/inventory/low-stock">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Low Stock Alert
            </Link>
          </Button>
          {hasPermission(PERMISSIONS.INVENTORY_CREATE) && (
            <Button>
              <Link to="/inventory/adjustment/bulk">
                <Settings className="mr-2 h-4 w-4" />
                Bulk Adjustment
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalProducts.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {summary.locations} locations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalQuantity.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                units in stock
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{summary.lowStockCount}</div>
              <p className="text-xs text-muted-foreground">
                need attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summary.outOfStockCount}</div>
              <p className="text-xs text-muted-foreground">
                require restocking
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
            
            <Select
              placeholder="All Locations"
              value={selectedLocation}
              onChange={setSelectedLocation}
              options={[
                { value: '', label: 'All Locations' },
                ...locations.map(location => ({ value: location, label: location }))
              ]}
            />
            
            <Button
              variant={showLowStockOnly ? "default" : "outline"}
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            >
              <Filter className="mr-2 h-4 w-4" />
              {showLowStockOnly ? 'Low Stock Only' : 'All Stock'}
            </Button>
            
            <Button
              variant="outline"
              onClick={resetFilters}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Filters
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
              <Button variant="outline" onClick={fetchInventory} className="mt-2">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Inventory ({totalItems})
            {loading && <LoadingSpinner size="sm" className="ml-2" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Reserved</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {searchTerm || selectedLocation || showLowStockOnly
                          ? 'No inventory found matching your filters.'
                          : 'No inventory found.'
                        }
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  inventory.map((item) => {
                    const stockInfo = getStockStatus(item);
                    const StockIcon = stockInfo.icon;
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              SKU: {item.product.sku}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {item.product.category.name}
                              {item.product.brand && ` • ${item.product.brand.name}`}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.location}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="text-lg font-semibold">{item.quantityAvailable}</div>
                            <div className="text-xs text-muted-foreground">units</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-yellow-600">{item.quantityReserved}</div>
                            <div className="text-xs text-muted-foreground">reserved</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StockIcon className="h-4 w-4" />
                            <Badge variant={stockInfo.variant}>{stockInfo.status}</Badge>
                          </div>
                          {item.quantityAvailable <= item.product.reorderLevel && (
                            <div className="text-xs text-yellow-600 mt-1">
                              Reorder at: {item.product.reorderLevel}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {formatDate(item.lastStockUpdate)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {hasPermission(PERMISSIONS.INVENTORY_UPDATE) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleAdjustStock(item)}
                                title="Adjust Stock"
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              title="View Details"
                            >
                              <Link to={`/products/${item.product.id}`}>
                                <Package className="h-4 w-4" />
                              </Link>
                            </Button>
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

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        title="Adjust Stock"
        description={adjustingItem ? `Adjust stock for ${adjustingItem.product.name}` : ''}
        size="md"
      >
        {adjustingItem && (
          <form onSubmit={handleSubmitAdjustment} className="space-y-4">
            {adjustmentErrors.submit && (
              <Alert variant="destructive">
                <AlertDescription>{adjustmentErrors.submit}</AlertDescription>
              </Alert>
            )}

            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{adjustingItem.product.name}</div>
                  <div className="text-sm text-muted-foreground">Current Stock: {adjustingItem.quantityAvailable}</div>
                </div>
                <Badge variant="outline">{adjustingItem.location}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Adjustment Type</label>
                <Select
                  value={adjustmentData.type}
                  onChange={(value) => setAdjustmentData(prev => ({ 
                    ...prev, 
                    type: value as 'INCREASE' | 'DECREASE' | 'SET' 
                  }))}
                  options={[
                    { value: 'INCREASE', label: 'Increase Stock' },
                    { value: 'DECREASE', label: 'Decrease Stock' },
                    { value: 'SET', label: 'Set Exact Amount' },
                  ]}
                />
              </div>

              <FormField
                type="number"
                name="quantity"
                label={adjustmentData.type === 'SET' ? 'New Quantity' : 'Adjustment Quantity'}
                placeholder="0"
                value={adjustmentData.quantity.toString()}
                onChange={(e) => setAdjustmentData(prev => ({ 
                  ...prev, 
                  quantity: parseInt(e.target.value) || 0 
                }))}
                error={adjustmentErrors.quantity}
                required
              />
            </div>

            <FormField
              type="textarea"
              name="reason"
              label="Reason for Adjustment"
              placeholder="Explain the reason for this stock adjustment"
              value={adjustmentData.reason}
              onChange={(e) => setAdjustmentData(prev => ({ 
                ...prev, 
                reason: e.target.value 
              }))}
              error={adjustmentErrors.reason}
              required
              rows={3}
            />

            {adjustmentData.quantity > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Preview:
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  {adjustmentData.type === 'INCREASE' && 
                    `${adjustingItem.quantityAvailable} + ${adjustmentData.quantity} = ${adjustingItem.quantityAvailable + adjustmentData.quantity}`
                  }
                  {adjustmentData.type === 'DECREASE' && 
                    `${adjustingItem.quantityAvailable} - ${adjustmentData.quantity} = ${Math.max(0, adjustingItem.quantityAvailable - adjustmentData.quantity)}`
                  }
                  {adjustmentData.type === 'SET' && 
                    `Current: ${adjustingItem.quantityAvailable} → New: ${adjustmentData.quantity}`
                  }
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="submit" loading={adjusting} disabled={adjusting}>
                {adjusting ? 'Adjusting...' : 'Adjust Stock'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAdjustModal(false)}
                disabled={adjusting}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export { InventoryPage };