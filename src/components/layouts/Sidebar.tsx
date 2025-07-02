
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  FileText,
  CreditCard,
  BarChart2,
  Settings,
  LogOut,
  BookOpen,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  isOpen: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, isMobile = false, onClose }) => {
  const menuItems = [
    { icon: Home, label: "Dashboard", to: "/" },
    { icon: Users, label: "Students", to: "/students" },
    { icon: FileText, label: "Invoices", to: "/invoices" },
    { icon: CreditCard, label: "Payments", to: "/payments" },
    { icon: BookOpen, label: "Ledger", to: "/ledger" },
    { icon: BarChart2, label: "Reports", to: "/reports" },
    { icon: Settings, label: "Settings", to: "/settings" },
  ];

  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <TooltipProvider>
      <aside className={cn(
        "bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out flex-shrink-0",
        isMobile ? (
          isOpen 
            ? "fixed inset-y-0 left-0 w-64 z-50 shadow-xl" 
            : "fixed -left-64 w-64 z-50"
        ) : (
          "w-64" // Always keep full width to show both icon and text
        )
      )}>
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className={cn(
            "flex items-center py-4 border-b border-white/10",
            isOpen ? "px-4 sm:px-6 justify-between" : "px-4 justify-between"
          )}>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="font-bold text-primary-foreground text-sm">HF</span>
              </div>
              <h1 className="font-bold text-lg sm:text-xl">HostelFin</h1>
            </div>
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-sidebar-foreground hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto custom-scrollbar py-2">
            <ul className="space-y-1 px-2">
              {menuItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={handleNavClick}
                    className={({ isActive }) => cn(
                      "flex items-center py-3 px-4 rounded-lg hover:bg-primary/10 transition-colors text-sm font-medium group",
                      isActive ? "bg-primary/20 text-primary-foreground border-l-4 border-primary" : ""
                    )}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="truncate font-medium">{item.label}</span>
                    </div>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Bottom Section/Logout */}
          <div className={cn(
            "py-4 border-t border-white/10 px-2",
          )}>
            <button className={cn(
              "flex items-center py-3 px-4 w-full hover:bg-primary/10 transition-colors rounded-lg text-sm font-medium group"
            )}>
              <div className="flex items-center space-x-3 w-full">
                <LogOut className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">Logout</span>
              </div>
            </button>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default Sidebar;
