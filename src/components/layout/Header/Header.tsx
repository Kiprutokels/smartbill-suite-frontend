import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '../../ui/Button';
import { UserMenu } from '../UserMenu';
import { ThemeToggle } from '../ThemeToggle';
import { APP_NAME } from '../../../utils/constants';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 sm:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden mr-2"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Show app name on mobile when sidebar is closed */}
        <div className="flex items-center space-x-2 lg:hidden">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">EB</span>
          </div>
          <h1 className="font-semibold text-lg">{APP_NAME}</h1>
        </div>

        {/* Desktop app name */}
        <div className="hidden lg:flex items-center space-x-2">
          <h1 className="font-semibold text-lg">{APP_NAME}</h1>
        </div>

        <div className="flex-1" />

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export { Header };