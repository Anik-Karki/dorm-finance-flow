
import React, { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Download,
  Plus,
  Printer
} from "lucide-react";
import { formatCurrency, formatNepaliMonthYear } from '@/lib/utils';

const InvoiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getInvoiceById, addExtraExpense, getStudentById } = useAppContext();
  const invoice = getInvoiceById(id || '');
  
  if (!invoice) {
    return <Navigate to="/invoices" />;
  }
  
  const student = getStudentById(invoice.studentId);
  
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0]
  });
  
  const handleAddExpense = () => {
    if (newExpense.description.trim() === '' || newExpense.amount <= 0) {
      return;
    }
    
    addExtraExpense(invoice.studentId, invoice.id, newExpense);
    
    setNewExpense({
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0]
    });
  };

  const printInvoice = () => {
    window.print();
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to="/invoices">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Link>
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Invoice #{invoice.id}</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Month: {invoice.monthYear}</p>
          <p className="text-xs sm:text-sm text-blue-600 font-medium">Nepali Month: {formatNepaliMonthYear(invoice.issueDate)}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={printInvoice} className="w-full sm:w-auto">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          {invoice.status !== 'paid' && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Add Extra Expense</span>
                  <span className="sm:hidden">Add Expense</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Extra Expense</DialogTitle>
                  <DialogDescription>
                    Add an additional expense to this invoice.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                      placeholder="e.g., Extra Food, Laundry, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newExpense.amount || ''}
                      onChange={(e) => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                      placeholder="Enter amount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddExpense}>Add Expense</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        <div className="printable">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Invoice</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Invoice #{invoice.id} for {invoice.monthYear}
                </p>
                <p className="text-xs text-blue-600 font-medium">
                  Nepali Month: {formatNepaliMonthYear(invoice.issueDate)}
                </p>
              </div>
              <div className="text-right">
                <h3 className="font-bold text-xl">HostelFin</h3>
                <p className="text-sm">Modern Hostel Management</p>
                <p className="text-sm">contact@hostelfin.com</p>
                <p className="text-sm">+91 9876543210</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="font-medium mb-2">Billed To:</h3>
                  <p className="font-medium">{invoice.studentName}</p>
                  {student && (
                    <>
                      <p>Room: {student.room}</p>
                      <p className="break-all">{student.phone}</p>
                      <p className="text-sm">{student.address}</p>
                    </>
                  )}
                </div>
                <div className="lg:text-right">
                  <div className="space-y-2 lg:space-y-1">
                    <div className="flex justify-between lg:justify-end">
                      <span className="font-medium w-32">Status:</span>
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
                    </div>
                    <div className="flex justify-between lg:justify-end">
                      <span className="font-medium w-32 text-sm lg:text-base">Invoice Date:</span>
                      <span className="text-sm lg:text-base">{new Date(invoice.issueDate).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between lg:justify-end">
                      <span className="font-medium w-32 text-sm lg:text-base">Due Date:</span>
                      <span className="text-sm lg:text-base">{new Date(invoice.dueDate).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between lg:justify-end">
                      <span className="font-medium w-32 text-sm lg:text-base">Amount Due:</span>
                      <span className="text-sm lg:text-base">{formatCurrency(invoice.balanceAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60%]">Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      Monthly Hostel Fee for {invoice.monthYear}
                      <span className="text-sm text-blue-600 block">
                        ({formatNepaliMonthYear(invoice.issueDate)})
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(invoice.baseFee)}</TableCell>
                  </TableRow>
                  
                  {invoice.extraExpenses.map((expense, index) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        {expense.description}
                        <span className="text-sm text-muted-foreground block">
                          Added on {new Date(expense.date).toLocaleDateString('en-IN')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
              </div>

              <div className="mt-8 space-y-2">
                <div className="flex justify-end">
                  <span className="font-medium w-48">Subtotal:</span>
                  <span className="w-32 text-right">{formatCurrency(invoice.totalAmount)}</span>
                </div>
                <div className="flex justify-end">
                  <span className="font-medium w-48">Amount Paid:</span>
                  <span className="w-32 text-right">{formatCurrency(invoice.paidAmount)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-end font-bold text-lg">
                  <span className="w-48">Balance Due:</span>
                  <span className="w-32 text-right">{formatCurrency(invoice.balanceAmount)}</span>
                </div>
              </div>

              {invoice.balanceAmount > 0 && (
                <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-amber-800 text-sm">
                    Please make the payment by the due date. Late payments may incur additional charges.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col items-start pt-0 gap-2">
              <div className="text-sm text-muted-foreground">
                <p>Payment Methods: Cash, UPI, Bank Transfer</p>
                <p>UPI ID: hostelfin@okbank</p>
                <p>Bank Details: Bank of India, Acc No: 1234567890, IFSC: BOFI0001234</p>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                This is a computer-generated invoice and does not require a signature.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
