
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
  BookOpen
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const menuItems = [
    { icon: Home, label: "Dashboard", to: "/" },
    { icon: Users, label: "Students", to: "/students" },
    { icon: FileText, label: "Invoices", to: "/invoices" },
    { icon: CreditCard, label: "Payments", to: "/payments" },
    { icon: BookOpen, label: "Ledger", to: "/ledger" },
    { icon: BarChart2, label: "Reports", to: "/reports" },
    { icon: Settings, label: "Settings", to: "/settings" },
  ];

  return (
    <aside className={cn(
      "bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
      isOpen ? "w-64" : "w-16"
    )}>
      <div className="flex flex-col h-full">
        {/* Logo/Brand */}
        <div className={cn(
          "flex items-center py-6",
          isOpen ? "px-6 justify-start" : "justify-center"
        )}>
          {isOpen ? (
            <h1 className="font-bold text-xl">HostelFin</h1>
          ) : (
            <h1 className="font-bold text-xl">HF</h1>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar">
          <ul className="py-2 space-y-1">
            {menuItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => cn(
                    "flex items-center py-2 hover:bg-primary/10 transition-colors",
                    isActive ? "border-r-4 border-primary bg-primary/10" : "",
                    isOpen ? "px-6" : "px-0 justify-center"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {isOpen && <span className="ml-3">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Section/Logout */}
        <div className={cn(
          "py-4 border-t border-white/10 mt-auto",
          isOpen ? "px-6" : "px-0"
        )}>
          <button className={cn(
            "flex items-center py-2 w-full hover:bg-primary/10 transition-colors",
            isOpen ? "px-0" : "justify-center"
          )}>
            <LogOut className="h-5 w-5" />
            {isOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
