import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  FileText, 
  CreditCard, 
  Settings,
  Warehouse,
  Building2
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '../../ui/Sidebar';
import { useAuth } from '../../../hooks/useAuth';
import { ROUTES, PERMISSIONS, APP_NAME } from '../../../utils/constants';

const navigation = [
  { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard, permission: null },
  { name: 'Customers', href: ROUTES.CUSTOMERS, icon: Users, permission: PERMISSIONS.CUSTOMERS_READ },
  { name: 'Products', href: ROUTES.PRODUCTS, icon: Package, permission: PERMISSIONS.PRODUCTS_READ },
  { name: 'Inventory', href: ROUTES.INVENTORY, icon: Warehouse, permission: PERMISSIONS.INVENTORY_READ },
  { name: 'Invoices', href: ROUTES.INVOICES, icon: FileText, permission: PERMISSIONS.SALES_READ },
  { name: 'Payments', href: ROUTES.PAYMENTS, icon: CreditCard, permission: PERMISSIONS.PAYMENTS_READ },
  { name: 'Settings', href: '/settings/profile', icon: Settings, permission: null },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { hasPermission } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const filteredNavigation = navigation.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  const isActive = (path: string) => 
    currentPath === path || currentPath.startsWith(path + '/');

  return (
    <Sidebar collapsible="icon">
      {/* Sidebar header */}
      <SidebarHeader className="border-b border-sidebar-border">
        <div className={`flex items-center ${collapsed ? 'justify-center p-2' : 'space-x-3 p-4'}`}>
          {/* App logo/icon */}
          <div className={`${collapsed ? 'p-1' : 'p-2'} bg-sidebar-primary rounded-lg flex-shrink-0`}>
            <Building2 className={`${collapsed ? 'h-4 w-4' : 'h-6 w-6'} text-sidebar-primary-foreground`} />
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-sidebar-foreground truncate">{APP_NAME}</h1>
              <p className="text-sm text-sidebar-foreground/70 truncate">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Collapse/expand trigger */}
        <SidebarTrigger className={`ml-auto mr-2 mb-2 ${collapsed ? 'mx-auto' : 'mr-4'}`} />
      </SidebarHeader>

      {/* Sidebar content */}
      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavigation.map((item) => {
                const active = isActive(item.href);

                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={active}>
                      <NavLink to={item.href}>
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && <span className="truncate">{item.name}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
