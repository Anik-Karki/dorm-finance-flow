
import React, { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, FileText, CreditCard, BookOpen, Edit, Plus, ArrowLeft } from "lucide-react";
import { formatCurrency } from '@/lib/utils';

const StudentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const {
    getStudentById,
    updateStudent,
    getInvoicesByStudentId,
    getPaymentsByStudentId,
    getLedgerEntriesByStudentId,
    addPayment
  } = useAppContext();

  const student = getStudentById(id || '');

  // If student doesn't exist, redirect back to students list
  if (!student) {
    return <Navigate to="/students" />;
  }

  const invoices = getInvoicesByStudentId(student.id);
  const payments = getPaymentsByStudentId(student.id);
  const ledgerEntries = getLedgerEntriesByStudentId(student.id);

  // State for edit student form
  const [editForm, setEditForm] = useState({
    ...student
  });

  // State for new payment form
  const [newPayment, setNewPayment] = useState({
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    paymentMode: 'cash' as 'cash' | 'esewa_khalti' | 'bank_transfer' | 'cheque',
    reference: '',
    notes: '',
    type: 'regular' as 'regular' | 'advance'
  });

  // Handle student update
  const handleUpdateStudent = () => {
    updateStudent(editForm);
  };

  // Handle new payment
  const handleAddPayment = () => {
    addPayment({
      studentId: student.id,
      studentName: student.name,
      ...newPayment
    });
    setNewPayment({
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      paymentMode: 'cash',
      reference: '',
      notes: '',
      type: 'regular'
    });
  };

  // Check if reference field should be shown
  const shouldShowReference = newPayment.paymentMode !== 'cash';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to="/students">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
            {student.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{student.name}</h1>
            <p className="text-muted-foreground">Room {student.room}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Details
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Student Details</DialogTitle>
                <DialogDescription>
                  Update information for {student.name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="room">Room Number</Label>
                    <Input
                      id="room"
                      value={editForm.room}
                      onChange={(e) => setEditForm({...editForm, room: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="enrollmentDate">Enrollment Date</Label>
                    <Input
                      id="enrollmentDate"
                      type="date"
                      value={editForm.enrollmentDate}
                      onChange={(e) => setEditForm({...editForm, enrollmentDate: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={editForm.address}
                    onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                    rows={2}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guardianName">Guardian's Name</Label>
                    <Input
                      id="guardianName"
                      value={editForm.guardianName}
                      onChange={(e) => setEditForm({...editForm, guardianName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guardianPhone">Guardian's Phone</Label>
                    <Input
                      id="guardianPhone"
                      value={editForm.guardianPhone}
                      onChange={(e) => setEditForm({...editForm, guardianPhone: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="feeAmount">Monthly Fee Amount</Label>
                    <Input
                      id="feeAmount"
                      type="number"
                      value={editForm.feeAmount}
                      onChange={(e) => setEditForm({...editForm, feeAmount: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={editForm.status}
                      onChange={(e) => setEditForm({
                        ...editForm, 
                        status: e.target.value as 'active' | 'inactive'
                      })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="submit" onClick={handleUpdateStudent}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Payment</DialogTitle>
                <DialogDescription>
                  Record a new payment for {student.name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
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
                      paymentMode: e.target.value as 'cash' | 'esewa_khalti' | 'bank_transfer' | 'cheque'
                    })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="cash">Cash</option>
                    <option value="esewa_khalti">eSewa/Khalti</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
                
                {shouldShowReference && (
                  <div className="space-y-2">
                    <Label htmlFor="reference">Reference/Transaction ID</Label>
                    <Input
                      id="reference"
                      value={newPayment.reference}
                      onChange={(e) => setNewPayment({...newPayment, reference: e.target.value})}
                      placeholder="Transaction ID"
                    />
                  </div>
                )}
                
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

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Student Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className="mt-1">
                {student.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Monthly Fee</h3>
              <p>{formatCurrency(student.feeAmount)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Advance Balance</h3>
              <p className={student.advanceBalance > 0 ? 'text-green-600 font-medium' : ''}>
                {formatCurrency(student.advanceBalance)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
              <p>{student.phone}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
              <p>{student.address}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Guardian Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Guardian Name</h3>
              <p>{student.guardianName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Guardian Phone</h3>
              <p>{student.guardianPhone}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Enrollment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Enrollment Date</h3>
              <p>{new Date(student.enrollmentDate).toLocaleDateString('en-IN', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
              })}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Room Number</h3>
              <p>{student.room}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices" className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="invoices" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="ledger" className="flex items-center">
            <BookOpen className="h-4 w-4 mr-2" />
            Ledger
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>All invoices for {student.name}</CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Month</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{invoice.monthYear}</TableCell>
                        <TableCell>{new Date(invoice.issueDate).toLocaleDateString('en-IN')}</TableCell>
                        <TableCell>{new Date(invoice.dueDate).toLocaleDateString('en-IN')}</TableCell>
                        <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              invoice.status === 'paid' ? 'default' : 
                              invoice.status === 'partially_paid' ? 'secondary' :
                              invoice.status === 'overdue' ? 'destructive' : 'outline'
                            }
                          >
                            {invoice.status === 'paid' ? 'Paid' : 
                             invoice.status === 'partially_paid' ? 'Partially Paid' :
                             invoice.status === 'overdue' ? 'Overdue' : 'Unpaid'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm" variant="outline">
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
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No invoices found for this student.</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline">
                <Link to={`/invoices/new?studentId=${student.id}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Invoice
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payments</CardTitle>
              <CardDescription>All payments made by {student.name}</CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.id}</TableCell>
                        <TableCell>{new Date(payment.date).toLocaleDateString('en-IN')}</TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>
                          <Badge variant={payment.type === 'regular' ? 'outline' : 'secondary'}>
                            {payment.type === 'regular' ? 'Regular' : 'Advance'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payment.paymentMode === 'cash' ? 'Cash' : 
                          payment.paymentMode === 'esewa_khalti' ? 'eSewa/Khalti' :
                          payment.paymentMode === 'bank_transfer' ? 'Bank Transfer' : 'Cheque'}
                        </TableCell>
                        <TableCell>{payment.reference || '-'}</TableCell>
                        <TableCell>{payment.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No payments recorded for this student.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ledger">
          <Card>
            <CardHeader>
              <CardTitle>Student Ledger</CardTitle>
              <CardDescription>Complete financial history for {student.name}</CardDescription>
            </CardHeader>
            <CardContent>
              {ledgerEntries.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Running Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledgerEntries.map((entry, index) => {
                      // Calculate running balance
                      let runningBalance = 0;
                      for (let i = ledgerEntries.length - 1; i >= index; i--) {
                        runningBalance += ledgerEntries[i].amount;
                      }

                      return (
                        <TableRow key={entry.id}>
                          <TableCell>{new Date(entry.date).toLocaleDateString('en-IN')}</TableCell>
                          <TableCell>{entry.description}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                entry.type === 'payment' ? 'default' : 
                                entry.type === 'fee' ? 'secondary' :
                                entry.type === 'expense' ? 'outline' : 'secondary'
                              }
                            >
                              {entry.type === 'payment' ? 'Payment' : 
                              entry.type === 'fee' ? 'Fee' :
                              entry.type === 'expense' ? 'Expense' : 'Adjustment'}
                            </Badge>
                          </TableCell>
                          <TableCell className={entry.amount < 0 ? 'text-green-600' : 'text-red-600'}>
                            {entry.amount < 0 ? '- ' : '+ '}
                            {formatCurrency(Math.abs(entry.amount))}
                          </TableCell>
                          <TableCell className={runningBalance <= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                            {runningBalance <= 0 ? 'Cr. ' : 'Dr. '}
                            {formatCurrency(Math.abs(runningBalance))}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No ledger entries found for this student.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDetail;
