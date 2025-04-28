
import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, AlertTriangle, Wallet, CreditCard, FileText } from "lucide-react";
import { formatCurrency } from '@/lib/utils';

const Reports = () => {
  const { students, invoices, payments } = useAppContext();
  
  // Calculate current month
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const currentMonthYear = `${String(currentMonth).padStart(2, '0')}-${currentYear}`;
  
  // Monthly income report data
  const monthlyIncome = payments.reduce((acc, payment) => {
    const paymentDate = new Date(payment.date);
    const monthYear = `${String(paymentDate.getMonth() + 1).padStart(2, '0')}-${paymentDate.getFullYear()}`;
    
    if (!acc[monthYear]) {
      acc[monthYear] = {
        month: monthYear,
        regular: 0,
        advance: 0,
        total: 0
      };
    }
    
    if (payment.type === 'regular') {
      acc[monthYear].regular += payment.amount;
    } else {
      acc[monthYear].advance += payment.amount;
    }
    
    acc[monthYear].total += payment.amount;
    
    return acc;
  }, {} as Record<string, { month: string; regular: number; advance: number; total: number }>);
  
  // Convert to array and sort by month
  const monthlyIncomeData = Object.values(monthlyIncome).sort((a, b) => {
    const [aMonth, aYear] = a.month.split('-').map(Number);
    const [bMonth, bYear] = b.month.split('-').map(Number);
    
    if (aYear !== bYear) return aYear - bYear;
    return aMonth - bMonth;
  });
  
  // Outstanding dues report
  const outstandingDues = invoices
    .filter(inv => inv.status === 'unpaid' || inv.status === 'partially_paid' || inv.status === 'overdue')
    .map(inv => ({
      id: inv.id,
      studentId: inv.studentId,
      studentName: inv.studentName,
      monthYear: inv.monthYear,
      dueDate: inv.dueDate,
      amount: inv.balanceAmount,
      status: inv.status
    }))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.due))
    .slice(0, 20); // Limit to 20 entries
  
  // Advance balance report
  const advanceBalances = students
    .filter(student => student.advanceBalance > 0)
    .map(student => ({
      id: student.id,
      name: student.name,
      room: student.room,
      advanceBalance: student.advanceBalance
    }))
    .sort((a, b) => b.advanceBalance - a.advanceBalance);

  // Income by payment mode data
  const incomeByPaymentMode = payments.reduce((acc, payment) => {
    if (!acc[payment.paymentMode]) {
      acc[payment.paymentMode] = 0;
    }
    
    acc[payment.paymentMode] += payment.amount;
    
    return acc;
  }, {} as Record<string, number>);
  
  const paymentModeData = [
    { name: 'Cash', value: incomeByPaymentMode['cash'] || 0 },
    { name: 'UPI', value: incomeByPaymentMode['upi'] || 0 },
    { name: 'Bank Transfer', value: incomeByPaymentMode['bank_transfer'] || 0 },
    { name: 'Cheque', value: incomeByPaymentMode['cheque'] || 0 },
  ];

  const handleDownload = (reportName: string) => {
    alert(`Downloading ${reportName} report - This feature will be implemented in a future update.`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
      </div>

      <Tabs defaultValue="income" className="space-y-4">
        <TabsList>
          <TabsTrigger value="income" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Income Reports
          </TabsTrigger>
          <TabsTrigger value="outstanding" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Outstanding Dues
          </TabsTrigger>
          <TabsTrigger value="advance" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Advance Balances
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Summary Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Monthly Income Report</CardTitle>
                <CardDescription>Income collected each month</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleDownload('Monthly Income')}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyIncomeData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => {
                        const formattedName = name === 'regular' ? 'Regular' : 
                                             name === 'advance' ? 'Advance' : 'Total';
                        return [`${formatCurrency(value as number)}`, formattedName];
                      }} 
                    />
                    <Bar dataKey="regular" name="Regular" fill="#4CAF50" />
                    <Bar dataKey="advance" name="Advance" fill="#2196F3" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <Table className="mt-6">
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Regular Fees</TableHead>
                    <TableHead>Advance Payments</TableHead>
                    <TableHead>Total Income</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyIncomeData.map((data) => (
                    <TableRow key={data.month}>
                      <TableCell>{data.month}</TableCell>
                      <TableCell>{formatCurrency(data.regular)}</TableCell>
                      <TableCell>{formatCurrency(data.advance)}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(data.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Income by Payment Mode</CardTitle>
                <CardDescription>Distribution of income across different payment methods</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={paymentModeData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip formatter={(value) => [`${formatCurrency(value as number)}`, 'Amount']} />
                    <Bar dataKey="value" fill="#8884d8" name="Amount" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <Table className="mt-6">
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment Mode</TableHead>
                    <TableHead>Total Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentModeData.map((data) => (
                    <TableRow key={data.name}>
                      <TableCell>{data.name}</TableCell>
                      <TableCell>{formatCurrency(data.value)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className="font-bold">
                      {formatCurrency(paymentModeData.reduce((sum, item) => sum + item.value, 0))}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outstanding" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Outstanding Dues Report</CardTitle>
                <CardDescription>Unpaid and partially paid invoices</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleDownload('Outstanding Dues')}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              {outstandingDues.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Month</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Outstanding Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outstandingDues.map((due) => (
                      <TableRow key={due.id}>
                        <TableCell className="font-medium">{due.id}</TableCell>
                        <TableCell>{due.studentName}</TableCell>
                        <TableCell>{due.monthYear}</TableCell>
                        <TableCell>{new Date(due.dueDate).toLocaleDateString('en-IN')}</TableCell>
                        <TableCell>{formatCurrency(due.amount)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              due.status === 'partially_paid' ? 'secondary' :
                              due.status === 'overdue' ? 'destructive' : 'outline'
                            }
                          >
                            {due.status === 'partially_paid' ? 'Partially Paid' :
                             due.status === 'overdue' ? 'Overdue' : 'Unpaid'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={4} className="font-bold">Total Outstanding</TableCell>
                      <TableCell className="font-bold" colSpan={2}>
                        {formatCurrency(outstandingDues.reduce((sum, due) => sum + due.amount, 0))}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No outstanding dues found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advance" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Advance Balances Report</CardTitle>
                <CardDescription>Students with advance payment balances</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleDownload('Advance Balances')}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              {advanceBalances.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Advance Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {advanceBalances.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.room}</TableCell>
                        <TableCell className="text-green-600 font-medium">
                          {formatCurrency(student.advanceBalance)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={2} className="font-bold">Total Advance Balance</TableCell>
                      <TableCell className="font-bold text-green-600">
                        {formatCurrency(advanceBalances.reduce((sum, student) => sum + student.advanceBalance, 0))}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No students with advance balance found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Current Month Summary</CardTitle>
                <CardDescription>Summary for {currentMonthYear}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Income</span>
                    <span className="font-medium">
                      {formatCurrency(monthlyIncome[currentMonthYear]?.total || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Outstanding Dues</span>
                    <span className="font-medium">
                      {formatCurrency(outstandingDues
                        .filter(due => due.monthYear === currentMonthYear)
                        .reduce((sum, due) => sum + due.amount, 0)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Invoices Generated</span>
                    <span className="font-medium">
                      {invoices.filter(inv => inv.monthYear === currentMonthYear).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payments Received</span>
                    <span className="font-medium">
                      {payments.filter(p => {
                        const date = new Date(p.date);
                        return date.getMonth() + 1 === parseInt(currentMonthYear.split('-')[0]) &&
                               date.getFullYear() === parseInt(currentMonthYear.split('-')[1]);
                      }).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Overall Statistics</CardTitle>
                <CardDescription>Summary of all-time data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Students</span>
                    <span className="font-medium">{students.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Active Students</span>
                    <span className="font-medium">
                      {students.filter(s => s.status === 'active').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Income (All-time)</span>
                    <span className="font-medium">
                      {formatCurrency(payments.reduce((sum, payment) => sum + payment.amount, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Outstanding</span>
                    <span className="font-medium">
                      {formatCurrency(invoices
                        .filter(inv => inv.status !== 'paid')
                        .reduce((sum, inv) => sum + inv.balanceAmount, 0)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Advance Balance</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(students.reduce((sum, student) => sum + student.advanceBalance, 0))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
