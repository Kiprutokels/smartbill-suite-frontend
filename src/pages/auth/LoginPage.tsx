import React from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { LoginForm } from '../../components/features/auth/LoginForm';
import { ThemeToggle } from '../../components/layout/ThemeToggle';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES, APP_NAME } from '../../utils/constants';

const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">{APP_NAME}</h1>
          <p className="text-muted-foreground mt-2">
            Electronics & Networking Billing System
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>Demo Credentials:</p>
          <p>Email: admin@electrobill.com</p>
          <p>Password: Admin@123</p>
        </div>
      </div>
    </div>
  );
};

export { LoginPage };
