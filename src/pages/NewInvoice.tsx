import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { formatCurrency, cn } from '@/lib/utils';
import { Invoice, ExtraExpense } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

const monthsArray = [
  '01-2024', '02-2024', '03-2024', '04-2024', '05-2024',
  '06-2024', '07-2024', '08-2024', '09-2024', '10-2024',
  '11-2024', '12-2024', '01-2025', '02-2025', '03-2025'
];

const NewInvoice = () => {
  const { students, addInvoice } = useAppContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const preselectedStudentId = searchParams.get('studentId');
  
  const [invoiceData, setInvoiceData] = useState({
    studentId: preselectedStudentId || '',
    monthYear: '',
    billingDate: new Date(), // New field for billing month calendar
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    baseFee: 0,
    extraExpenses: [] as ExtraExpense[],
    totalAmount: 0,
    status: 'unpaid' as 'paid' | 'partially_paid' | 'unpaid' | 'overdue',
    paidAmount: 0,
    balanceAmount: 0
  });
  
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: 0,
    date: new Date()
  });
  
  const selectedStudent = students.find(student => student.id === invoiceData.studentId);
  
  // Update monthYear when billingDate changes
  useEffect(() => {
    if (invoiceData.billingDate) {
      const formattedMonth = format(invoiceData.billingDate, 'MM-yyyy');
      setInvoiceData(prev => ({
        ...prev,
        monthYear: formattedMonth
      }));
    }
  }, [invoiceData.billingDate]);
  
  useEffect(() => {
    if (selectedStudent) {
      setInvoiceData(prev => ({
        ...prev,
        baseFee: selectedStudent.feeAmount,
        totalAmount: selectedStudent.feeAmount,
        balanceAmount: selectedStudent.feeAmount
      }));
    }
  }, [invoiceData.studentId, selectedStudent]);

  const updateTotalAmount = () => {
    const extraExpensesTotal = invoiceData.extraExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const total = invoiceData.baseFee + extraExpensesTotal;
    
    setInvoiceData(prev => ({
      ...prev,
      totalAmount: total,
      balanceAmount: total
    }));
  };
  
  const addExtraExpense = () => {
    if (!newExpense.description.trim()) {
      toast.error('Please enter a description for the expense');
      return;
    }
    
    if (newExpense.amount <= 0) {
      toast.error('Please enter a valid amount for the expense');
      return;
    }
    
    const expense: ExtraExpense = {
      id: Date.now().toString(36),
      description: newExpense.description,
      amount: newExpense.amount,
      date: newExpense.date.toISOString().split('T')[0]
    };
    
    setInvoiceData(prev => ({
      ...prev,
      extraExpenses: [...prev.extraExpenses, expense]
    }));
    
    // Reset the new expense form
    setNewExpense({
      description: '',
      amount: 0,
      date: new Date()
    });
    
    // Update total amount
    setTimeout(updateTotalAmount, 0);
  };
  
  const removeExtraExpense = (id: string) => {
    setInvoiceData(prev => ({
      ...prev,
      extraExpenses: prev.extraExpenses.filter(exp => exp.id !== id)
    }));
    
    // Update total amount
    setTimeout(updateTotalAmount, 0);
  };
  
  const handleCreateInvoice = () => {
    // Validation
    if (!invoiceData.studentId) {
      toast.error('Please select a student');
      return;
    }
    
    if (!invoiceData.monthYear) {
      toast.error('Please select a billing month');
      return;
    }
    
    // Create the invoice
    addInvoice({
      ...invoiceData,
      issueDate: invoiceData.issueDate.toISOString().split('T')[0],
      dueDate: invoiceData.dueDate.toISOString().split('T')[0],
      studentName: selectedStudent?.name || '',
    });
    
    // Navigate back to invoices
    navigate('/invoices');
  };
  
  const activeStudents = students.filter(student => student.status === 'active');
  
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight">Create New Invoice</h1>
      
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
          <CardDescription>
            Create a new invoice for a student.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="student">Student</Label>
              <Select
                value={invoiceData.studentId}
                onValueChange={(value) => setInvoiceData({
                  ...invoiceData,
                  studentId: value
                })}
              >
                <SelectTrigger id="student">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Active Students</SelectLabel>
                    {activeStudents.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} (Room {student.room})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Billing Month</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !invoiceData.billingDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {invoiceData.billingDate ? format(invoiceData.billingDate, "MMMM yyyy") : <span>Pick billing month</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={invoiceData.billingDate}
                    onSelect={(date) => date && setInvoiceData({...invoiceData, billingDate: date})}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Issue Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !invoiceData.issueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {invoiceData.issueDate ? format(invoiceData.issueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={invoiceData.issueDate}
                    onSelect={(date) => date && setInvoiceData({...invoiceData, issueDate: date})}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !invoiceData.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {invoiceData.dueDate ? format(invoiceData.dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={invoiceData.dueDate}
                    onSelect={(date) => date && setInvoiceData({...invoiceData, dueDate: date})}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="baseFee">Monthly Fee</Label>
              <Input
                id="baseFee"
                type="number"
                value={invoiceData.baseFee || ''}
                onChange={(e) => {
                  const fee = Number(e.target.value);
                  setInvoiceData({
                    ...invoiceData,
                    baseFee: fee,
                    totalAmount: fee + invoiceData.extraExpenses.reduce((sum, exp) => sum + exp.amount, 0),
                    balanceAmount: fee + invoiceData.extraExpenses.reduce((sum, exp) => sum + exp.amount, 0)
                  });
                }}
                disabled={!invoiceData.studentId}
              />
            </div>
          </div>
          
          {selectedStudent && (
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-semibold mb-2">Student Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Room:</span> {selectedStudent.room}
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {selectedStudent.phone}
                </div>
                <div>
                  <span className="font-medium">Guardian:</span> {selectedStudent.guardianName}
                </div>
                <div>
                  <span className="font-medium">Advance Balance:</span> {formatCurrency(selectedStudent.advanceBalance)}
                </div>
                <div>
                  <span className="font-medium">Monthly Fee:</span> {formatCurrency(selectedStudent.feeAmount)}
                </div>
              </div>
            </div>
          )}
          
          {/* Extra Expenses Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Extra Expenses</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="expenseDescription">Description</Label>
                <Input
                  id="expenseDescription"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  placeholder="e.g., Extra Food, Laundry, etc."
                />
              </div>
              
              <div>
                <Label htmlFor="expenseAmount">Amount</Label>
                <Input
                  id="expenseAmount"
                  type="number"
                  value={newExpense.amount || ''}
                  onChange={(e) => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                  placeholder="Amount"
                />
              </div>
              
              <div className="flex items-end">
                <Button type="button" onClick={addExtraExpense} className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Add Expense
                </Button>
              </div>
            </div>
            
            {invoiceData.extraExpenses.length > 0 && (
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="p-2 text-left font-medium">Description</th>
                      <th className="p-2 text-right font-medium">Amount</th>
                      <th className="p-2 text-right font-medium w-20">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.extraExpenses.map((expense) => (
                      <tr key={expense.id} className="border-t">
                        <td className="p-2">{expense.description}</td>
                        <td className="p-2 text-right">{formatCurrency(expense.amount)}</td>
                        <td className="p-2 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeExtraExpense(expense.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="bg-muted/50 p-4 rounded-md">
            <h3 className="font-semibold mb-2">Invoice Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Base Fee:</span>
                <span>{formatCurrency(invoiceData.baseFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>Extra Expenses:</span>
                <span>
                  {formatCurrency(
                    invoiceData.extraExpenses.reduce((sum, exp) => sum + exp.amount, 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total Amount:</span>
                <span>{formatCurrency(invoiceData.totalAmount)}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate('/invoices')}>Cancel</Button>
          <Button onClick={handleCreateInvoice}>Create Invoice</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NewInvoice;
