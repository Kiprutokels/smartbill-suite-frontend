import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { FormField } from "../../components/forms/FormField";
import { Select } from "../../components/ui/Select";
import { Alert, AlertDescription } from "../../components/ui/Alert";
import {
  productsService,
  CreateProductRequest,
  ProductCategory,
  Brand,
} from "../../api/services/products.service";
import { validateRequired } from "../../utils/validation.utils";

const CreateProductPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [formData, setFormData] = useState<CreateProductRequest>({
    sku: "",
    name: "",
    description: "",
    categoryId: "",
    brandId: "",
    unitOfMeasure: "PCS",
    buyingPrice: 0,
    sellingPrice: 0,
    wholesalePrice: 0,
    weight: 0,
    dimensions: "",
    warrantyPeriodMonths: 0,
    reorderLevel: 0,
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      const [categoriesData, brandsData] = await Promise.all([
        productsService.getCategories(),
        productsService.getBrands(),
      ]);
      setCategories(categoriesData);
      setBrands(brandsData);
    } catch (err) {
      console.error("Failed to fetch filters:", err);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    const skuError = validateRequired(formData.sku, "SKU");
    if (skuError) newErrors.sku = skuError;

    const nameError = validateRequired(formData.name, "Product Name");
    if (nameError) newErrors.name = nameError;

    const categoryError = validateRequired(formData.categoryId, "Category");
    if (categoryError) newErrors.categoryId = categoryError;

    // Price validations
    if (formData.buyingPrice < 0) {
      newErrors.buyingPrice = "Buying price cannot be negative";
    }

    if (formData.sellingPrice < 0) {
      newErrors.sellingPrice = "Selling price cannot be negative";
    }

    if (formData.sellingPrice <= formData.buyingPrice) {
      newErrors.sellingPrice =
        "Selling price should be higher than buying price";
    }

    if (formData.wholesalePrice && formData.wholesalePrice < 0) {
      newErrors.wholesalePrice = "Wholesale price cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange =
    (field: keyof CreateProductRequest) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = [
        "buyingPrice",
        "sellingPrice",
        "wholesalePrice",
        "weight",
        "warrantyPeriodMonths",
        "reorderLevel",
      ].includes(field)
        ? parseFloat(e.target.value) || 0
        : e.target.value;

      setFormData((prev) => ({ ...prev, [field]: value }));

      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
      if (error) {
        setError(null);
      }
    };

  const handleSelectChange =
    (field: keyof CreateProductRequest) => (value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const product = await productsService.createProduct(formData);
      navigate(`/products/${product.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/products")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Product</h1>
          <p className="text-muted-foreground">
            Add a new product to your catalog
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                type="text"
                name="sku"
                label="SKU"
                placeholder="Enter product SKU"
                value={formData.sku}
                onChange={handleChange("sku")}
                error={errors.sku}
                required
              />

              <FormField
                type="text"
                name="name"
                label="Product Name"
                placeholder="Enter product name"
                value={formData.name}
                onChange={handleChange("name")}
                error={errors.name}
                required
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <Select
                  placeholder="Select category"
                  value={formData.categoryId}
                  onChange={handleSelectChange("categoryId")}
                  options={categories.map((cat) => ({
                    value: cat.id,
                    label: cat.name,
                  }))}
                />
                {errors.categoryId && (
                  <p className="text-sm text-destructive">
                    {errors.categoryId}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Brand</label>
                <Select
                  placeholder="Select brand"
                  value={formData.brandId || ""}
                  onChange={handleSelectChange("brandId")}
                  options={[
                    { value: "", label: "No Brand" },
                    ...brands.map((brand) => ({
                      value: brand.id,
                      label: brand.name,
                    })),
                  ]}
                />
              </div>

              <FormField
                type="text"
                name="unitOfMeasure"
                label="Unit of Measure"
                placeholder="PCS"
                value={formData.unitOfMeasure}
                onChange={handleChange("unitOfMeasure")}
              />

              <FormField
                type="number"
                name="buyingPrice"
                label="Buying Price"
                placeholder="0.00"
                value={formData.buyingPrice.toString()}
                onChange={handleChange("buyingPrice")}
                error={errors.buyingPrice}
                required
              />

              <FormField
                type="number"
                name="sellingPrice"
                label="Selling Price"
                placeholder="0.00"
                value={formData.sellingPrice.toString()}
                onChange={handleChange("sellingPrice")}
                error={errors.sellingPrice}
                required
              />

              <FormField
                type="number"
                name="wholesalePrice"
                label="Wholesale Price"
                placeholder="0.00"
                value={formData.wholesalePrice?.toString() || ""}
                onChange={handleChange("wholesalePrice")}
                error={errors.wholesalePrice}
              />

              <FormField
                type="number"
                name="weight"
                label="Weight (kg)"
                placeholder="0.0"
                value={formData.weight?.toString() || ""}
                onChange={handleChange("weight")}
              />

              <FormField
                type="text"
                name="dimensions"
                label="Dimensions"
                placeholder="L x W x H"
                value={formData.dimensions || ""}
                onChange={handleChange("dimensions")}
              />

              <FormField
                type="number"
                name="warrantyPeriodMonths"
                label="Warranty (Months)"
                placeholder="0"
                value={formData.warrantyPeriodMonths?.toString() || ""}
                onChange={handleChange("warrantyPeriodMonths")}
              />

              <FormField
                type="number"
                name="reorderLevel"
                label="Reorder Level"
                placeholder="0"
                value={formData.reorderLevel?.toString() || ""}
                onChange={handleChange("reorderLevel")}
              />
            </div>

            <div className="space-y-4">
              <FormField
                type="textarea"
                name="description"
                label="Description"
                placeholder="Enter product description"
                value={formData.description || ""}
                onChange={handleChange("description")}
                rows={4}
              />
            </div>

            <div className="flex gap-4 pt-6">
              <Button type="submit" loading={loading} disabled={loading}>
                Create Product
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/products")}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export { CreateProductPage };
