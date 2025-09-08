import React from 'react';
import { LogOut, User } from 'lucide-react';
import { Button } from '../../ui/Button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../../ui/DropdownMenu';
import { Avatar, AvatarFallback } from '../../ui/Avatar';
import { SidebarTrigger } from '../../ui/Sidebar';
import { ThemeToggle } from '../ThemeToggle';
import { useAuth } from '../../../hooks/useAuth';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4 flex-1">
        <SidebarTrigger className="md:hidden" />
        {/* Page title will be added here later */}
      </div>
      
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <div>
                <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} className="flex items-center space-x-2 text-destructive">
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};