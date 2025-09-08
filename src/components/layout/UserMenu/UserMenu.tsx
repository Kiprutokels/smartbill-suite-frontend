import React, { useState } from 'react';
import { LogOut, Settings, User } from 'lucide-react';
import { Button } from '../../ui/Button';
import { useAuth } from '../../../hooks/useAuth';

const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="relative h-8 w-8 rounded-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
          {user?.firstName?.charAt(0) || 'U'}
        </div>
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-56 rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
            <div className="px-2 py-1.5 text-sm font-medium">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              {user?.email}
            </div>
            <div className="h-px bg-border my-1" />
            
            <Button
              variant="ghost"
              className="w-full justify-start px-2 py-1.5 h-auto font-normal"
              onClick={() => setIsOpen(false)}
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start px-2 py-1.5 h-auto font-normal"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            
            <div className="h-px bg-border my-1" />
            
            <Button
              variant="ghost"
              className="w-full justify-start px-2 py-1.5 h-auto font-normal text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export { UserMenu };
