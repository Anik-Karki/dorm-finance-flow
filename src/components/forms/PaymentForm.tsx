
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, User, Calendar, DollarSign, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PaymentFormProps {
  onSubmit: (paymentData: any) => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit, onCancel }) => {
  const { students, invoices, getInvoicesByStudentId } = useAppContext();
  const [paymentData, setPaymentData] = useState({
    studentId: '',
    invoiceId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    paymentMode: 'cash' as 'cash' | 'esewa_khalti' | 'bank_transfer' | 'cheque',
    reference: '',
    notes: '',
    type: 'regular' as 'regular' | 'advance',
  });

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentInvoices, setStudentInvoices] = useState<any[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  useEffect(() => {
    if (paymentData.studentId) {
      const student = students.find(s => s.id === paymentData.studentId);
      setSelectedStudent(student);
      
      if (student) {
        const invoices = getInvoicesByStudentId(student.id);
        const sortedInvoices = invoices.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
        setStudentInvoices(sortedInvoices);
      }
    } else {
      setSelectedStudent(null);
      setStudentInvoices([]);
      setSelectedInvoice(null);
    }
  }, [paymentData.studentId, students, getInvoicesByStudentId]);

  useEffect(() => {
    if (paymentData.invoiceId) {
      const invoice = studentInvoices.find(inv => inv.id === paymentData.invoiceId);
      setSelectedInvoice(invoice);
      if (invoice && paymentData.type === 'regular') {
        setPaymentData(prev => ({
          ...prev,
          amount: invoice.balanceAmount
        }));
      }
    } else {
      setSelectedInvoice(null);
    }
  }, [paymentData.invoiceId, studentInvoices, paymentData.type]);

  const handleSubmit = () => {
    if (!paymentData.studentId || paymentData.amount <= 0) {
      return;
    }
    
    const student = students.find(s => s.id === paymentData.studentId);
    if (!student) return;
    
    onSubmit({
      ...paymentData,
      studentName: student.name,
    });
  };

  const shouldShowReference = paymentData.paymentMode !== 'cash';
  const activeStudents = students.filter(s => s.status === 'active');
  const unpaidInvoices = studentInvoices.filter(inv => inv.balanceAmount > 0);
  const totalDueAmount = unpaidInvoices.reduce((sum, inv) => sum + inv.balanceAmount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Student Selection */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <User className="h-5 w-5" />
            Student Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student" className="text-sm font-semibold">Select Student</Label>
            <Select
              value={paymentData.studentId}
              onValueChange={(value) => setPaymentData(prev => ({
                ...prev,
                studentId: value,
                invoiceId: '',
                amount: 0
              }))}
            >
              <SelectTrigger className="border-2 border-gray-200 focus:border-blue-400">
                <SelectValue placeholder="Choose a student" />
              </SelectTrigger>
              <SelectContent>
                {activeStudents.map(student => (
                  <SelectItem key={student.id} value={student.id}>
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
              </SelectContent>
            </Select>
          </div>

          {selectedStudent && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-600">Monthly Fee:</span>
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(selectedStudent.feeAmount)}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Advance Balance:</span>
                  <p className={`text-lg font-bold ${selectedStudent.advanceBalance > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                    {formatCurrency(selectedStudent.advanceBalance)}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Total Outstanding:</span>
                  <p className={`text-lg font-bold ${totalDueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(totalDueAmount)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Type Selection */}
      <Card className="border-2 border-green-200">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CreditCard className="h-5 w-5" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentType" className="text-sm font-semibold">Payment Type</Label>
              <Select
                value={paymentData.type}
                onValueChange={(value: 'regular' | 'advance') => setPaymentData(prev => ({
                  ...prev,
                  type: value,
                  invoiceId: '',
                  amount: 0
                }))}
              >
                <SelectTrigger className="border-2 border-gray-200 focus:border-green-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular Payment</SelectItem>
                  <SelectItem value="advance">Advance Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMode" className="text-sm font-semibold">Payment Mode</Label>
              <Select
                value={paymentData.paymentMode}
                onValueChange={(value: 'cash' | 'esewa_khalti' | 'bank_transfer' | 'cheque') => setPaymentData(prev => ({
                  ...prev,
                  paymentMode: value
                }))}
              >
                <SelectTrigger className="border-2 border-gray-200 focus:border-green-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="esewa_khalti">eSewa/Khalti</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Invoice Selection for Regular Payments */}
          {paymentData.type === 'regular' && selectedStudent && unpaidInvoices.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="invoice" className="text-sm font-semibold">Select Invoice</Label>
              <Select
                value={paymentData.invoiceId}
                onValueChange={(value) => setPaymentData(prev => ({
                  ...prev,
                  invoiceId: value
                }))}
              >
                <SelectTrigger className="border-2 border-gray-200 focus:border-green-400">
                  <SelectValue placeholder="Choose an invoice" />
                </SelectTrigger>
                <SelectContent>
                  {unpaidInvoices.map(invoice => (
                    <SelectItem key={invoice.id} value={invoice.id}>
                      <div className="flex justify-between items-center w-full">
                        <span>{invoice.monthYear} - {formatCurrency(invoice.totalAmount)}</span>
                        <Badge variant={
                          invoice.status === 'paid' ? 'default' : 
                          invoice.status === 'partially_paid' ? 'secondary' : 'destructive'
                        }>
                          Due: {formatCurrency(invoice.balanceAmount)}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Payment Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-semibold">Payment Amount</Label>
              <Input
                id="amount"
                type="number"
                value={paymentData.amount || ''}
                onChange={(e) => setPaymentData(prev => ({
                  ...prev,
                  amount: Number(e.target.value)
                }))}
                className="border-2 border-gray-200 focus:border-green-400"
                placeholder="Enter amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-semibold">Payment Date</Label>
              <Input
                id="date"
                type="date"
                value={paymentData.date}
                onChange={(e) => setPaymentData(prev => ({
                  ...prev,
                  date: e.target.value
                }))}
                className="border-2 border-gray-200 focus:border-green-400"
              />
            </div>
          </div>

          {shouldShowReference && (
            <div className="space-y-2">
              <Label htmlFor="reference" className="text-sm font-semibold">Reference/Transaction ID</Label>
              <Input
                id="reference"
                value={paymentData.reference}
                onChange={(e) => setPaymentData(prev => ({
                  ...prev,
                  reference: e.target.value
                }))}
                placeholder="Transaction ID"
                className="border-2 border-gray-200 focus:border-green-400"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-semibold">Notes</Label>
            <Textarea
              id="notes"
              value={paymentData.notes}
              onChange={(e) => setPaymentData(prev => ({
                ...prev,
                notes: e.target.value
              }))}
              placeholder="Any additional notes"
              rows={2}
              className="border-2 border-gray-200 focus:border-green-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Selected Invoice Details */}
      {selectedInvoice && (
        <Card className="border-2 border-orange-200">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <FileText className="h-5 w-5" />
              Invoice Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <span className="text-sm font-semibold text-gray-600">Month/Year:</span>
                <p className="text-lg font-bold text-orange-700">{selectedInvoice.monthYear}</p>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-600">Total Amount:</span>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(selectedInvoice.totalAmount)}</p>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-600">Paid Amount:</span>
                <p className="text-lg font-bold text-green-600">{formatCurrency(selectedInvoice.paidAmount)}</p>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-600">Due Amount:</span>
                <p className="text-lg font-bold text-red-600">{formatCurrency(selectedInvoice.balanceAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onCancel} className="px-6 py-2">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          disabled={!paymentData.studentId || paymentData.amount <= 0}
        >
          Record Payment
        </Button>
      </div>
    </div>
  );
};

export default PaymentForm;
