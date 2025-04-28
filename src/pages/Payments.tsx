
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
  CreditCard
} from "lucide-react";
import { formatCurrency } from '@/lib/utils';

const Payments = () => {
  const { payments, students, addPayment } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string | null>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const [newPayment, setNewPayment] = useState({
    studentId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    paymentMode: 'cash' as 'cash' | 'upi' | 'bank_transfer' | 'cheque',
    reference: '',
    notes: '',
    type: 'regular' as 'regular' | 'advance',
  });

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
  
  const handleAddPayment = () => {
    if (!newPayment.studentId || newPayment.amount <= 0) {
      return;
    }
    
    const student = students.find(s => s.id === newPayment.studentId);
    if (!student) return;
    
    addPayment({
      ...newPayment,
      studentName: student.name,
    });
    
    setNewPayment({
      studentId: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      paymentMode: 'cash',
      reference: '',
      notes: '',
      type: 'regular',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search payments..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Record New Payment</DialogTitle>
                <DialogDescription>
                  Add a new payment record.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="student">Student</Label>
                  <select
                    id="student"
                    value={newPayment.studentId}
                    onChange={(e) => setNewPayment({...newPayment, studentId: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select a student</option>
                    {students.filter(s => s.status === 'active').map(student => (
                      <option key={student.id} value={student.id}>
                        {student.name} (Room {student.room})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Payment Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newPayment.amount || ''}
                    onChange={(e) => setNewPayment({...newPayment, amount: Number(e.target.value)})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentType">Payment Type</Label>
                  <select
                    id="paymentType"
                    value={newPayment.type}
                    onChange={(e) => setNewPayment({
                      ...newPayment,
                      type: e.target.value as 'regular' | 'advance'
                    })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="regular">Regular Payment</option>
                    <option value="advance">Advance Payment</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentMode">Payment Mode</Label>
                  <select
                    id="paymentMode"
                    value={newPayment.paymentMode}
                    onChange={(e) => setNewPayment({
                      ...newPayment,
                      paymentMode: e.target.value as 'cash' | 'upi' | 'bank_transfer' | 'cheque'
                    })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference/Transaction ID</Label>
                  <Input
                    id="reference"
                    value={newPayment.reference}
                    onChange={(e) => setNewPayment({...newPayment, reference: e.target.value})}
                    placeholder="Optional for Cash"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date">Payment Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newPayment.date}
                    onChange={(e) => setNewPayment({...newPayment, date: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newPayment.notes}
                    onChange={(e) => setNewPayment({...newPayment, notes: e.target.value})}
                    placeholder="Any additional notes"
                    rows={2}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button onClick={handleAddPayment}>Record Payment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {filteredPayments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground">No payments match your search criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Payment Records</CardTitle>
            <CardDescription>View and manage all payment records.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead onClick={() => handleSort('date')} className="cursor-pointer">
                    <div className="flex items-center">
                      Date
                      <ArrowDownUp className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort('amount')} className="cursor-pointer">
                    <div className="flex items-center">
                      Amount
                      <ArrowDownUp className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.id}</TableCell>
                    <TableCell>
                      <Link to={`/students/${payment.studentId}`} className="text-primary hover:underline">
                        {payment.studentName}
                      </Link>
                    </TableCell>
                    <TableCell>{new Date(payment.date).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={payment.type === 'regular' ? 'outline' : 'secondary'}>
                        {payment.type === 'regular' ? 'Regular' : 'Advance'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-muted text-muted-foreground hover:bg-muted">
                        {payment.paymentMode === 'cash' ? 'Cash' : 
                        payment.paymentMode === 'upi' ? 'UPI' :
                        payment.paymentMode === 'bank_transfer' ? 'Bank Transfer' : 'Cheque'}
                      </Badge>
                    </TableCell>
                    <TableCell>{payment.reference || '-'}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{payment.notes || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Payments;
