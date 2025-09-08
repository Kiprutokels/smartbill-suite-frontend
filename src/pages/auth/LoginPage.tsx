import React from "react";
import { Navigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { LoginForm } from "../../components/features/auth/LoginForm";
import { ThemeToggle } from "../../components/layout/ThemeToggle";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES, APP_NAME } from "../../utils/constants";
import { Building2 } from "lucide-react";

const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0 bg-card/80 backdrop-blur">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {APP_NAME}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to access your admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />

          <div className="text-center text-sm text-muted-foreground mt-4">
            <p>Demo Credentials:</p>
            <p>Email: admin@electrobill.com</p>
            <p>Password: Admin@123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { LoginPage };
