
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        isMobile={isMobile}
        onClose={closeSidebar}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="mr-2 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </TopBar>
        <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
