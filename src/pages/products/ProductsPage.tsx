import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, Eye, Package, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Pagination } from '../../components/ui/Pagination';
import { useDebounce } from '../../hooks/useDebounce';
import { productsService, Product, ProductCategory, Brand } from '../../api/services/products.service';
import { formatCurrency, formatDate } from '../../utils';
import { PERMISSIONS } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';

const ProductsPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [includeInactive, setIncludeInactive] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const limit = 10;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productsService.getProducts({
        page: currentPage,
        limit,
        search: debouncedSearchTerm || undefined,
        categoryId: selectedCategory || undefined,
        brandId: selectedBrand || undefined,
        includeInactive,
      });

      setProducts(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalProducts(response.meta.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [categoriesData, brandsData] = await Promise.all([
        productsService.getCategories(),
        productsService.getBrands(),
      ]);
      setCategories(categoriesData);
      setBrands(brandsData);
    } catch (err) {
      console.error('Failed to fetch filters:', err);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, debouncedSearchTerm, selectedCategory, selectedBrand, includeInactive]);

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await productsService.deleteProduct(id);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await productsService.toggleProductStatus(id);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update product status');
    }
  };

  const getStockStatus = (product: Product) => {
    const totalStock = product.inventory?.reduce((sum, inv) => sum + inv.quantityAvailable, 0) || 0;
    
    if (totalStock === 0) {
      return { status: 'Out of Stock', variant: 'destructive' as const, icon: AlertTriangle };
    } else if (totalStock <= product.reorderLevel) {
      return { status: 'Low Stock', variant: 'warning' as const, icon: AlertTriangle };
    } else {
      return { status: 'In Stock', variant: 'success' as const, icon: Package };
    }
  };

  if (loading && products.length === 0) {
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
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            Manage your product catalog and inventory
          </p>
        </div>
        {hasPermission(PERMISSIONS.PRODUCTS_CREATE) && (
          <div className="flex gap-2">
            <Button variant="outline">
              <Link to="/products/categories">
                Manage Categories
              </Link>
            </Button>
            <Button variant="outline">
              <Link to="/products/brands">
                Manage Brands
              </Link>
            </Button>
            <Button>
              <Link to="/products/create">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Link>
            </Button>
          </div>
        )}
      </div>

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
              placeholder="All Categories"
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={[
                { value: '', label: 'All Categories' },
                ...categories.map(cat => ({ value: cat.id, label: cat.name }))
              ]}
            />
            
            <Select
              placeholder="All Brands"
              value={selectedBrand}
              onChange={setSelectedBrand}
              options={[
                { value: '', label: 'All Brands' },
                ...brands.map(brand => ({ value: brand.id, label: brand.name }))
              ]}
            />
            
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
                onClick={fetchProducts}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Products ({totalProducts})
            {loading && <LoadingSpinner size="sm" className="ml-2" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {searchTerm || selectedCategory || selectedBrand 
                          ? 'No products found matching your filters.' 
                          : 'No products found.'
                        }
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => {
                    const stockInfo = getStockStatus(product);
                    const totalStock = product.inventory?.reduce((sum, inv) => sum + inv.quantityAvailable, 0) || 0;
                    const StockIcon = stockInfo.icon;
                    
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              SKU: {product.sku}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{product.category.name}</TableCell>
                        <TableCell>{product.brand?.name || 'No Brand'}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {formatCurrency(product.sellingPrice)}
                            </div>
                            {product.wholesalePrice && (
                              <div className="text-sm text-muted-foreground">
                                Wholesale: {formatCurrency(product.wholesalePrice)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StockIcon className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{totalStock} units</div>
                              <Badge variant={stockInfo.variant} className="text-xs">
                                {stockInfo.status}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.isActive ? 'success' : 'secondary'}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDate(product.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                            >
                              <Link to={`/products/${product.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            
                            {hasPermission(PERMISSIONS.PRODUCTS_UPDATE) && (
                              <Button
                                variant="ghost"
                                size="icon"
                              >
                                <Link to={`/products/${product.id}/edit`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                            
                            {hasPermission(PERMISSIONS.PRODUCTS_DELETE) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
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
    </div>
  );
};

export { ProductsPage };
