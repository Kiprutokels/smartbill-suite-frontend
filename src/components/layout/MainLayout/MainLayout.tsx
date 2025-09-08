import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../Header';
import { Sidebar } from '../Sidebar';

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(() => {
    // Load pinned state from localStorage, default to true (pinned)
    const saved = localStorage.getItem('sidebar-pinned');
    return saved ? JSON.parse(saved) : true;
  });

  // Save pinned state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebar-pinned', JSON.stringify(sidebarPinned));
  }, [sidebarPinned]);

  // Close sidebar (only if not pinned or on mobile)
  const handleCloseSidebar = () => {
    if (!sidebarPinned || window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // Toggle pin state
  const handleTogglePin = () => {
    setSidebarPinned((prev: any) => !prev);
  };

  // Calculate the left margin based on sidebar state
  const getMainContentMargin = () => {
    if (sidebarPinned) {
      return "lg:ml-64"; // Full sidebar width when pinned
    }
    return "lg:ml-16"; // Mini sidebar width when not pinned
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={handleCloseSidebar}
        isPinned={sidebarPinned}
        onTogglePin={handleTogglePin}
      />
      
      {/* Main content area with proper responsive margins */}
      <div className={`${getMainContentMargin()} transition-all duration-300`}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="p-4 sm:p-6">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export { MainLayout };