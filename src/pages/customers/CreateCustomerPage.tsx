import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Alert, AlertDescription } from "../../components/ui/Alert";
import {
  customersService,
  CreateCustomerRequest,
} from "../../api/services/customers.service";
import {
  validateEmail,
  validatePhone,
  validateRequired,
} from "../../utils/validation.utils";

const CreateCustomerPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateCustomerRequest>({
    customerCode: "",
    businessName: "",
    contactPerson: "",
    email: "",
    phone: "",
    alternatePhone: "",
    taxNumber: "",
    creditLimit: 0,
    addressLine1: "",
    addressLine2: "",
    city: "",
    country: "Kenya",
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    const phoneError = validateRequired(formData.phone, "Phone");
    if (phoneError) {
      newErrors.phone = phoneError;
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    // Optional email validation
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Alternate phone validation
    if (formData.alternatePhone && !validatePhone(formData.alternatePhone)) {
      newErrors.alternatePhone = "Please enter a valid alternate phone number";
    }

    // Credit limit validation
    if (formData.creditLimit && formData.creditLimit < 0) {
      newErrors.creditLimit = "Credit limit cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange =
    (field: keyof CreateCustomerRequest) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        field === "creditLimit"
          ? parseFloat(e.target.value) || 0
          : e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear field error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }

      if (error) {
        setError(null);
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
      const customer = await customersService.createCustomer(formData);
      navigate(`/customers/${customer.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create customer");
    } finally {
      setLoading(false);
    }
  };

  // Common input styles
  const inputClassName =
    "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500";
  const labelClassName = "block text-sm font-medium text-gray-700 mb-1";
  const errorClassName = "text-sm text-red-600 mt-1";

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/customers")}
          aria-label="Go back to customers list"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Customer</h1>
          <p className="text-muted-foreground">
            Add a new customer to your database
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Basic Information Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="customerCode" className={labelClassName}>
                    Customer Code
                  </label>
                  <input
                    type="text"
                    id="customerCode"
                    name="customerCode"
                    placeholder="Leave empty to auto-generate"
                    value={formData.customerCode}
                    onChange={handleChange("customerCode")}
                    className={inputClassName}
                  />
                  {errors.customerCode && (
                    <p className={errorClassName}>{errors.customerCode}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="businessName" className={labelClassName}>
                    Business Name
                  </label>
                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    placeholder="Enter business name"
                    value={formData.businessName}
                    onChange={handleChange("businessName")}
                    className={inputClassName}
                  />
                  {errors.businessName && (
                    <p className={errorClassName}>{errors.businessName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="contactPerson" className={labelClassName}>
                    Contact Person
                  </label>
                  <input
                    type="text"
                    id="contactPerson"
                    name="contactPerson"
                    placeholder="Enter contact person name"
                    value={formData.contactPerson}
                    onChange={handleChange("contactPerson")}
                    className={inputClassName}
                  />
                  {errors.contactPerson && (
                    <p className={errorClassName}>{errors.contactPerson}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="taxNumber" className={labelClassName}>
                    Tax Number/PIN
                  </label>
                  <input
                    type="text"
                    id="taxNumber"
                    name="taxNumber"
                    placeholder="Enter tax number"
                    value={formData.taxNumber}
                    onChange={handleChange("taxNumber")}
                    className={inputClassName}
                  />
                  {errors.taxNumber && (
                    <p className={errorClassName}>{errors.taxNumber}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Contact Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className={labelClassName}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange("email")}
                    className={inputClassName}
                  />
                  {errors.email && (
                    <p className={errorClassName}>{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className={labelClassName}>
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange("phone")}
                    className={inputClassName}
                    required
                  />
                  {errors.phone && (
                    <p className={errorClassName}>{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="alternatePhone" className={labelClassName}>
                    Alternate Phone
                  </label>
                  <input
                    type="tel"
                    id="alternatePhone"
                    name="alternatePhone"
                    placeholder="Enter alternate phone number"
                    value={formData.alternatePhone}
                    onChange={handleChange("alternatePhone")}
                    className={inputClassName}
                  />
                  {errors.alternatePhone && (
                    <p className={errorClassName}>{errors.alternatePhone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="creditLimit" className={labelClassName}>
                    Credit Limit (KES)
                  </label>
                  <input
                    type="number"
                    id="creditLimit"
                    name="creditLimit"
                    placeholder="0.00"
                    value={formData.creditLimit?.toString()}
                    onChange={handleChange("creditLimit")}
                    className={inputClassName}
                    min="0"
                    step="0.01"
                  />
                  {errors.creditLimit && (
                    <p className={errorClassName}>{errors.creditLimit}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Address Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="addressLine1" className={labelClassName}>
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    id="addressLine1"
                    name="addressLine1"
                    placeholder="Enter street address"
                    value={formData.addressLine1}
                    onChange={handleChange("addressLine1")}
                    className={inputClassName}
                  />
                  {errors.addressLine1 && (
                    <p className={errorClassName}>{errors.addressLine1}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="addressLine2" className={labelClassName}>
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    id="addressLine2"
                    name="addressLine2"
                    placeholder="Enter apartment, suite, etc. (optional)"
                    value={formData.addressLine2}
                    onChange={handleChange("addressLine2")}
                    className={inputClassName}
                  />
                  {errors.addressLine2 && (
                    <p className={errorClassName}>{errors.addressLine2}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="city" className={labelClassName}>
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={handleChange("city")}
                    className={inputClassName}
                  />
                  {errors.city && (
                    <p className={errorClassName}>{errors.city}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="country" className={labelClassName}>
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    placeholder="Enter country"
                    value={formData.country}
                    onChange={handleChange("country")}
                    className={inputClassName}
                  />
                  {errors.country && (
                    <p className={errorClassName}>{errors.country}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                className="min-w-[140px]"
              >
                {loading ? "Creating..." : "Create Customer"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/customers")}
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

export { CreateCustomerPage };
