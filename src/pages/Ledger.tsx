import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Link } from 'react-router-dom';
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Search, Download, TrendingUp, TrendingDown, DollarSign, FileText, Eye } from "lucide-react";
import { formatCurrency } from '@/lib/utils';
import { useIsMobile } from "@/hooks/use-mobile";

const Ledger = () => {
  const { ledgerEntries, students, invoices, payments } = useAppContext();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStudent, setFilterStudent] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState({
    from: '',
    to: ''
  });

  // Enhanced ledger entries with running balance calculation
  const enhancedLedgerEntries = useMemo(() => {
    // Create a comprehensive ledger with proper double-entry bookkeeping
    const allEntries = [];

    // Add invoice entries (Debit - Accounts Receivable)
    invoices.forEach(invoice => {
      allEntries.push({
        id: `inv-${invoice.id}`,
        date: invoice.issueDate,
        studentId: invoice.studentId,
        studentName: invoice.studentName,
        type: 'invoice' as const,
        description: `Invoice #${invoice.id.slice(-8)} - ${invoice.monthYear} (${invoice.status === 'overdue' ? 'OVERDUE' : invoice.status.toUpperCase()})`,
        debitAmount: invoice.totalAmount,
        creditAmount: 0,
        reference: invoice.id,
        status: invoice.status,
        monthYear: invoice.monthYear,
        cumulativeDue: invoice.cumulativeDue || 0
      });
    });

    // Add payment entries (Credit - Cash/Bank)
    payments.forEach(payment => {
      const invoice = invoices.find(inv => inv.id === payment.invoiceId);
      const monthPaid = invoice ? invoice.monthYear : 'General';
      
      allEntries.push({
        id: `pay-${payment.id}`,
        date: payment.date,
        studentId: payment.studentId,
        studentName: payment.studentName,
        type: payment.type === 'advance' ? 'advance_payment' as const : 'payment' as const,
        description: `${payment.type === 'advance' ? 'Advance ' : ''}Payment for ${monthPaid} - ${payment.paymentMode}${payment.reference ? ` (${payment.reference})` : ''}`,
        debitAmount: 0,
        creditAmount: payment.amount,
        reference: payment.id,
        paymentMode: payment.paymentMode,
        monthYear: monthPaid,
        invoiceId: payment.invoiceId
      });
    });

    // Sort by date (oldest first) for proper running balance calculation
    allEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate running balance for each student
    const studentBalances: { [key: string]: number } = {};
    
    return allEntries.map(entry => {
      if (!studentBalances[entry.studentId]) {
        studentBalances[entry.studentId] = 0;
      }
      
      // Update running balance (Debit increases balance, Credit decreases)
      studentBalances[entry.studentId] += entry.debitAmount - entry.creditAmount;
      
      return {
        ...entry,
        runningBalance: studentBalances[entry.studentId]
      };
    }).reverse(); // Show newest first for display
  }, [invoices, payments]);

  // Apply filters
  const filteredEntries = enhancedLedgerEntries.filter(entry => {
    // Text search
    const matchesSearch = 
      entry.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.reference && entry.reference.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Student filter
    const matchesStudent = filterStudent === 'all' || entry.studentId === filterStudent;
    
    // Type filter
    const matchesType = filterType === 'all' || entry.type === filterType;
    
    // Date range filter
    let matchesDateRange = true;
    if (filterDateRange.from) {
      matchesDateRange = matchesDateRange && new Date(entry.date) >= new Date(filterDateRange.from);
    }
    if (filterDateRange.to) {
      matchesDateRange = matchesDateRange && new Date(entry.date) <= new Date(filterDateRange.to);
    }
    
    return matchesSearch && matchesStudent && matchesType && matchesDateRange;
  });

  // Calculate comprehensive totals
  const totalDebits = filteredEntries.reduce((sum, entry) => sum + entry.debitAmount, 0);
  const totalCredits = filteredEntries.reduce((sum, entry) => sum + entry.creditAmount, 0);
  const netBalance = totalDebits - totalCredits;

  // Calculate student-wise outstanding
  const studentOutstanding = students.map(student => {
    const studentEntries = enhancedLedgerEntries.filter(e => e.studentId === student.id);
    const balance = studentEntries.reduce((sum, entry) => sum + (entry.debitAmount - entry.creditAmount), 0);
    return { ...student, outstandingBalance: balance };
  }).filter(s => s.outstandingBalance > 0).sort((a, b) => b.outstandingBalance - a.outstandingBalance);

  const handleReset = () => {
    setSearchTerm('');
    setFilterStudent('all');
    setFilterType('all');
    setFilterDateRange({ from: '', to: '' });
  };
  
  
  const exportLedger = () => {
    // Create CSV content with enhanced data
    const headers = ['Date', 'Student', 'Description', 'Type', 'Month/Year', 'Debit', 'Credit', 'Balance'];
    const csvContent = [
      headers.join(','),
      ...filteredEntries.map(entry => [
        new Date(entry.date).toLocaleDateString('en-IN'),
        `"${entry.studentName}"`,
        `"${entry.description}"`,
        entry.type,
        entry.monthYear || 'N/A',
        entry.debitAmount || 0,
        entry.creditAmount || 0,
        entry.runningBalance
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const printLedger = () => {
    // Create printable content
    const printContent = `
      <html>
        <head>
          <title>Financial Ledger - ${new Date().toLocaleDateString('en-IN')}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #2563eb; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .debit { color: #dc2626; }
            .credit { color: #16a34a; }
            .summary { margin-top: 20px; padding: 15px; background-color: #f8f9fa; }
          </style>
        </head>
        <body>
          <h1>Financial Ledger Statement</h1>
          <p class="text-center">Generated on: ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}</p>
          
          <div class="summary">
            <h3>Summary</h3>
            <p><strong>Total Debits:</strong> ${formatCurrency(totalDebits)}</p>
            <p><strong>Total Credits:</strong> ${formatCurrency(totalCredits)}</p>
            <p><strong>Net Balance:</strong> ${netBalance >= 0 ? 'Dr. ' : 'Cr. '}${formatCurrency(Math.abs(netBalance))}</p>
            <p><strong>Total Outstanding:</strong> ${formatCurrency(studentOutstanding.reduce((sum, s) => sum + s.outstandingBalance, 0))}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Student</th>
                <th>Description</th>
                <th>Type</th>
                <th>Month/Year</th>
                <th class="text-right">Debit</th>
                <th class="text-right">Credit</th>
                <th class="text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              ${filteredEntries.map(entry => `
                <tr>
                  <td>${new Date(entry.date).toLocaleDateString('en-IN')}</td>
                  <td>${entry.studentName}</td>
                  <td>${entry.description}</td>
                  <td>${entry.type}</td>
                  <td>${entry.monthYear || 'N/A'}</td>
                  <td class="text-right debit">${entry.debitAmount > 0 ? formatCurrency(entry.debitAmount) : '-'}</td>
                  <td class="text-right credit">${entry.creditAmount > 0 ? formatCurrency(entry.creditAmount) : '-'}</td>
                  <td class="text-right">${entry.runningBalance >= 0 ? 'Dr. ' : 'Cr. '}${formatCurrency(Math.abs(entry.runningBalance))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getTypeBadge = (type: string, status?: string) => {
    switch (type) {
      case 'invoice':
        return (
          <Badge variant={status === 'paid' ? 'default' : status === 'partially_paid' ? 'secondary' : 'destructive'}>
            <FileText className="h-3 w-3 mr-1" />
            Invoice
          </Badge>
        );
      case 'payment':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
            <TrendingDown className="h-3 w-3 mr-1" />
            Payment
          </Badge>
        );
      case 'advance_payment':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            <TrendingUp className="h-3 w-3 mr-1" />
            Advance
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
        <div className="text-center space-y-2 sm:space-y-4">
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Financial Ledger
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-xl max-w-3xl mx-auto">
            Complete financial tracking with double-entry bookkeeping and real-time balance calculations
          </p>
        </div>

        {/* Enhanced Stats Cards - Mobile Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs sm:text-sm">Total Debits</p>
                  <p className="text-lg sm:text-2xl lg:text-3xl font-bold">{formatCurrency(totalDebits)}</p>
                </div>
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs sm:text-sm">Total Credits</p>
                  <p className="text-lg sm:text-2xl lg:text-3xl font-bold">{formatCurrency(totalCredits)}</p>
                </div>
                <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs sm:text-sm">Net Balance</p>
                  <p className={`text-lg sm:text-2xl lg:text-3xl font-bold ${netBalance >= 0 ? 'text-white' : 'text-red-200'}`}>
                    {formatCurrency(Math.abs(netBalance))}
                  </p>
                </div>
                <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-xs sm:text-sm">Outstanding</p>
                  <p className="text-lg sm:text-2xl lg:text-3xl font-bold">
                    {studentOutstanding.reduce((sum, s) => sum + s.outstandingBalance, 0) > 0 ? 
                      formatCurrency(studentOutstanding.reduce((sum, s) => sum + s.outstandingBalance, 0)) : 
                      '₹0'
                    }
                  </p>
                </div>
                <Eye className="h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters - Mobile Responsive */}
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Ledger Filters</CardTitle>
                  <CardDescription className="text-sm">Filter entries by various criteria</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={printLedger} size={isMobile ? "sm" : "default"}>
                    <FileText className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                  <Button variant="outline" onClick={exportLedger} size={isMobile ? "sm" : "default"}>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search ledger..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={filterStudent} onValueChange={setFilterStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Students" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="invoice">Invoices</SelectItem>
                    <SelectItem value="payment">Payments</SelectItem>
                    <SelectItem value="advance_payment">Advance Payments</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={handleReset} size={isMobile ? "sm" : "default"}>
                  Reset
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">From Date</p>
                  <Input
                    type="date"
                    value={filterDateRange.from}
                    onChange={(e) => setFilterDateRange({...filterDateRange, from: e.target.value})}
                  />
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">To Date</p>
                  <Input
                    type="date"
                    value={filterDateRange.to}
                    onChange={(e) => setFilterDateRange({...filterDateRange, to: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Outstanding Students - Mobile Responsive */}
        {studentOutstanding.length > 0 && (
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl text-red-600">Students with Outstanding Balance</CardTitle>
              <CardDescription>Students who have pending payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {studentOutstanding.slice(0, 6).map(student => (
                  <div key={student.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <Link to={`/students/${student.id}`} className="font-medium text-red-800 hover:underline text-sm sm:text-base">
                        {student.name}
                      </Link>
                      <p className="text-xs text-red-600">Room {student.room}</p>
                    </div>
                    <p className="font-bold text-red-600 text-sm sm:text-base">{formatCurrency(student.outstandingBalance)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ledger Table - Mobile Responsive */}
        {filteredEntries.length === 0 ? (
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-10 sm:py-20">
              <DollarSign className="h-12 w-12 sm:h-20 sm:w-20 text-gray-400 mb-4 sm:mb-6" />
              <p className="text-muted-foreground text-lg sm:text-xl">No ledger entries match your criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
              <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold">Financial Ledger Entries</CardTitle>
              <CardDescription className="text-blue-100 text-sm sm:text-base lg:text-lg">
                Complete transaction history with running balance calculations
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isMobile ? (
                // Mobile Card View
                <div className="space-y-3 p-4">
                  {filteredEntries.map((entry) => (
                    <Card key={entry.id} className="border border-gray-200">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <Link to={`/students/${entry.studentId}`} className="font-medium text-blue-600 hover:underline text-sm">
                              {entry.studentName}
                            </Link>
                            <p className="text-xs text-muted-foreground mt-1">{entry.description}</p>
                          </div>
                          {getTypeBadge(entry.type, entry.status)}
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">{new Date(entry.date).toLocaleDateString('en-IN')}</span>
                          <div className="text-right">
                            {entry.debitAmount > 0 && (
                              <div className="text-red-600 font-medium">Dr. {formatCurrency(entry.debitAmount)}</div>
                            )}
                            {entry.creditAmount > 0 && (
                              <div className="text-green-600 font-medium">Cr. {formatCurrency(entry.creditAmount)}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="text-xs text-muted-foreground">Running Balance:</span>
                          <span className={`font-bold text-sm ${entry.runningBalance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {entry.runningBalance >= 0 ? 'Dr. ' : 'Cr. '}
                            {formatCurrency(Math.abs(entry.runningBalance))}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                // Desktop Table View
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50">
                        <TableHead className="font-bold text-gray-700">Date</TableHead>
                        <TableHead className="font-bold text-gray-700">Student</TableHead>
                        <TableHead className="font-bold text-gray-700">Description</TableHead>
                        <TableHead className="font-bold text-gray-700">Type</TableHead>
                        <TableHead className="font-bold text-gray-700 text-right">Debit (Dr.)</TableHead>
                        <TableHead className="font-bold text-gray-700 text-right">Credit (Cr.)</TableHead>
                        <TableHead className="font-bold text-gray-700 text-right">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEntries.map((entry) => (
                        <TableRow key={entry.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                          <TableCell className="font-medium">{new Date(entry.date).toLocaleDateString('en-IN')}</TableCell>
                          <TableCell>
                            <Link to={`/students/${entry.studentId}`} className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
                              {entry.studentName}
                            </Link>
                          </TableCell>
                          <TableCell className="max-w-xs truncate" title={entry.description}>{entry.description}</TableCell>
                          <TableCell>{getTypeBadge(entry.type, entry.status)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {entry.debitAmount > 0 ? (
                              <span className="text-red-600">{formatCurrency(entry.debitAmount)}</span>
                            ) : '-'}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {entry.creditAmount > 0 ? (
                              <span className="text-green-600">{formatCurrency(entry.creditAmount)}</span>
                            ) : '-'}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            <span className={entry.runningBalance >= 0 ? 'text-red-600' : 'text-green-600'}>
                              {entry.runningBalance >= 0 ? 'Dr. ' : 'Cr. '}
                              {formatCurrency(Math.abs(entry.runningBalance))}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      <TableRow className="bg-gradient-to-r from-gray-100 to-blue-100 font-bold">
                        <TableCell colSpan={4} className="text-lg">TOTALS</TableCell>
                        <TableCell className="text-right text-red-600 text-lg">{formatCurrency(totalDebits)}</TableCell>
                        <TableCell className="text-right text-green-600 text-lg">{formatCurrency(totalCredits)}</TableCell>
                        <TableCell className="text-right text-lg">
                          <span className={netBalance >= 0 ? 'text-red-600' : 'text-green-600'}>
                            {netBalance >= 0 ? 'Dr. ' : 'Cr. '}
                            {formatCurrency(Math.abs(netBalance))}
                          </span>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Ledger;
