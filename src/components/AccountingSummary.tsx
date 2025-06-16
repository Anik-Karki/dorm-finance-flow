
import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Users, Receipt, CreditCard, AlertCircle } from 'lucide-react';

const AccountingSummary = () => {
  const { students, invoices, payments } = useAppContext();

  // Calculate key metrics
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'active').length;
  
  // Calculate current month metrics
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const currentMonthPayments = payments.filter(payment => {
    const paymentDate = new Date(payment.date);
    return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
  });
  
  const totalIncomeThisMonth = currentMonthPayments.reduce((sum, payment) => sum + payment.amount, 0);
  
  // Calculate outstanding dues
  const unpaidInvoices = invoices.filter(inv => inv.status === 'unpaid' || inv.status === 'overdue' || inv.status === 'partially_paid');
  const totalOutstanding = unpaidInvoices.reduce((sum, inv) => sum + inv.balanceAmount, 0);
  
  // Calculate advance balances
  const totalAdvanceBalance = students.reduce((sum, student) => sum + student.advanceBalance, 0);
  
  // Calculate monthly fee potential
  const monthlyFeePotential = students.filter(s => s.status === 'active').reduce((sum, student) => sum + student.feeAmount, 0);

  const overdue = invoices.filter(inv => inv.status === 'overdue').length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700">Total Students</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">{totalStudents}</div>
          <p className="text-xs text-blue-600">
            {activeStudents} active • {totalStudents - activeStudents} inactive
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-700">Monthly Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">{formatCurrency(totalIncomeThisMonth)}</div>
          <p className="text-xs text-green-600">
            Potential: {formatCurrency(monthlyFeePotential)}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-700">Outstanding Dues</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-900">{formatCurrency(totalOutstanding)}</div>
          <p className="text-xs text-red-600">
            {unpaidInvoices.length} pending invoices
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700">Advance Balance</CardTitle>
          <CreditCard className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900">{formatCurrency(totalAdvanceBalance)}</div>
          <p className="text-xs text-purple-600">
            Credit available
          </p>
        </CardContent>
      </Card>

      {overdue > 0 && (
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Urgent Attention</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{overdue}</div>
            <p className="text-xs text-orange-600">
              Overdue invoices requiring immediate attention
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccountingSummary;
