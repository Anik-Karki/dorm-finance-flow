
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
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { formatCurrency, formatNepaliMonthYear } from '@/lib/utils';

const Invoices = () => {
  const { invoices, students } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('overdue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Calculate enhanced invoice data with cumulative dues
  const enhancedInvoices = invoices.map(invoice => {
    const student = students.find(s => s.id === invoice.studentId);
    const studentInvoices = invoices
      .filter(inv => inv.studentId === invoice.studentId)
      .sort((a, b) => new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime());
    
    // Calculate cumulative due up to this invoice
    let cumulativeDue = 0;
    for (const inv of studentInvoices) {
      cumulativeDue += inv.balanceAmount;
      if (inv.id === invoice.id) break;
    }
    
    return {
      ...invoice,
      cumulativeDue,
      isLatest: studentInvoices[studentInvoices.length - 1]?.id === invoice.id,
      studentRoom: student?.room || 'N/A'
    };
  });
  
  // Filter invoices based on search term and status
  const filteredInvoices = enhancedInvoices.filter(invoice => {
    const matchesSearch = invoice.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.id.includes(searchTerm) ||
                         invoice.monthYear.includes(searchTerm) ||
                         invoice.studentRoom.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'paid' && invoice.status === 'paid') ||
                         (statusFilter === 'unpaid' && invoice.status === 'unpaid') ||
                         (statusFilter === 'overdue' && invoice.status === 'overdue') ||
                         (statusFilter === 'partially_paid' && invoice.status === 'partially_paid');
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort invoices with overdue prioritization
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    // Primary sort: Always prioritize overdue invoices
    if (sortField === 'overdue' || sortField === 'issueDate') {
      const aDaysOverdue = a.status === 'overdue' ? 
        Math.floor((new Date().getTime() - new Date(a.dueDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
      const bDaysOverdue = b.status === 'overdue' ? 
        Math.floor((new Date().getTime() - new Date(b.dueDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      if (aDaysOverdue !== bDaysOverdue) {
        return bDaysOverdue - aDaysOverdue; // Most overdue first
      }
      
      // Secondary sort by cumulative due (highest first)
      if (a.cumulativeDue !== b.cumulativeDue) {
        return b.cumulativeDue - a.cumulativeDue;
      }
      
      // Tertiary sort by issue date (latest first)
      return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
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
      const statusOrder = { overdue: 0, unpaid: 1, partially_paid: 2, paid: 3 };
      return sortDirection === 'asc' 
        ? statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder]
        : statusOrder[b.status as keyof typeof statusOrder] - statusOrder[a.status as keyof typeof statusOrder];
    }

    if (sortField === 'studentName') {
      return sortDirection === 'asc' 
        ? a.studentName.localeCompare(b.studentName)
        : b.studentName.localeCompare(a.studentName);
    }
    
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = sortedInvoices.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'overdue' ? 'desc' : 'asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const getStatusBadge = (status: string, isLatest: boolean) => {
    const baseClasses = "font-semibold px-3 py-1 text-sm border-2";
    
    switch (status) {
      case 'paid':
        return (
          <Badge className={`${baseClasses} bg-green-100 text-green-800 border-green-300`}>
            <CheckCircle className="h-4 w-4 mr-1" />
            Paid
          </Badge>
        );
      case 'partially_paid':
        return (
          <Badge className={`${baseClasses} bg-yellow-100 text-yellow-800 border-yellow-300`}>
            <Clock className="h-4 w-4 mr-1" />
            Partial
          </Badge>
        );
      case 'unpaid':
        return (
          <Badge className={`${baseClasses} ${isLatest ? 'bg-red-100 text-red-800 border-red-300' : 'bg-orange-100 text-orange-800 border-orange-300'}`}>
            <TrendingUp className="h-4 w-4 mr-1" />
            {isLatest ? 'Due' : 'Unpaid'}
          </Badge>
        );
      case 'overdue':
        return (
          <Badge className={`${baseClasses} bg-red-200 text-red-900 border-red-400 animate-pulse`}>
            <TrendingUp className="h-4 w-4 mr-1" />
            Overdue
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Calculate summary stats
  const totalInvoices = filteredInvoices.length;
  const paidInvoices = filteredInvoices.filter(inv => inv.status === 'paid').length;
  const totalDue = filteredInvoices.reduce((sum, inv) => sum + inv.balanceAmount, 0);
  const totalCumulativeDue = filteredInvoices
    .filter(inv => inv.isLatest && inv.cumulativeDue > 0)
    .reduce((sum, inv) => sum + inv.cumulativeDue, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8 space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Invoice Management
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg lg:text-xl max-w-3xl mx-auto px-4">
            Advanced invoice tracking with smart cumulative due calculations and payment analytics
          </p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm sm:text-base">Total Invoices</p>
                  <p className="text-2xl sm:text-3xl font-bold">{totalInvoices}</p>
                </div>
                <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm sm:text-base">Paid Invoices</p>
                  <p className="text-2xl sm:text-3xl font-bold">{paidInvoices}</p>
                </div>
                <CheckCircle className="h-8 w-8 sm:h-12 sm:w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm sm:text-base">Current Due</p>
                  <p className="text-lg sm:text-2xl font-bold">{formatCurrency(totalDue)}</p>
                </div>
                <Clock className="h-8 w-8 sm:h-12 sm:w-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm sm:text-base">Total Outstanding</p>
                  <p className="text-lg sm:text-2xl font-bold">{formatCurrency(totalCumulativeDue)}</p>
                </div>
                <TrendingUp className="h-8 w-8 sm:h-12 sm:w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full lg:w-auto">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <Search className="absolute left-3 sm:left-4 top-3 sm:top-4 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              <Input
                placeholder="Search by student, room, invoice ID..."
                className="pl-10 sm:pl-12 h-12 sm:h-14 border-2 border-gray-200 focus:border-blue-400 rounded-xl text-base sm:text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-56 h-12 sm:h-14 border-2 border-gray-200 focus:border-blue-400 rounded-xl text-base sm:text-lg">
                <Filter className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-background border-2 z-50">
                <SelectItem value="all">All Invoices</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="partially_paid">Partially Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg rounded-xl shadow-lg w-full sm:w-auto">
            <Link to="/invoices/new">
              <Plus className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
              New Invoice
            </Link>
          </Button>
        </div>

        {paginatedInvoices.length === 0 ? (
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <DollarSign className="h-20 w-20 text-gray-400 mb-6" />
              <p className="text-muted-foreground text-xl">No invoices match your search criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
              <CardTitle className="text-2xl font-bold">Invoice Registry</CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                Comprehensive invoice tracking with advanced due management and payment history
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50 hover:from-gray-50 hover:to-blue-50">
                    <TableHead className="font-bold text-gray-700 text-sm sm:text-base lg:text-lg whitespace-nowrap">Invoice #</TableHead>
                    <TableHead onClick={() => handleSort('studentName')} className="cursor-pointer font-bold text-gray-700 text-sm sm:text-base lg:text-lg whitespace-nowrap">
                      <div className="flex items-center hover:text-blue-600">
                        Student (Room)
                        <ArrowUpDown className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-gray-700 text-sm sm:text-base lg:text-lg whitespace-nowrap hidden md:table-cell">Month/Year</TableHead>
                    <TableHead onClick={() => handleSort('issueDate')} className="cursor-pointer font-bold text-gray-700 text-sm sm:text-base lg:text-lg whitespace-nowrap hidden lg:table-cell">
                      <div className="flex items-center hover:text-blue-600">
                        Issue Date
                        <ArrowUpDown className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('totalAmount')} className="cursor-pointer font-bold text-gray-700 text-sm sm:text-base lg:text-lg whitespace-nowrap">
                      <div className="flex items-center hover:text-blue-600">
                        Total
                        <ArrowUpDown className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-gray-700 text-sm sm:text-base lg:text-lg whitespace-nowrap hidden xl:table-cell">Partial Paid</TableHead>
                    <TableHead onClick={() => handleSort('cumulativeDue')} className="cursor-pointer font-bold text-gray-700 text-sm sm:text-base lg:text-lg whitespace-nowrap hidden sm:table-cell">
                      <div className="flex items-center hover:text-blue-600">
                        Due
                        <ArrowUpDown className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('status')} className="cursor-pointer font-bold text-gray-700 text-sm sm:text-base lg:text-lg whitespace-nowrap">
                      <div className="flex items-center hover:text-blue-600">
                        Status
                        <ArrowUpDown className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-bold text-gray-700 text-sm sm:text-base lg:text-lg whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInvoices.map((invoice) => (
                    <TableRow 
                      key={invoice.id} 
                      className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border-b ${
                        invoice.isLatest && invoice.cumulativeDue > 0 ? 'bg-red-50/50' : ''
                      }`}
                    >
                      <TableCell className="font-mono text-xs sm:text-sm font-bold text-gray-700 py-3 sm:py-4">
                        <div className="truncate max-w-20 sm:max-w-none">{invoice.id}</div>
                        {invoice.isLatest && <Badge className="ml-1 sm:ml-2 text-xs bg-blue-100 text-blue-800 hidden sm:inline-flex">LATEST</Badge>}
                      </TableCell>
                      <TableCell className="py-3 sm:py-4">
                        <Link to={`/students/${invoice.studentId}`} className="text-blue-600 hover:text-blue-800 font-bold hover:underline text-sm sm:text-base lg:text-lg block truncate max-w-32 sm:max-w-none">
                          {invoice.studentName}
                        </Link>
                        <p className="text-xs sm:text-sm text-gray-600 font-medium">Room {invoice.studentRoom}</p>
                      </TableCell>
                      <TableCell className="py-3 sm:py-4 hidden md:table-cell">
                        <div className="font-bold text-sm sm:text-base lg:text-lg text-gray-700">{invoice.monthYear}</div>
                        <div className="text-xs sm:text-sm text-blue-600 font-medium">
                          {formatNepaliMonthYear(invoice.issueDate)}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 font-medium text-xs sm:text-sm hidden lg:table-cell">{new Date(invoice.issueDate).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell className="font-bold text-sm sm:text-base lg:text-lg text-blue-600">{formatCurrency(invoice.totalAmount)}</TableCell>
                      <TableCell className="font-bold text-green-600 text-sm sm:text-base lg:text-lg hidden xl:table-cell">
                        {invoice.paidAmount > 0 ? formatCurrency(invoice.paidAmount) : '-'}
                      </TableCell>
                      <TableCell className={`font-bold text-sm sm:text-base lg:text-lg hidden sm:table-cell ${(invoice.totalDue || invoice.cumulativeDue) > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                        {(invoice.totalDue || invoice.cumulativeDue) > 0 ? formatCurrency(invoice.totalDue || invoice.cumulativeDue) : '-'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(invoice.status, invoice.isLatest)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline" className="hover:bg-blue-50 border-blue-200 font-medium h-8 sm:h-10 px-2 sm:px-4">
                          <Link to={`/invoices/${invoice.id}`}>
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
                            <span className="hidden sm:inline">View</span>
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

        {/* Pagination */}
        {sortedInvoices.length > itemsPerPage && (
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedInvoices.length)} of {sortedInvoices.length} invoices
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Invoices;
