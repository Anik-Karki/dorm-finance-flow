
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';
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
import { formatCurrency } from '@/lib/utils';

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
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    baseFee: 0,
    extraExpenses: [],
    totalAmount: 0,
    status: 'unpaid',
    paidAmount: 0,
    balanceAmount: 0
  });
  
  const selectedStudent = students.find(student => student.id === invoiceData.studentId);
  
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
              <Label htmlFor="month">Billing Month</Label>
              <Select
                value={invoiceData.monthYear}
                onValueChange={(value) => setInvoiceData({
                  ...invoiceData,
                  monthYear: value
                })}
              >
                <SelectTrigger id="month">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Month & Year</SelectLabel>
                    {monthsArray.map(month => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input
                id="issueDate"
                type="date"
                value={invoiceData.issueDate}
                onChange={(e) => setInvoiceData({
                  ...invoiceData,
                  issueDate: e.target.value
                })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={invoiceData.dueDate}
                onChange={(e) => setInvoiceData({
                  ...invoiceData,
                  dueDate: e.target.value
                })}
              />
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
                    totalAmount: fee,
                    balanceAmount: fee
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
          
          <div className="bg-muted/50 p-4 rounded-md">
            <h3 className="font-semibold mb-2">Invoice Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Base Fee:</span>
                <span>{formatCurrency(invoiceData.baseFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>Extra Expenses:</span>
                <span>₹0.00</span>
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
