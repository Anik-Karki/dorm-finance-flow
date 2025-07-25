import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, Invoice, Payment, ExtraExpense, LedgerEntry } from '@/types';
import { initialStudents, initialInvoices, initialPayments, initialLedger } from '@/data/initialData';
import { formatCurrency } from '@/lib/utils';
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

  // Calculate cumulative dues and overdue status for each student
  const updateCumulativeDues = () => {
    const currentDate = new Date();
    const threeMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1);
    const updatedInvoices = [...invoices];
    
    students.forEach(student => {
      const studentInvoices = updatedInvoices
        .filter(inv => inv.studentId === student.id)
        .sort((a, b) => new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime());
      
      let runningDue = 0;
      studentInvoices.forEach(invoice => {
        runningDue += invoice.balanceAmount;
        const index = updatedInvoices.findIndex(inv => inv.id === invoice.id);
        if (index !== -1) {
          // Check if invoice is overdue (unpaid for 3+ months)
          const invoiceDate = new Date(invoice.issueDate);
          const isOverdue = invoice.balanceAmount > 0 && invoiceDate <= threeMonthsAgo;
          
          updatedInvoices[index] = { 
            ...updatedInvoices[index], 
            cumulativeDue: runningDue,
            status: isOverdue ? 'overdue' : updatedInvoices[index].status
          };
        }
      });
    });

    setInvoices(updatedInvoices);
  };

  // Auto-generate monthly invoices with cumulative due tracking
  const generateMonthlyInvoices = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const monthYearString = `${currentMonth.toString().padStart(2, '0')}-${currentYear}`;

    students.forEach(student => {
      if (student.status === 'active') {
        // Check if invoice already exists for this month
        const existingInvoice = invoices.find(inv => 
          inv.studentId === student.id && inv.monthYear === monthYearString
        );

        if (!existingInvoice) {
          // Get previous unpaid balance for cumulative due calculation
          const previousInvoices = invoices
            .filter(inv => inv.studentId === student.id && inv.balanceAmount > 0)
            .sort((a, b) => new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime());
          
          const previousDue = previousInvoices.reduce((sum, inv) => sum + inv.balanceAmount, 0);

          // Create new invoice
          const newInvoice: Invoice = {
            id: generateId(),
            studentId: student.id,
            studentName: student.name,
            monthYear: monthYearString,
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            baseFee: student.feeAmount,
            extraExpenses: [],
            totalAmount: student.feeAmount,
            status: 'unpaid',
            paidAmount: 0,
            balanceAmount: student.feeAmount,
            cumulativeDue: previousDue + student.feeAmount
          };

          // Apply advance payment if available
          if (student.advanceBalance > 0) {
            const totalDue = newInvoice.totalAmount;
            const advanceToUse = Math.min(student.advanceBalance, totalDue);
            newInvoice.paidAmount = advanceToUse;
            newInvoice.balanceAmount = totalDue - advanceToUse;
            newInvoice.status = newInvoice.balanceAmount <= 0 ? 'paid' : 'partially_paid';
            newInvoice.advanceUsed = advanceToUse;
            newInvoice.cumulativeDue = (previousDue + totalDue) - advanceToUse;

            // Update student advance balance
            setStudents(prev => prev.map(s => 
              s.id === student.id 
                ? { ...s, advanceBalance: s.advanceBalance - advanceToUse }
                : s
            ));
          }

          setInvoices(prev => [...prev, newInvoice]);
          
          // Add ledger entries
          addLedgerEntry({
            date: newInvoice.issueDate,
            studentId: student.id,
            studentName: student.name,
            type: 'fee',
            description: `Monthly Fee for ${monthYearString}`,
            amount: student.feeAmount,
            balance: student.feeAmount
          });

          if (newInvoice.advanceUsed && newInvoice.advanceUsed > 0) {
            // Create payment record for advance usage
            const advancePayment: Payment = {
              id: generateId(),
              studentId: student.id,
              studentName: student.name,
              amount: newInvoice.advanceUsed,
              date: newInvoice.issueDate,
              paymentMode: 'cash', // Default mode for advance payments
              reference: `Advance Applied - Invoice ${newInvoice.id}`,
              notes: `Advance payment automatically applied to ${monthYearString} invoice`,
              type: 'regular',
              invoiceId: newInvoice.id
            };
            setPayments(prev => [...prev, advancePayment]);

            addLedgerEntry({
              date: newInvoice.issueDate,
              studentId: student.id,
              studentName: student.name,
              type: 'payment',
              description: `Advance Payment Applied for ${monthYearString}`,
              amount: -newInvoice.advanceUsed,
              balance: -newInvoice.advanceUsed
            });
          }
        }
      }
    });
  };

  // Run monthly invoice generation and cumulative due calculation on app start
  useEffect(() => {
    generateMonthlyInvoices();
    updateCumulativeDues();
  }, []);

  // Update cumulative dues when invoices change
  useEffect(() => {
    updateCumulativeDues();
  }, [invoices.length]);

  // Student Functions
  const addStudent = (student: Omit<Student, 'id'>) => {
    const newStudent = { ...student, id: generateId() };
    setStudents(prev => [...prev, newStudent]);
    toast.success(`Student ${student.name} added successfully with enhanced fee structure.`);
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

  // Enhanced Invoice Functions with smart cumulative due tracking
  const addInvoice = (invoice: Omit<Invoice, 'id'>) => {
    // Calculate cumulative due including ALL previous unpaid invoices for this student
    const previousInvoices = invoices
      .filter(inv => inv.studentId === invoice.studentId && inv.balanceAmount > 0)
      .sort((a, b) => new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime());
    
    const previousDue = previousInvoices.reduce((sum, inv) => sum + inv.balanceAmount, 0);
    
    const newInvoice = { 
      ...invoice, 
      id: generateId(),
      cumulativeDue: previousDue + invoice.balanceAmount,
      // Latest invoice always shows total outstanding including all previous dues
      totalDue: previousDue + invoice.balanceAmount
    };
    
    setInvoices(prev => [...prev, newInvoice]);
    
    // Add a ledger entry for the invoice
    addLedgerEntry({
      date: newInvoice.issueDate,
      studentId: newInvoice.studentId,
      studentName: newInvoice.studentName,
      type: 'fee',
      description: `Invoice for ${newInvoice.monthYear}`,
      amount: newInvoice.totalAmount,
      balance: newInvoice.totalAmount
    });
    
    // If advance payment was used, add a payment record and ledger entry
    const advanceUsed = (newInvoice as any).advanceUsed || 0;
    if (advanceUsed > 0) {
      // Create payment record for advance usage
      const advancePayment: Payment = {
        id: generateId(),
        studentId: newInvoice.studentId,
        studentName: newInvoice.studentName,
        amount: advanceUsed,
        date: newInvoice.issueDate,
        paymentMode: 'cash', // Default mode for advance payments
        reference: `Advance Applied - Invoice ${newInvoice.id}`,
        notes: `Advance payment automatically applied to ${newInvoice.monthYear} invoice`,
        type: 'regular',
        invoiceId: newInvoice.id
      };
      setPayments(prev => [...prev, advancePayment]);

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
    
    toast.success(`Invoice for ${invoice.studentName} created with smart payment processing.`);
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
    return invoices
      .filter(inv => inv.studentId === studentId)
      .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
  };

  const getInvoiceById = (id: string) => {
    return invoices.find(inv => inv.id === id);
  };

  // Enhanced Payment Functions with smart invoice targeting
  const addPayment = (payment: Omit<Payment, 'id'>) => {
    const newPayment = { ...payment, id: generateId() };
    setPayments(prev => [...prev, newPayment]);
    
    if (payment.type === 'regular') {
      // For regular payments, target invoices with highest cumulative due first
      let remainingPayment = payment.amount;
      
      if (payment.invoiceId) {
        // Target specific invoice
        setInvoices(prev => prev.map(inv => {
          if (inv.id === payment.invoiceId && remainingPayment > 0) {
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
      } else {
        // Distribute across unpaid invoices (prioritize latest with highest cumulative due)
        const unpaidInvoices = invoices
          .filter(inv => inv.studentId === payment.studentId && inv.balanceAmount > 0)
          .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());

        setInvoices(prev => prev.map(inv => {
          const isTargetInvoice = unpaidInvoices.find(ui => ui.id === inv.id);
          if (isTargetInvoice && remainingPayment > 0) {
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
      }
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
    
    toast.success(`${payment.type === 'advance' ? 'Advance p' : 'P'}ayment of ${formatCurrency(payment.amount)} processed successfully for ${payment.studentName}.`);
    
    // Recalculate cumulative dues after payment
    setTimeout(() => updateCumulativeDues(), 100);
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
    
    toast.success('Extra expense added with automatic recalculation.');
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
