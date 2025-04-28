
import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  Users,
  CreditCard,
  AlertTriangle,
  Wallet,
  TrendingUp
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const Dashboard = () => {
  const { students, invoices, payments, ledgerEntries } = useAppContext();

  // Calculate stats
  const activeStudents = students.filter(s => s.status === 'active').length;
  const totalIncomeThisMonth = payments
    .filter(p => {
      const paymentDate = new Date(p.date);
      const currentDate = new Date();
      return paymentDate.getMonth() === currentDate.getMonth() &&
             paymentDate.getFullYear() === currentDate.getFullYear();
    })
    .reduce((sum, payment) => sum + payment.amount, 0);
  const pendingDues = invoices
    .filter(inv => inv.status === 'unpaid' || inv.status === 'partially_paid' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.balanceAmount, 0);
  const totalAdvanceBalance = students.reduce((sum, student) => sum + student.advanceBalance, 0);
  
  // Recent transactions (last 5)
  const recentTransactions = [...ledgerEntries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Invoice status data for pie chart
  const invoiceStatusData = [
    { name: 'Paid', value: invoices.filter(inv => inv.status === 'paid').length },
    { name: 'Partially Paid', value: invoices.filter(inv => inv.status === 'partially_paid').length },
    { name: 'Unpaid', value: invoices.filter(inv => inv.status === 'unpaid').length },
    { name: 'Overdue', value: invoices.filter(inv => inv.status === 'overdue').length }
  ].filter(item => item.value > 0);

  // Monthly revenue data (mock data for now)
  const monthlyRevenueData = [
    { name: 'Jan', amount: 25000 },
    { name: 'Feb', amount: 30000 },
    { name: 'Mar', amount: 28000 },
    { name: 'Apr', amount: totalIncomeThisMonth || 32000 }
  ];

  // Colors for pie chart
  const COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#F44336'];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeStudents}</div>
            <p className="text-xs text-muted-foreground">Total registered: {students.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Income This Month</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalIncomeThisMonth)}</div>
            <p className="text-xs text-muted-foreground">From {payments.filter(p => {
              const paymentDate = new Date(p.date);
              const currentDate = new Date();
              return paymentDate.getMonth() === currentDate.getMonth() &&
                    paymentDate.getFullYear() === currentDate.getFullYear();
            }).length} payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Dues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(pendingDues)}</div>
            <p className="text-xs text-muted-foreground">{invoices.filter(inv => inv.status === 'unpaid' || inv.status === 'partially_paid' || inv.status === 'overdue').length} unpaid invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Advance Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAdvanceBalance)}</div>
            <p className="text-xs text-muted-foreground">{students.filter(s => s.advanceBalance > 0).length} students with advance</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyRevenueData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${formatCurrency(value as number)}`, 'Revenue']} />
                      <Bar dataKey="amount" fill="#0ea5e9" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Invoice Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={invoiceStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {invoiceStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(value) => [`${value} invoices`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card className="col-span-7">
            <CardHeader>
              <CardTitle>Fee Collection Statistics</CardTitle>
              <CardDescription>Monthly fee collection breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Jan', collected: 22000, pending: 3000 },
                      { name: 'Feb', collected: 25000, pending: 5000 },
                      { name: 'Mar', collected: 28000, pending: 0 },
                      { name: 'Apr', collected: 24000, pending: 8000 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => {
                        const formattedName = name === 'collected' ? 'Collected' : 'Pending';
                        return [`${formatCurrency(value as number)}`, formattedName];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="collected" stackId="a" fill="#4CAF50" name="Collected" />
                    <Bar dataKey="pending" stackId="a" fill="#F44336" name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest financial activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map(transaction => (
                  <div key={transaction.id} className="flex items-center p-3 border rounded-md">
                    <div className={`p-2 rounded-full mr-3 ${
                      transaction.type === 'payment' ? 'bg-green-100 text-green-700' : 
                      transaction.type === 'fee' ? 'bg-blue-100 text-blue-700' : 
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {transaction.type === 'payment' ? (
                        <Wallet className="h-5 w-5" />
                      ) : transaction.type === 'fee' ? (
                        <CreditCard className="h-5 w-5" />
                      ) : (
                        <TrendingUp className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{transaction.studentName}</p>
                      <p className="text-sm text-muted-foreground">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString('en-IN', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div className={`font-medium ${transaction.amount < 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount < 0 ? '- ' : '+ '}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
