import React from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "../AppSidebar";
import { Header } from "../Header";
import { SidebarProvider, SidebarInset } from "../../ui/Sidebar";

const MainLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full">
        <AppSidebar />
        <SidebarInset>
          <Header />
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export { MainLayout };
