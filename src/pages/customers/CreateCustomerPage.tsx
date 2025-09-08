import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { FormField } from '../../components/forms/FormField';
import { Alert, AlertDescription } from '../../components/ui/Alert';
import { customersService, CreateCustomerRequest } from '../../api/services/customers.service';
import { validateEmail, validatePhone, validateRequired } from '../../utils/validation.utils';

const CreateCustomerPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateCustomerRequest>({
    customerCode: '',
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    alternatePhone: '',
    taxNumber: '',
    creditLimit: 0,
    addressLine1: '',
    addressLine2: '',
    city: '',
    country: 'Kenya',
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    const phoneError = validateRequired(formData.phone, 'Phone');
    if (phoneError) {
      newErrors.phone = phoneError;
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Optional email validation
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Alternate phone validation
    if (formData.alternatePhone && !validatePhone(formData.alternatePhone)) {
      newErrors.alternatePhone = 'Please enter a valid alternate phone number';
    }

    // Credit limit validation
    if (formData.creditLimit && formData.creditLimit < 0) {
      newErrors.creditLimit = 'Credit limit cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof CreateCustomerRequest) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = field === 'creditLimit' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
      setError(err.response?.data?.message || 'Failed to create customer');
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
          onClick={() => navigate('/customers')}
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

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
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
                name="customerCode"
                label="Customer Code"
                placeholder="Leave empty to auto-generate"
                value={formData.customerCode}
                onChange={handleChange('customerCode')}
                error={errors.customerCode}
              />

              <FormField
                type="text"
                name="businessName"
                label="Business Name"
                placeholder="Enter business name"
                value={formData.businessName}
                onChange={handleChange('businessName')}
                error={errors.businessName}
              />

              <FormField
                type="text"
                name="contactPerson"
                label="Contact Person"
                placeholder="Enter contact person name"
                value={formData.contactPerson}
                onChange={handleChange('contactPerson')}
                error={errors.contactPerson}
              />

              <FormField
                type="email"
                name="email"
                label="Email Address"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange('email')}
                error={errors.email}
              />

              <FormField
                type="tel"
                name="phone"
                label="Phone Number"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange('phone')}
                error={errors.phone}
                required
              />

              <FormField
                type="tel"
                name="alternatePhone"
                label="Alternate Phone"
                placeholder="Enter alternate phone number"
                value={formData.alternatePhone}
                onChange={handleChange('alternatePhone')}
                error={errors.alternatePhone}
              />

              <FormField
                type="text"
                name="taxNumber"
                label="Tax Number/PIN"
                placeholder="Enter tax number"
                value={formData.taxNumber}
                onChange={handleChange('taxNumber')}
                error={errors.taxNumber}
              />

              <FormField
                type="number"
                name="creditLimit"
                label="Credit Limit"
                placeholder="0.00"
                value={formData.creditLimit?.toString()}
                onChange={handleChange('creditLimit')}
                error={errors.creditLimit}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Address Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  type="text"
                  name="addressLine1"
                  label="Address Line 1"
                  placeholder="Enter street address"
                  value={formData.addressLine1}
                  onChange={handleChange('addressLine1')}
                  error={errors.addressLine1}
                />

                <FormField
                  type="text"
                  name="addressLine2"
                  label="Address Line 2"
                  placeholder="Enter apartment, suite, etc."
                  value={formData.addressLine2}
                  onChange={handleChange('addressLine2')}
                  error={errors.addressLine2}
                />

                <FormField
                  type="text"
                  name="city"
                  label="City"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={handleChange('city')}
                  error={errors.city}
                />

                <FormField
                  type="text"
                  name="country"
                  label="Country"
                  placeholder="Enter country"
                  value={formData.country}
                  onChange={handleChange('country')}
                  error={errors.country}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                loading={loading}
                disabled={loading}
              >
                Create Customer
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/customers')}
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
