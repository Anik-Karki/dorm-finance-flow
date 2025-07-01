
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
    <aside className={cn(
      "bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out flex-shrink-0",
      isMobile ? (
        isOpen 
          ? "fixed inset-y-0 left-0 w-64 z-50 shadow-xl" 
          : "fixed -left-64 w-64 z-50"
      ) : (
        isOpen ? "w-64" : "w-16"
      )
    )}>
      <div className="flex flex-col h-full">
        {/* Logo/Brand */}
        <div className={cn(
          "flex items-center py-4 border-b border-white/10",
          isOpen ? "px-4 sm:px-6 justify-between" : "justify-center"
        )}>
          {isOpen ? (
            <>
              <h1 className="font-bold text-lg sm:text-xl">HostelFin</h1>
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
            </>
          ) : (
            <h1 className="font-bold text-xl">HF</h1>
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
                    "flex items-center py-3 px-3 rounded-lg hover:bg-primary/10 transition-colors text-sm font-medium",
                    isActive ? "bg-primary/20 text-primary-foreground border-l-4 border-primary" : "",
                    !isOpen && !isMobile ? "justify-center" : ""
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {(isOpen || isMobile) && <span className="ml-3 truncate">{item.label}</span>}
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
            "flex items-center py-3 px-3 w-full hover:bg-primary/10 transition-colors rounded-lg text-sm font-medium",
            !isOpen && !isMobile ? "justify-center" : ""
          )}>
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {(isOpen || isMobile) && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
