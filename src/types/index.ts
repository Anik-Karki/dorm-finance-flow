// Student Types
export interface ExtraService {
  id: string;
  name: string;
  amount: number;
}

export interface Student {
  id: string;
  name: string;
  room: string;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  address: string;
  enrollmentDate: string;
  feeAmount: number;
  advanceBalance: number;
  status: 'active' | 'inactive';
  extraServices?: ExtraService[];
}

// Invoice and Billing Types
export interface ExtraExpense {
  id: string;
  description: string;
  amount: number;
  date: string;
}

export interface Invoice {
  id: string;
  studentId: string;
  studentName: string;
  monthYear: string; // Format: "MM-YYYY"
  issueDate: string;
  dueDate: string;
  baseFee: number;
  extraExpenses: ExtraExpense[];
  totalAmount: number;
  status: 'paid' | 'partially_paid' | 'unpaid' | 'overdue';
  paidAmount: number;
  balanceAmount: number;
  advanceUsed?: number; // New field for tracking advance payment usage
}

// Payment Types
export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  date: string;
  paymentMode: 'cash' | 'esewa_khalti' | 'bank_transfer' | 'cheque';
  reference: string;
  notes: string;
  type: 'regular' | 'advance';
}

// Ledger Entry Types
export interface LedgerEntry {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  type: 'fee' | 'expense' | 'payment' | 'adjustment';
  description: string;
  amount: number; // Positive for debit, negative for credit
  balance: number;
}

// Dashboard Stats
export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalIncomeThisMonth: number;
  pendingDues: number;
  totalAdvanceBalance: number;
  recentTransactions: LedgerEntry[];
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'accountant';
  lastLogin?: string;
}
