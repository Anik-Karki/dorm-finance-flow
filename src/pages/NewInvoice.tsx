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
import { Plus, Trash2, Wallet, CreditCard, AlertCircle, DollarSign } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const monthsArray = [
  '01-2024', '02-2024', '03-2024', '04-2024', '05-2024',
  '06-2024', '07-2024', '08-2024', '09-2024', '10-2024',
  '11-2024', '12-2024', '01-2025', '02-2025', '03-2025'
];

const NewInvoice = () => {
  const { students, addInvoice, updateStudent } = useAppContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const preselectedStudentId = searchParams.get('studentId');
  
  const [invoiceData, setInvoiceData] = useState({
    studentId: preselectedStudentId || '',
    monthYear: '',
    billingDate: new Date(),
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    baseFee: 0,
    extraExpenses: [] as ExtraExpense[],
    totalAmount: 0,
    status: 'unpaid' as 'paid' | 'partially_paid' | 'unpaid' | 'overdue',
    paidAmount: 0,
    balanceAmount: 0,
    advanceUsed: 0
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
      const extraExpensesTotal = invoiceData.extraExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const total = selectedStudent.feeAmount + extraExpensesTotal;
      
      // Calculate advance payment usage
      const advanceToUse = Math.min(selectedStudent.advanceBalance, total);
      const remainingBalance = total - advanceToUse;
      
      setInvoiceData(prev => ({
        ...prev,
        baseFee: selectedStudent.feeAmount,
        totalAmount: total,
        advanceUsed: advanceToUse,
        paidAmount: advanceToUse,
        balanceAmount: remainingBalance,
        status: remainingBalance <= 0 ? 'paid' : advanceToUse > 0 ? 'partially_paid' : 'unpaid'
      }));
    }
  }, [invoiceData.studentId, selectedStudent, invoiceData.extraExpenses]);

  const updateTotalAmount = () => {
    if (!selectedStudent) return;
    
    const extraExpensesTotal = invoiceData.extraExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const total = invoiceData.baseFee + extraExpensesTotal;
    
    // Calculate advance payment usage
    const advanceToUse = Math.min(selectedStudent.advanceBalance, total);
    const remainingBalance = total - advanceToUse;
    
    setInvoiceData(prev => ({
      ...prev,
      totalAmount: total,
      advanceUsed: advanceToUse,
      paidAmount: advanceToUse,
      balanceAmount: remainingBalance,
      status: remainingBalance <= 0 ? 'paid' : advanceToUse > 0 ? 'partially_paid' : 'unpaid'
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
    
    // Update student's advance balance if advance was used
    if (invoiceData.advanceUsed > 0 && selectedStudent) {
      updateStudent({
        ...selectedStudent,
        advanceBalance: selectedStudent.advanceBalance - invoiceData.advanceUsed
      });
    }
    
    navigate('/invoices');
  };
  
  const activeStudents = students.filter(student => student.status === 'active');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Create New Invoice
          </h1>
          <p className="text-muted-foreground text-lg">
            Generate a professional invoice with automatic advance payment handling
          </p>
        </div>
        
        <Card className="max-w-5xl mx-auto shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-2">
              <DollarSign className="h-6 w-6" />
              Invoice Details
            </CardTitle>
            <CardDescription className="text-blue-100">
              Create a new invoice with smart advance payment calculation
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="student" className="text-lg font-semibold text-gray-700">Student</Label>
                <Select
                  value={invoiceData.studentId}
                  onValueChange={(value) => setInvoiceData({
                    ...invoiceData,
                    studentId: value
                  })}
                >
                  <SelectTrigger id="student" className="h-12 text-lg border-2 border-gray-200 hover:border-blue-400 transition-colors">
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Active Students</SelectLabel>
                      {activeStudents.map(student => (
                        <SelectItem key={student.id} value={student.id} className="text-lg py-3">
                          <div className="flex justify-between items-center w-full">
                            <span>{student.name} (Room {student.room})</span>
                            {student.advanceBalance > 0 && (
                              <Badge variant="secondary" className="ml-2">
                                Advance: {formatCurrency(student.advanceBalance)}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label className="text-lg font-semibold text-gray-700">Billing Month</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full h-12 justify-start text-left font-normal text-lg border-2 border-gray-200 hover:border-blue-400 transition-colors",
                        !invoiceData.billingDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-5 w-5" />
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
            
            {/* Date Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label className="text-lg font-semibold text-gray-700">Issue Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full h-12 justify-start text-left font-normal border-2 border-gray-200 hover:border-blue-400 transition-colors",
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
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-3">
                <Label className="text-lg font-semibold text-gray-700">Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full h-12 justify-start text-left font-normal border-2 border-gray-200 hover:border-blue-400 transition-colors",
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
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="baseFee" className="text-lg font-semibold text-gray-700">Monthly Fee</Label>
                <Input
                  id="baseFee"
                  type="number"
                  value={invoiceData.baseFee || ''}
                  onChange={(e) => {
                    const fee = Number(e.target.value);
                    setInvoiceData({
                      ...invoiceData,
                      baseFee: fee
                    });
                    setTimeout(updateTotalAmount, 0);
                  }}
                  disabled={!invoiceData.studentId}
                  className="h-12 text-lg border-2 border-gray-200 hover:border-blue-400 transition-colors"
                />
              </div>
            </div>
            
            {selectedStudent && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <h3 className="font-bold text-xl mb-4 text-blue-800 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Student Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="space-y-2">
                    <span className="font-semibold text-gray-600">Room:</span>
                    <p className="text-lg font-bold text-gray-800">{selectedStudent.room}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="font-semibold text-gray-600">Phone:</span>
                    <p className="text-lg text-gray-800">{selectedStudent.phone}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="font-semibold text-gray-600">Guardian:</span>
                    <p className="text-lg text-gray-800">{selectedStudent.guardianName}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="font-semibold text-gray-600">Advance Balance:</span>
                    <p className={`text-lg font-bold ${selectedStudent.advanceBalance > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      {formatCurrency(selectedStudent.advanceBalance)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <span className="font-semibold text-gray-600">Monthly Fee:</span>
                    <p className="text-lg font-bold text-blue-600">{formatCurrency(selectedStudent.feeAmount)}</p>
                  </div>
                </div>
                
                {selectedStudent.advanceBalance > 0 && (
                  <Alert className="mt-4 border-green-200 bg-green-50">
                    <Wallet className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Advance Payment Available:</strong> {formatCurrency(selectedStudent.advanceBalance)} will be automatically applied to this invoice.
                    </AlertDescription>
                  </Alert>
                )}
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
            
            {/* Enhanced Invoice Summary */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-6 rounded-xl border-2 border-gray-200">
              <h3 className="font-bold text-xl mb-4 text-gray-800 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Invoice Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-lg">Base Fee:</span>
                  <span className="text-lg font-semibold">{formatCurrency(invoiceData.baseFee)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-lg">Extra Expenses:</span>
                  <span className="text-lg font-semibold">
                    {formatCurrency(
                      invoiceData.extraExpenses.reduce((sum, exp) => sum + exp.amount, 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-xl font-bold">Total Amount:</span>
                  <span className="text-xl font-bold text-blue-600">{formatCurrency(invoiceData.totalAmount)}</span>
                </div>
                
                {invoiceData.advanceUsed > 0 && (
                  <>
                    <div className="flex justify-between items-center py-2 border-b bg-green-50 px-4 rounded">
                      <span className="text-lg text-green-700 flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Advance Payment Applied:
                      </span>
                      <span className="text-lg font-semibold text-green-700">-{formatCurrency(invoiceData.advanceUsed)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xl font-bold">Remaining Balance:</span>
                      <span className={`text-xl font-bold ${invoiceData.balanceAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(invoiceData.balanceAmount)}
                      </span>
                    </div>
                    <div className="text-center">
                      <Badge variant={invoiceData.status === 'paid' ? 'default' : invoiceData.status === 'partially_paid' ? 'secondary' : 'destructive'} className="text-sm px-4 py-2">
                        {invoiceData.status === 'paid' ? 'Fully Paid' : 
                         invoiceData.status === 'partially_paid' ? 'Partially Paid' : 'Unpaid'}
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-4 p-8 bg-gray-50">
            <Button variant="outline" onClick={() => navigate('/invoices')} className="px-8 py-3 text-lg">
              Cancel
            </Button>
            <Button onClick={handleCreateInvoice} className="px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              Create Invoice
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default NewInvoice;
