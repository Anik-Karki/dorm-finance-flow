import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Link } from 'react-router-dom';
import PaymentForm from '@/components/forms/PaymentForm';
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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowDownUp,
  Search,
  Plus,
  CreditCard,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { formatCurrency } from '@/lib/utils';

const Payments = () => {
  const { payments, students, addPayment } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string | null>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter payments based on search term
  const filteredPayments = payments.filter(payment => 
    payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.id.includes(searchTerm) ||
    payment.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort payments
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    if (!sortField) return 0;
    
    if (sortField === 'date') {
      return sortDirection === 'asc' 
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    
    if (sortField === 'amount') {
      return sortDirection === 'asc' 
        ? a.amount - b.amount
        : b.amount - a.amount;
    }

    if (sortField === 'studentName') {
      return sortDirection === 'asc' 
        ? a.studentName.localeCompare(b.studentName)
        : b.studentName.localeCompare(a.studentName);
    }
    
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayments = sortedPayments.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };
  
  const handleAddPayment = (paymentData: any) => {
    addPayment(paymentData);
    setShowAddDialog(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Payment Management
          </h1>
          <p className="text-muted-foreground text-lg">
            Record and track all student payments with invoice integration
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search payments..."
              className="pl-8 w-full border-2 border-gray-200 focus:border-blue-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Plus className="mr-2 h-4 w-4" />
                New Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-blue-800">Record New Payment</DialogTitle>
                <DialogDescription className="text-blue-600">
                  Process a new payment with automatic invoice management.
                </DialogDescription>
              </DialogHeader>
              <PaymentForm
                onSubmit={handleAddPayment}
                onCancel={() => setShowAddDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {paginatedPayments.length === 0 ? (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-muted-foreground text-lg">No payments match your search criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="text-xl">Payment Records</CardTitle>
              <CardDescription className="text-blue-100">
                Complete payment history with invoice tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Receipt ID</TableHead>
                    <TableHead onClick={() => handleSort('studentName')} className="cursor-pointer font-semibold">
                      <div className="flex items-center">
                        Student
                        <ArrowDownUp className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('date')} className="cursor-pointer font-semibold">
                      <div className="flex items-center">
                        Date
                        <ArrowDownUp className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('amount')} className="cursor-pointer font-semibold">
                      <div className="flex items-center">
                        Amount
                        <ArrowDownUp className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Mode</TableHead>
                    <TableHead className="font-semibold">Reference</TableHead>
                    <TableHead className="font-semibold">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPayments.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-blue-50/50 transition-colors">
                      <TableCell className="font-medium text-blue-600">{payment.id}</TableCell>
                      <TableCell>
                        <Link to={`/students/${payment.studentId}`} className="text-primary hover:underline font-medium">
                          {payment.studentName}
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium">{new Date(payment.date).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell className="font-bold text-green-600">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={payment.type === 'regular' ? 'outline' : 'secondary'} className="font-medium">
                          {payment.type === 'regular' ? 'Regular' : 'Advance'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-muted text-muted-foreground hover:bg-muted font-medium">
                          {payment.paymentMode === 'cash' ? 'Cash' : 
                          payment.paymentMode === 'esewa_khalti' ? 'eSewa/Khalti' :
                          payment.paymentMode === 'bank_transfer' ? 'Bank Transfer' : 'Cheque'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{payment.reference || '-'}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{payment.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {sortedPayments.length > itemsPerPage && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedPayments.length)} of {sortedPayments.length} payments
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

export default Payments;
