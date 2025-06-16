
import React from 'react';
import AccountingSummary from '@/components/AccountingSummary';
import QuickActions from '@/components/QuickActions';
import RecentActivity from '@/components/RecentActivity';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from 'lucide-react';

const EnhancedDashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
          <Building2 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hostel Management Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive account management system</p>
        </div>
      </div>

      <AccountingSummary />

      <div className="grid gap-6 lg:grid-cols-2">
        <QuickActions />
        <RecentActivity />
      </div>
    </div>
  );
};

export default EnhancedDashboard;
