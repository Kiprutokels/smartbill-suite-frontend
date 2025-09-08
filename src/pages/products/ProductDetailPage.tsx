import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Package, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { productsService, Product } from '../../api/services/products.service';
import { inventoryService } from '../../api/services/inventory.service';
import { formatCurrency, formatDate } from '../../utils';
import { PERMISSIONS } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      const data = await productsService.getProductById(productId);
      setProduct(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = () => {
    if (!product?.inventory) return { status: 'Unknown', variant: 'secondary' as const, icon: Package };
    
    const totalStock = product.inventory.reduce((sum, inv) => sum + inv.quantityAvailable, 0);
    
    if (totalStock === 0) {
      return { status: 'Out of Stock', variant: 'destructive' as const, icon: AlertTriangle };
    } else if (totalStock <= product.reorderLevel) {
      return { status: 'Low Stock', variant: 'warning' as const, icon: AlertTriangle };
    } else {
      return { status: 'In Stock', variant: 'success' as const, icon: Package };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/products')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Product Not Found</h1>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p>{error}</p>
              <Button variant="outline" onClick={() => navigate('/products')} className="mt-4">
                Back to Products
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stockInfo = getStockStatus();
  const totalStock = product.inventory?.reduce((sum, inv) => sum + inv.quantityAvailable, 0) || 0;
  const totalReserved = product.inventory?.reduce((sum, inv) => sum + inv.quantityReserved, 0) || 0;
  const StockIcon = stockInfo.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/products')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">
              SKU: {product.sku} • Created {formatDate(product.createdAt)}
            </p>
          </div>
        </div>
        {hasPermission(PERMISSIONS.PRODUCTS_UPDATE) && (
          <Button asChild>
            <Link to={`/products/${product.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Product
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Category</div>
                  <div className="text-lg">{product.category.name}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Brand</div>
                  <div className="text-lg">{product.brand?.name || 'No Brand'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Unit of Measure</div>
                  <div className="text-lg">{product.unitOfMeasure}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Warranty Period</div>
                  <div className="text-lg">{product.warrantyPeriodMonths} months</div>
                </div>
                {product.weight && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Weight</div>
                    <div className="text-lg">{product.weight} kg</div>
                  </div>
                )}
                {product.dimensions && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Dimensions</div>
                    <div className="text-lg">{product.dimensions}</div>
                  </div>
                )}
              </div>
              
              {product.description && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Description</div>
                  <div className="mt-2 text-sm">{product.description}</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(product.buyingPrice)}
                  </div>
                  <div className="text-sm text-muted-foreground">Buying Price</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(product.sellingPrice)}
                  </div>
                  <div className="text-sm text-muted-foreground">Selling Price</div>
                </div>
                {product.wholesalePrice && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(product.wholesalePrice)}
                    </div>
                    <div className="text-sm text-muted-foreground">Wholesale Price</div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-lg font-semibold text-primary">
                    {formatCurrency(product.sellingPrice - product.buyingPrice)}
                  </div>
                  <div className="text-sm text-muted-foreground">Profit Margin</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stock Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StockIcon className="h-5 w-5" />
                Stock Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Current Status</span>
                  <Badge variant={stockInfo.variant}>{stockInfo.status}</Badge>
                </div>
                <div className="text-2xl font-bold">{totalStock} units</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Available</span>
                  <span className="font-medium">{totalStock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Reserved</span>
                  <span className="font-medium">{totalReserved}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Reorder Level</span>
                  <span className="font-medium">{product.reorderLevel}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Locations</CardTitle>
            </CardHeader>
            <CardContent>
              {product.inventory && product.inventory.length > 0 ? (
                <div className="space-y-3">
                  {product.inventory.map((inv, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                      <div>
                        <div className="font-medium">{inv.location}</div>
                        <div className="text-sm text-muted-foreground">
                          {inv.quantityReserved > 0 && `${inv.quantityReserved} reserved`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{inv.quantityAvailable}</div>
                        <div className="text-xs text-muted-foreground">available</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No inventory locations found
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {hasPermission(PERMISSIONS.INVENTORY_UPDATE) && (
                <Button className="w-full" asChild>
                  <Link to={`/inventory/adjust?productId=${product.id}`}>
                    <Package className="mr-2 h-4 w-4" />
                    Adjust Stock
                  </Link>
                </Button>
              )}
              
              <Button variant="outline" className="w-full" asChild>
                <Link to={`/inventory?productId=${product.id}`}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Inventory
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full" asChild>
                <Link to={`/products/${product.id}/history`}>
                  <Clock className="mr-2 h-4 w-4" />
                  Stock History
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={product.isActive ? 'success' : 'secondary'}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export { ProductDetailPage };