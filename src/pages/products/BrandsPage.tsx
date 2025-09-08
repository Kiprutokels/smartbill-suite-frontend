import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Building2, Search, Filter } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Modal } from '../../components/ui/Modal';
import { FormField } from '../../components/forms/FormField';
import { Alert, AlertDescription } from '../../components/ui/Alert';
import { Input } from '../../components/ui/Input';
import { useDebounce } from '../../hooks/useDebounce';
import { productsService, Brand } from '../../api/services/products.service';
import { formatDate } from '../../utils';
import { PERMISSIONS } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';

const BrandsPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logoUrl: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    filterBrands();
  }, [brands, debouncedSearchTerm, includeInactive]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productsService.getBrands(true);
      setBrands(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch brands');
    } finally {
      setLoading(false);
    }
  };

  const filterBrands = () => {
    let filtered = brands;

    // Filter by search term
    if (debouncedSearchTerm) {
      filtered = filtered.filter(brand =>
        brand.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (brand.description && brand.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
      );
    }

    // Filter by active status
    if (!includeInactive) {
      filtered = filtered.filter(brand => brand.isActive);
    }

    setFilteredBrands(filtered);
  };

  const handleCreateBrand = () => {
    setFormData({ name: '', description: '', logoUrl: '' });
    setFormErrors({});
    setEditingBrand(null);
    setShowCreateModal(true);
  };

  const handleEditBrand = (brand: Brand) => {
    setFormData({
      name: brand.name,
      description: brand.description || '',
      logoUrl: brand.logoUrl || '',
    });
    setFormErrors({});
    setEditingBrand(brand);
    setShowCreateModal(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Brand name is required';
    }

    if (formData.logoUrl && !isValidUrl(formData.logoUrl)) {
      newErrors.logoUrl = 'Please enter a valid URL';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      if (editingBrand) {
        await productsService.updateBrand(editingBrand.id, formData);
      } else {
        await productsService.createBrand(formData);
      }
      
      setShowCreateModal(false);
      fetchBrands();
    } catch (err: any) {
      setFormErrors({ submit: err.response?.data?.message || 'Failed to save brand' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBrand = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this brand? All associated products will be unbranded.')) {
      return;
    }

    try {
      await productsService.deleteBrand(id);
      fetchBrands();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete brand');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await productsService.updateBrand(id, { isActive: !brands.find(b => b.id === id)?.isActive });
      fetchBrands();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update brand status');
    }
  };

  if (loading) {
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Link to="/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Product Brands</h1>
            <p className="text-muted-foreground">Manage product brands and manufacturers</p>
          </div>
        </div>
        {hasPermission(PERMISSIONS.PRODUCTS_CREATE) && (
          <Button onClick={handleCreateBrand}>
            <Plus className="mr-2 h-4 w-4" />
            Add Brand
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
                placeholder="Search brands..."
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
              <Button variant="outline" onClick={fetchBrands} className="mt-2">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Brands Table */}
      <Card>
        <CardHeader>
          <CardTitle>Brands ({filteredBrands.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBrands.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {searchTerm ? 'No brands found matching your search.' : 'No brands found.'}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBrands.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {brand.logoUrl ? (
                            <img
                              src={brand.logoUrl}
                              alt={brand.name}
                              className="w-8 h-8 rounded object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{brand.name}</div>
                            {brand.logoUrl && (
                              <div className="text-xs text-muted-foreground">Has Logo</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {brand.description ? (
                            <div className="text-sm">{brand.description}</div>
                          ) : (
                            <div className="text-sm text-muted-foreground italic">No description</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-medium">{brand._count?.products || 0}</div>
                          <div className="text-xs text-muted-foreground">products</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={brand.isActive ? 'success' : 'secondary'}>
                          {brand.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(brand.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {hasPermission(PERMISSIONS.PRODUCTS_UPDATE) && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditBrand(brand)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleStatus(brand.id)}
                                title={brand.isActive ? 'Deactivate' : 'Activate'}
                              >
                                {brand.isActive ? (
                                  <span className="h-4 w-4 flex items-center justify-center text-xs">⏸</span>
                                ) : (
                                  <span className="h-4 w-4 flex items-center justify-center text-xs">▶</span>
                                )}
                              </Button>
                            </>
                          )}
                          
                          {hasPermission(PERMISSIONS.PRODUCTS_DELETE) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteBrand(brand.id)}
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
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={editingBrand ? 'Edit Brand' : 'Create Brand'}
        description={editingBrand ? 'Update brand information' : 'Add a new product brand'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formErrors.submit && (
            <Alert variant="destructive">
              <AlertDescription>{formErrors.submit}</AlertDescription>
            </Alert>
          )}

          <FormField
            type="text"
            name="name"
            label="Brand Name"
            placeholder="Enter brand name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            error={formErrors.name}
            required
          />

          <FormField
            type="textarea"
            name="description"
            label="Description"
            placeholder="Enter brand description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
          />

          <FormField
            type="url"
            name="logoUrl"
            label="Logo URL"
            placeholder="https://example.com/logo.png"
            value={formData.logoUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
            error={formErrors.logoUrl}
          />

          {formData.logoUrl && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Logo Preview</div>
              <div className="border rounded-lg p-4 bg-muted/50">
                <img
                  src={formData.logoUrl}
                  alt="Brand logo preview"
                  className="w-16 h-16 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '';
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button type="submit" loading={submitting} disabled={submitting}>
              {editingBrand ? 'Update Brand' : 'Create Brand'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export { BrandsPage };