
import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from '@/lib/utils';
import { Clock, CreditCard, FileText, User } from 'lucide-react';

const RecentActivity = () => {
  const { payments, invoices, students } = useAppContext();

  // Get recent activities (last 10 items)
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
    .slice(0, 5);

  // Combine and sort by date
  const activities = [
    ...recentPayments.map(payment => ({
      id: payment.id,
      type: 'payment' as const,
      date: payment.date,
      description: `Payment of ${formatCurrency(payment.amount)} from ${payment.studentName}`,
      studentId: payment.studentId,
      amount: payment.amount,
      status: 'completed'
    })),
    ...recentInvoices.map(invoice => ({
      id: invoice.id,
      type: 'invoice' as const,
      date: invoice.issueDate,
      description: `Invoice for ${invoice.monthYear} - ${invoice.studentName}`,
      studentId: invoice.studentId,
      amount: invoice.totalAmount,
      status: invoice.status
    }))
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Latest transactions and updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div key={`${activity.type}-${activity.id}`} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${activity.type === 'payment' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                    {activity.type === 'payment' ? <CreditCard className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.date).toLocaleDateString('en-NP', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatCurrency(activity.amount)}</p>
                  <Badge variant={
                    activity.status === 'completed' || activity.status === 'paid' ? 'default' :
                    activity.status === 'overdue' ? 'destructive' : 'secondary'
                  } className="text-xs">
                    {activity.status === 'completed' ? 'Paid' : 
                     activity.status === 'paid' ? 'Paid' :
                     activity.status === 'overdue' ? 'Overdue' :
                     activity.status === 'unpaid' ? 'Pending' : 'Partial'}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">No recent activity</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
