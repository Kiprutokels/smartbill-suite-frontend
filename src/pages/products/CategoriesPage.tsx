import React, { useState, useEffect, JSX } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Folder, FolderOpen } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Modal } from '../../components/ui/Modal';
import { FormField } from '../../components/forms/FormField';
import { Select } from '../../components/ui/Select';
import { Alert, AlertDescription } from '../../components/ui/Alert';
import { productsService, ProductCategory } from '../../api/services/products.service';
import { formatDate } from '../../utils';
import { PERMISSIONS } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';

const CategoriesPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategoryId: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await productsService.getCategories(true);
      setCategories(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = () => {
    setFormData({ name: '', description: '', parentCategoryId: '' });
    setFormErrors({});
    setEditingCategory(null);
    setShowCreateModal(true);
  };

  const handleEditCategory = (category: ProductCategory) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      parentCategoryId: category.parentCategoryId || '',
    });
    setFormErrors({});
    setEditingCategory(category);
    setShowCreateModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    setFormErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);

    try {
      if (editingCategory) {
        await productsService.updateCategory(editingCategory.id, formData);
      } else {
        await productsService.createCategory(formData);
      }
      
      setShowCreateModal(false);
      fetchCategories();
    } catch (err: any) {
      setFormErrors({ submit: err.response?.data?.message || 'Failed to save category' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await productsService.deleteCategory(id);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const renderCategoryRow = (category: ProductCategory, depth = 0) => {
    const rows: JSX.Element[] = [];
    const indent = depth * 20;

    rows.push(
      <TableRow key={category.id}>
        <TableCell>
          <div className="flex items-center" style={{ paddingLeft: `${indent}px` }}>
            {depth > 0 ? <FolderOpen className="h-4 w-4 mr-2" /> : <Folder className="h-4 w-4 mr-2" />}
            <div>
              <div className="font-medium">{category.name}</div>
              {category.description && (
                <div className="text-sm text-muted-foreground">{category.description}</div>
              )}
            </div>
          </div>
        </TableCell>
        <TableCell>{category.parentCategory?.name || 'Root'}</TableCell>
        <TableCell>{category._count?.products || 0}</TableCell>
        <TableCell>{category._count?.subCategories || 0}</TableCell>
        <TableCell>
          <Badge variant={category.isActive ? 'success' : 'secondary'}>
            {category.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </TableCell>
        <TableCell>{formatDate(category.createdAt)}</TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            {hasPermission(PERMISSIONS.PRODUCTS_UPDATE) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditCategory(category)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            
            {hasPermission(PERMISSIONS.PRODUCTS_DELETE) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteCategory(category.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
    );

    // Render subcategories
    if (category.subCategories) {
      category.subCategories.forEach(subCategory => {
        rows.push(...renderCategoryRow(subCategory, depth + 1));
      });
    }

    return rows;
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
            <h1 className="text-3xl font-bold">Product Categories</h1>
            <p className="text-muted-foreground">Organize your products with categories</p>
          </div>
        </div>
        {hasPermission(PERMISSIONS.PRODUCTS_CREATE) && (
          <Button onClick={handleCreateCategory}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p>{error}</p>
              <Button variant="outline" onClick={fetchCategories} className="mt-2">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Categories ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Subcategories</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-muted-foreground">No categories found.</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  categories
                    .filter(cat => !cat.parentCategoryId) // Show only root categories
                    .map(category => renderCategoryRow(category))
                    .flat()
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
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        description={editingCategory ? 'Update category information' : 'Add a new product category'}
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
            label="Category Name"
            placeholder="Enter category name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            error={formErrors.name}
            required
          />

          <FormField
            type="textarea"
            name="description"
            label="Description"
            placeholder="Enter category description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Parent Category</label>
            <Select
              placeholder="Select parent category (optional)"
              value={formData.parentCategoryId}
              onChange={(value) => setFormData(prev => ({ ...prev, parentCategoryId: value }))}
              options={[
                { value: '', label: 'No Parent (Root Category)' },
                ...categories
                  .filter(cat => editingCategory ? cat.id !== editingCategory.id : true)
                  .map(cat => ({ value: cat.id, label: cat.name }))
              ]}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" loading={submitting} disabled={submitting}>
              {editingCategory ? 'Update Category' : 'Create Category'}
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

export { CategoriesPage };