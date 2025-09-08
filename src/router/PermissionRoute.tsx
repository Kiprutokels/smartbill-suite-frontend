import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/Alert';

interface PermissionRouteProps {
  children: React.ReactNode;
  requiredPermissions: string[];
  requireAll?: boolean; // If true, user must have ALL permissions. If false, user needs ANY permission
}

const PermissionRoute: React.FC<PermissionRouteProps> = ({ 
  children, 
  requiredPermissions, 
  requireAll = false 
}) => {
  const { hasPermission, hasAnyPermission } = useAuth();

  const hasAccess = requireAll 
    ? requiredPermissions.every(permission => hasPermission(permission))
    : hasAnyPermission(requiredPermissions);

  if (!hasAccess) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have the required permissions to access this page.
            Please contact your administrator for access.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};

export { PermissionRoute };
