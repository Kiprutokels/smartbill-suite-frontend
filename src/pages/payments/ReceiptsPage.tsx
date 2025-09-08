import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

const ReceiptsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Receipts</h1>
        <p className="text-muted-foreground">View and manage payment receipts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receipt Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Receipt management functionality will be implemented here.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { ReceiptsPage };