import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Warehouse, 
  FileText, 
  CreditCard,
  Settings,
  X,
  Pin,
  PinOff
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { useAuth } from '../../../hooks/useAuth';
import { ROUTES, PERMISSIONS, APP_NAME } from '../../../utils/constants';
import { cn } from '../../../utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isPinned: boolean;
  onTogglePin: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isPinned, onTogglePin }) => {
  const { hasPermission } = useAuth();

  const navigation = [
    {
      name: 'Dashboard',
      href: ROUTES.DASHBOARD,
      icon: LayoutDashboard,
      permission: null,
    },
    {
      name: 'Customers',
      href: ROUTES.CUSTOMERS,
      icon: Users,
      permission: PERMISSIONS.CUSTOMERS_READ,
    },
    {
      name: 'Products',
      href: ROUTES.PRODUCTS,
      icon: Package,
      permission: PERMISSIONS.PRODUCTS_READ,
    },
    {
      name: 'Inventory',
      href: ROUTES.INVENTORY,
      icon: Warehouse,
      permission: PERMISSIONS.INVENTORY_READ,
    },
    {
      name: 'Invoices',
      href: ROUTES.INVOICES,
      icon: FileText,
      permission: PERMISSIONS.SALES_READ,
    },
    {
      name: 'Payments',
      href: ROUTES.PAYMENTS,
      icon: CreditCard,
      permission: PERMISSIONS.PAYMENTS_READ,
    },
    {
      name: 'Settings',
      href: ROUTES.SETTINGS,
      icon: Settings,
      permission: PERMISSIONS.USERS_READ,
    },
  ];

  const filteredNavigation = navigation.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  const handleNavClick = () => {
    // Only close on mobile when not pinned, or always close if not pinned
    if (!isPinned || window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && !isPinned && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 z-50 h-full bg-card border-r transition-all duration-300 ease-in-out",
        // Mobile behavior
        "w-64 transform lg:transform-none",
        isOpen ? "translate-x-0" : "-translate-x-full",
        // Desktop behavior - different based on pinned state
        isPinned 
          ? "lg:translate-x-0 lg:w-64" // Always expanded when pinned
          : "lg:translate-x-0 lg:w-16 lg:hover:w-64 group" // Collapsible when not pinned
      )}>
        <div className="flex h-full flex-col overflow-hidden">
          {/* Header */}
          <div className="flex h-14 items-center justify-between px-4 border-b shrink-0">
            <div className="flex items-center space-x-2 min-w-0">
              <div className="h-8 w-8 rounded bg-primary flex items-center justify-center shrink-0">
                <span className="text-primary-foreground font-bold text-sm">EB</span>
              </div>
              <span className={cn(
                "font-semibold truncate transition-opacity duration-300",
                isPinned 
                  ? "lg:opacity-100" // Always visible when pinned
                  : "lg:opacity-0 lg:group-hover:opacity-100" // Only on hover when not pinned
              )}>
                {APP_NAME}
              </span>
            </div>
            
            <div className="flex items-center space-x-1 shrink-0">
              {/* Pin/Unpin button - only show on desktop */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "hidden lg:flex transition-opacity duration-300",
                  isPinned 
                    ? "opacity-100" // Always visible when pinned
                    : "opacity-0 group-hover:opacity-100" // Only on hover when not pinned
                )}
                onClick={onTogglePin}
                title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
              >
                {isPinned ? (
                  <PinOff className="h-4 w-4" />
                ) : (
                  <Pin className="h-4 w-4" />
                )}
              </Button>

              {/* Close button - only show on mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden shrink-0"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                      isPinned 
                        ? "justify-start" // Always expanded when pinned
                        : "group-hover:justify-start lg:justify-center lg:px-2", // Collapsible when not pinned
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className={cn(
                    "ml-3 truncate transition-all duration-300",
                    isPinned 
                      ? "lg:opacity-100 lg:ml-3" // Always visible when pinned
                      : "lg:opacity-0 lg:group-hover:opacity-100 lg:group-hover:ml-3 lg:ml-0" // Only on hover when not pinned
                  )}>
                    {item.name}
                  </span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};

export { Sidebar };