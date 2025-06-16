
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
import { TrendingUp, TrendingDown, Users, Receipt, CreditCard, AlertCircle, DollarSign, Wallet } from 'lucide-react';

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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full -mr-16 -mt-16 opacity-30"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-semibold text-blue-800">Total Students</CardTitle>
          <div className="p-2 bg-blue-200 rounded-full">
            <Users className="h-5 w-5 text-blue-700" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-blue-900 mb-1">{totalStudents}</div>
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="secondary" className="bg-blue-200 text-blue-800 hover:bg-blue-300">
              {activeStudents} active
            </Badge>
            <Badge variant="outline" className="border-blue-300 text-blue-700">
              {totalStudents - activeStudents} inactive
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 via-green-100 to-green-200 border-green-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-full -mr-16 -mt-16 opacity-30"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-semibold text-green-800">Monthly Income</CardTitle>
          <div className="p-2 bg-green-200 rounded-full">
            <TrendingUp className="h-5 w-5 text-green-700" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-green-900 mb-1">{formatCurrency(totalIncomeThisMonth)}</div>
          <div className="flex items-center gap-2 text-xs">
            <DollarSign className="h-3 w-3 text-green-600" />
            <span className="text-green-700">
              Potential: {formatCurrency(monthlyFeePotential)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 via-red-100 to-red-200 border-red-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-200 rounded-full -mr-16 -mt-16 opacity-30"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-semibold text-red-800">Outstanding Dues</CardTitle>
          <div className="p-2 bg-red-200 rounded-full">
            <TrendingDown className="h-5 w-5 text-red-700" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-red-900 mb-1">{formatCurrency(totalOutstanding)}</div>
          <div className="flex items-center gap-2 text-xs">
            <Receipt className="h-3 w-3 text-red-600" />
            <span className="text-red-700">
              {unpaidInvoices.length} pending invoices
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 border-purple-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full -mr-16 -mt-16 opacity-30"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-semibold text-purple-800">Advance Balance</CardTitle>
          <div className="p-2 bg-purple-200 rounded-full">
            <Wallet className="h-5 w-5 text-purple-700" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-purple-900 mb-1">{formatCurrency(totalAdvanceBalance)}</div>
          <div className="flex items-center gap-2 text-xs">
            <CreditCard className="h-3 w-3 text-purple-600" />
            <span className="text-purple-700">
              Credit available
            </span>
          </div>
        </CardContent>
      </Card>

      {overdue > 0 && (
        <Card className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 border-orange-300 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200 rounded-full -mr-16 -mt-16 opacity-30"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-orange-800">Urgent Attention</CardTitle>
            <div className="p-2 bg-orange-200 rounded-full animate-pulse">
              <AlertCircle className="h-5 w-5 text-orange-700" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-orange-900 mb-1">{overdue}</div>
            <p className="text-xs text-orange-700 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Overdue invoices requiring immediate attention
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccountingSummary;
