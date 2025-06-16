import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, Invoice, Payment, ExtraExpense, LedgerEntry } from '@/types';
import { initialStudents, initialInvoices, initialPayments, initialLedger } from '@/data/initialData';
import { toast } from 'sonner';

interface AppContextProps {
  // Students
  students: Student[];
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  getStudentById: (id: string) => Student | undefined;
  
  // Invoices
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  getInvoicesByStudentId: (studentId: string) => Invoice[];
  getInvoiceById: (id: string) => Invoice | undefined;
  
  // Payments
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (payment: Payment) => void;
  deletePayment: (id: string) => void;
  getPaymentsByStudentId: (studentId: string) => Payment[];
  
  // Ledger
  ledgerEntries: LedgerEntry[];
  addLedgerEntry: (entry: Omit<LedgerEntry, 'id'>) => void;
  getLedgerEntriesByStudentId: (studentId: string) => LedgerEntry[];
  
  // Extra expenses
  addExtraExpense: (studentId: string, invoiceId: string, expense: Omit<ExtraExpense, 'id'>) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(initialLedger);

  // Generate a unique ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // Student Functions
  const addStudent = (student: Omit<Student, 'id'>) => {
    const newStudent = { ...student, id: generateId() };
    setStudents(prev => [...prev, newStudent]);
    toast.success(`Student ${student.name} added successfully.`);
  };

  const updateStudent = (student: Student) => {
    setStudents(prev => prev.map(s => s.id === student.id ? student : s));
    toast.success(`Student ${student.name} updated successfully.`);
  };

  const deleteStudent = (id: string) => {
    const student = students.find(s => s.id === id);
    setStudents(prev => prev.filter(s => s.id !== id));
    toast.success(`Student ${student?.name || ''} deleted successfully.`);
  };

  const getStudentById = (id: string) => {
    return students.find(s => s.id === id);
  };

  // Enhanced Invoice Functions with Advance Payment Logic
  const addInvoice = (invoice: Omit<Invoice, 'id'>) => {
    const newInvoice = { ...invoice, id: generateId() };
    setInvoices(prev => [...prev, newInvoice]);
    
    // Add a ledger entry for the invoice
    addLedgerEntry({
      date: newInvoice.issueDate,
      studentId: newInvoice.studentId,
      studentName: newInvoice.studentName,
      type: 'fee',
      description: `Monthly Fee for ${newInvoice.monthYear}`,
      amount: newInvoice.totalAmount,
      balance: newInvoice.totalAmount
    });
    
    // If advance payment was used, add a payment ledger entry
    const advanceUsed = (newInvoice as any).advanceUsed || 0;
    if (advanceUsed > 0) {
      addLedgerEntry({
        date: newInvoice.issueDate,
        studentId: newInvoice.studentId,
        studentName: newInvoice.studentName,
        type: 'payment',
        description: `Advance Payment Applied for ${newInvoice.monthYear}`,
        amount: -advanceUsed,
        balance: -advanceUsed
      });
    }
    
    toast.success(`Invoice for ${invoice.studentName} created successfully.`);
  };

  const updateInvoice = (invoice: Invoice) => {
    setInvoices(prev => prev.map(inv => inv.id === invoice.id ? invoice : inv));
    toast.success(`Invoice for ${invoice.studentName} updated successfully.`);
  };

  const deleteInvoice = (id: string) => {
    const invoice = invoices.find(inv => inv.id === id);
    setInvoices(prev => prev.filter(inv => inv.id !== id));
    toast.success(`Invoice deleted successfully.`);
  };

  const getInvoicesByStudentId = (studentId: string) => {
    return invoices.filter(inv => inv.studentId === studentId);
  };

  const getInvoiceById = (id: string) => {
    return invoices.find(inv => inv.id === id);
  };

  // Extra Expenses Functions
  const addExtraExpense = (studentId: string, invoiceId: string, expense: Omit<ExtraExpense, 'id'>) => {
    const newExpense = { ...expense, id: generateId() };
    
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        const updatedExtraExpenses = [...inv.extraExpenses, newExpense];
        const newTotalAmount = inv.baseFee + updatedExtraExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        
        return {
          ...inv,
          extraExpenses: updatedExtraExpenses,
          totalAmount: newTotalAmount,
          balanceAmount: inv.status === 'paid' ? 0 : newTotalAmount - inv.paidAmount
        };
      }
      return inv;
    }));
    
    // Add a ledger entry for the extra expense
    const student = getStudentById(studentId);
    if (student) {
      addLedgerEntry({
        date: new Date().toISOString(),
        studentId,
        studentName: student.name,
        type: 'expense',
        description: expense.description,
        amount: expense.amount,
        balance: expense.amount
      });
    }
    
    toast.success('Extra expense added successfully.');
  };

  // Enhanced Payment Functions
  const addPayment = (payment: Omit<Payment, 'id'>) => {
    const newPayment = { ...payment, id: generateId() };
    setPayments(prev => [...prev, newPayment]);
    
    if (payment.type === 'regular') {
      // Update relevant invoices with improved logic
      let remainingPayment = payment.amount;
      
      setInvoices(prev => prev.map(inv => {
        if (inv.studentId === payment.studentId && inv.balanceAmount > 0 && remainingPayment > 0) {
          const paymentToApply = Math.min(remainingPayment, inv.balanceAmount);
          remainingPayment -= paymentToApply;
          
          const newPaidAmount = inv.paidAmount + paymentToApply;
          const newBalanceAmount = inv.totalAmount - newPaidAmount;
          const newStatus = newBalanceAmount <= 0 ? 'paid' : 
                            newPaidAmount > 0 ? 'partially_paid' : 'unpaid';
          
          return {
            ...inv,
            paidAmount: newPaidAmount,
            balanceAmount: newBalanceAmount,
            status: newStatus
          };
        }
        return inv;
      }));
    } else if (payment.type === 'advance') {
      // Update student's advance balance
      setStudents(prev => prev.map(s => {
        if (s.id === payment.studentId) {
          return {
            ...s,
            advanceBalance: s.advanceBalance + payment.amount
          };
        }
        return s;
      }));
    }
    
    // Add a ledger entry for the payment
    addLedgerEntry({
      date: payment.date,
      studentId: payment.studentId,
      studentName: payment.studentName,
      type: 'payment',
      description: `${payment.type === 'advance' ? 'Advance ' : ''}Payment - ${payment.paymentMode} ${payment.reference ? `(${payment.reference})` : ''}`,
      amount: -payment.amount,
      balance: -payment.amount
    });
    
    toast.success(`${payment.type === 'advance' ? 'Advance p' : 'P'}ayment of ${formatCurrency(payment.amount)} recorded for ${payment.studentName}.`);
  };

  const updatePayment = (payment: Payment) => {
    setPayments(prev => prev.map(p => p.id === payment.id ? payment : p));
    toast.success(`Payment updated successfully.`);
  };

  const deletePayment = (id: string) => {
    setPayments(prev => prev.filter(p => p.id !== id));
    toast.success(`Payment deleted successfully.`);
  };

  const getPaymentsByStudentId = (studentId: string) => {
    return payments.filter(p => p.studentId === studentId);
  };

  // Ledger Functions
  const addLedgerEntry = (entry: Omit<LedgerEntry, 'id'>) => {
    const newEntry = { ...entry, id: generateId() };
    setLedgerEntries(prev => [...prev, newEntry]);
  };

  const getLedgerEntriesByStudentId = (studentId: string) => {
    return ledgerEntries.filter(entry => entry.studentId === studentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const value = {
    // Students
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentById,
    
    // Invoices
    invoices,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoicesByStudentId,
    getInvoiceById,
    
    // Payments
    payments,
    addPayment,
    updatePayment,
    deletePayment,
    getPaymentsByStudentId,
    
    // Ledger
    ledgerEntries,
    addLedgerEntry,
    getLedgerEntriesByStudentId,
    
    // Extra expenses
    addExtraExpense,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
