import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

const BrandsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Product Brands</h1>
          <p className="text-muted-foreground">Manage product brands</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Brands Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Brands management functionality will be implemented here.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { BrandsPage };