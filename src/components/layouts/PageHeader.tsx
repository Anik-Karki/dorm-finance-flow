import React from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  FileText, 
  CreditCard, 
  BookOpen, 
  BarChart2, 
  Settings,
  Plus,
  UserCheck
} from 'lucide-react';

const PageHeader: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const getPageInfo = () => {
    if (pathname === '/') return { title: 'Dashboard', icon: Home };
    if (pathname === '/students') return { title: 'Students', icon: Users };
    if (pathname.startsWith('/students/')) return { title: 'Student Details', icon: UserCheck };
    if (pathname === '/invoices') return { title: 'Invoices', icon: FileText };
    if (pathname === '/invoices/new') return { title: 'New Invoice', icon: Plus };
    if (pathname.startsWith('/invoices/')) return { title: 'Invoice Details', icon: FileText };
    if (pathname === '/payments') return { title: 'Payments', icon: CreditCard };
    if (pathname === '/ledger') return { title: 'Ledger', icon: BookOpen };
    if (pathname === '/reports') return { title: 'Reports', icon: BarChart2 };
    if (pathname === '/settings') return { title: 'Settings', icon: Settings };
    
    return { title: 'HostelFin', icon: Home };
  };

  const { title, icon: Icon } = getPageInfo();

  return (
    <div className="flex items-center space-x-2 text-foreground">
      <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
      <span className="font-semibold text-sm sm:text-base truncate">{title}</span>
    </div>
  );
};

export default PageHeader;