
import React, { useState } from 'react';
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  FileText,
  ArrowUpDown,
  Filter,
  DollarSign
} from "lucide-react";
import { formatCurrency } from '@/lib/utils';

const Invoices = () => {
  const { invoices, students } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Calculate cumulative dues for each student
  const calculateCumulativeDues = () => {
    const studentDues: { [key: string]: number } = {};
    
    students.forEach(student => {
      const studentInvoices = invoices
        .filter(inv => inv.studentId === student.id)
        .sort((a, b) => new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime());
      
      let cumulativeDue = 0;
      studentInvoices.forEach(invoice => {
        cumulativeDue += invoice.balanceAmount;
        studentDues[invoice.id] = cumulativeDue;
      });
    });
    
    return studentDues;
  };

  const cumulativeDues = calculateCumulativeDues();
  
  // Enhanced invoices with cumulative due information
  const enhancedInvoices = invoices.map(invoice => ({
    ...invoice,
    cumulativeDue: cumulativeDues[invoice.id] || invoice.balanceAmount
  }));
  
  // Filter invoices based on search term and status
  const filteredInvoices = enhancedInvoices.filter(invoice => {
    const matchesSearch = invoice.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.id.includes(searchTerm) ||
                         invoice.monthYear.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'paid' && invoice.status === 'paid') ||
                         (statusFilter === 'partially_paid' && invoice.status === 'partially_paid') ||
                         (statusFilter === 'due' && (invoice.status === 'unpaid' || invoice.status === 'overdue'));
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort invoices
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (!sortField) return 0;
    
    if (sortField === 'issueDate') {
      return sortDirection === 'asc' 
        ? new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime()
        : new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
    }
    
    if (sortField === 'dueDate') {
      return sortDirection === 'asc' 
        ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    }
    
    if (sortField === 'totalAmount') {
      return sortDirection === 'asc' 
        ? a.totalAmount - b.totalAmount
        : b.totalAmount - a.totalAmount;
    }
    
    if (sortField === 'cumulativeDue') {
      return sortDirection === 'asc' 
        ? a.cumulativeDue - b.cumulativeDue
        : b.cumulativeDue - a.cumulativeDue;
    }
    
    if (sortField === 'status') {
      const statusOrder = { paid: 0, partially_paid: 1, unpaid: 2, overdue: 3 };
      return sortDirection === 'asc' 
        ? statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder]
        : statusOrder[b.status as keyof typeof statusOrder] - statusOrder[a.status as keyof typeof statusOrder];
    }
    
    return 0;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
      case 'partially_paid':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Partially Paid</Badge>;
      case 'unpaid':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Due</Badge>;
      case 'overdue':
        return <Badge className="bg-red-200 text-red-900 border-red-300">Overdue</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8 space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Invoice Management
          </h1>
          <p className="text-muted-foreground text-lg">
            Track payments, dues, and invoice statuses with smart analytics
          </p>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                className="pl-10 h-12 border-2 border-gray-200 focus:border-blue-400 rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 h-12 border-2 border-gray-200 focus:border-blue-400 rounded-xl">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Invoices</SelectItem>
                <SelectItem value="paid">Paid Only</SelectItem>
                <SelectItem value="partially_paid">Partially Paid</SelectItem>
                <SelectItem value="due">Due Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-12 px-6 rounded-xl">
            <Link to="/invoices/new">
              <Plus className="mr-2 h-5 w-5" />
              New Invoice
            </Link>
          </Button>
        </div>

        {filteredInvoices.length === 0 ? (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <DollarSign className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-muted-foreground text-lg">No invoices match your search criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
              <CardTitle className="text-2xl">Invoice Overview</CardTitle>
              <CardDescription className="text-blue-100">
                Complete invoice tracking with cumulative due calculations
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-bold text-gray-700">Invoice #</TableHead>
                    <TableHead className="font-bold text-gray-700">Student</TableHead>
                    <TableHead className="font-bold text-gray-700">Month</TableHead>
                    <TableHead onClick={() => handleSort('issueDate')} className="cursor-pointer font-bold text-gray-700">
                      <div className="flex items-center hover:text-blue-600">
                        Issue Date
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('totalAmount')} className="cursor-pointer font-bold text-gray-700">
                      <div className="flex items-center hover:text-blue-600">
                        Total Amount
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-gray-700">Partial Paid</TableHead>
                    <TableHead onClick={() => handleSort('cumulativeDue')} className="cursor-pointer font-bold text-gray-700">
                      <div className="flex items-center hover:text-blue-600">
                        Total Due
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('status')} className="cursor-pointer font-bold text-gray-700">
                      <div className="flex items-center hover:text-blue-600">
                        Status
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-bold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-blue-50/50 transition-colors border-b">
                      <TableCell className="font-mono text-sm font-medium">{invoice.id}</TableCell>
                      <TableCell>
                        <Link to={`/students/${invoice.studentId}`} className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
                          {invoice.studentName}
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium">{invoice.monthYear}</TableCell>
                      <TableCell className="text-gray-600">{new Date(invoice.issueDate).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell className="font-bold text-lg">{formatCurrency(invoice.totalAmount)}</TableCell>
                      <TableCell className="font-bold text-green-600">
                        {invoice.paidAmount > 0 ? formatCurrency(invoice.paidAmount) : '-'}
                      </TableCell>
                      <TableCell className={`font-bold text-lg ${invoice.cumulativeDue > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                        {invoice.cumulativeDue > 0 ? formatCurrency(invoice.cumulativeDue) : '-'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(invoice.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline" className="hover:bg-blue-50 border-blue-200">
                          <Link to={`/invoices/${invoice.id}`}>
                            <FileText className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Invoices;
