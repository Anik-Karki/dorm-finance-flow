
import { Student, Invoice, Payment, LedgerEntry, ExtraExpense } from '@/types';

export const initialStudents: Student[] = [
  {
    id: '1',
    name: 'Rahul Singh',
    room: '101',
    phone: '9876543210',
    guardianName: 'Rajesh Singh',
    guardianPhone: '9876543211',
    address: '123 Main Street, Delhi',
    enrollmentDate: '2023-07-15',
    feeAmount: 6000,
    advanceBalance: 2000,
    status: 'active'
  },
  {
    id: '2',
    name: 'Priya Sharma',
    room: '102',
    phone: '9876543212',
    guardianName: 'Vikram Sharma',
    guardianPhone: '9876543213',
    address: '456 Park Avenue, Mumbai',
    enrollmentDate: '2023-08-05',
    feeAmount: 6500,
    advanceBalance: 500,
    status: 'active'
  },
  {
    id: '3',
    name: 'Ankit Patel',
    room: '201',
    phone: '9876543214',
    guardianName: 'Mahesh Patel',
    guardianPhone: '9876543215',
    address: '789 Lake Road, Ahmedabad',
    enrollmentDate: '2023-06-20',
    feeAmount: 5500,
    advanceBalance: 5500,
    status: 'active'
  },
  {
    id: '4',
    name: 'Neha Gupta',
    room: '202',
    phone: '9876543216',
    guardianName: 'Ramesh Gupta',
    guardianPhone: '9876543217',
    address: '234 Hill View, Pune',
    enrollmentDate: '2023-09-10',
    feeAmount: 6000,
    advanceBalance: 0,
    status: 'active'
  },
  {
    id: '5',
    name: 'Suresh Kumar',
    room: '301',
    phone: '9876543218',
    guardianName: 'Dinesh Kumar',
    guardianPhone: '9876543219',
    address: '567 College Road, Chennai',
    enrollmentDate: '2023-07-01',
    feeAmount: 5800,
    advanceBalance: 1000,
    status: 'active'
  }
];

const createExtraExpense = (id: string, description: string, amount: number, date: string): ExtraExpense => {
  return { id, description, amount, date };
};

export const initialInvoices: Invoice[] = [
  {
    id: 'inv1',
    studentId: '1',
    studentName: 'Rahul Singh',
    monthYear: '04-2024',
    issueDate: '2024-04-01',
    dueDate: '2024-04-10',
    baseFee: 6000,
    extraExpenses: [
      createExtraExpense('exp1', 'Extra Food', 500, '2024-04-05'),
      createExtraExpense('exp2', 'Laundry', 300, '2024-04-08')
    ],
    totalAmount: 6800,
    status: 'partially_paid',
    paidAmount: 4000,
    balanceAmount: 2800
  },
  {
    id: 'inv2',
    studentId: '2',
    studentName: 'Priya Sharma',
    monthYear: '04-2024',
    issueDate: '2024-04-01',
    dueDate: '2024-04-10',
    baseFee: 6500,
    extraExpenses: [
      createExtraExpense('exp3', 'Stationery', 150, '2024-04-06')
    ],
    totalAmount: 6650,
    status: 'overdue',
    paidAmount: 0,
    balanceAmount: 6650
  },
  {
    id: 'inv3',
    studentId: '3',
    studentName: 'Ankit Patel',
    monthYear: '04-2024',
    issueDate: '2024-04-01',
    dueDate: '2024-04-10',
    baseFee: 5500,
    extraExpenses: [],
    totalAmount: 5500,
    status: 'paid',
    paidAmount: 5500,
    balanceAmount: 0
  },
  {
    id: 'inv4',
    studentId: '4',
    studentName: 'Neha Gupta',
    monthYear: '04-2024',
    issueDate: '2024-04-01',
    dueDate: '2024-04-10',
    baseFee: 6000,
    extraExpenses: [
      createExtraExpense('exp4', 'Extra Food', 400, '2024-04-07'),
      createExtraExpense('exp5', 'Internet Usage', 200, '2024-04-09')
    ],
    totalAmount: 6600,
    status: 'unpaid',
    paidAmount: 0,
    balanceAmount: 6600
  },
  {
    id: 'inv5',
    studentId: '5',
    studentName: 'Suresh Kumar',
    monthYear: '04-2024',
    issueDate: '2024-04-01',
    dueDate: '2024-04-10',
    baseFee: 5800,
    extraExpenses: [],
    totalAmount: 5800,
    status: 'paid',
    paidAmount: 5800,
    balanceAmount: 0
  },
  {
    id: 'inv6',
    studentId: '1',
    studentName: 'Rahul Singh',
    monthYear: '03-2024',
    issueDate: '2024-03-01',
    dueDate: '2024-03-10',
    baseFee: 6000,
    extraExpenses: [
      createExtraExpense('exp6', 'Extra Food', 600, '2024-03-15')
    ],
    totalAmount: 6600,
    status: 'paid',
    paidAmount: 6600,
    balanceAmount: 0
  },
  {
    id: 'inv7',
    studentId: '2',
    studentName: 'Priya Sharma',
    monthYear: '03-2024',
    issueDate: '2024-03-01',
    dueDate: '2024-03-10',
    baseFee: 6500,
    extraExpenses: [],
    totalAmount: 6500,
    status: 'paid',
    paidAmount: 6500,
    balanceAmount: 0
  }
];

export const initialPayments: Payment[] = [
  {
    id: 'pay1',
    studentId: '1',
    studentName: 'Rahul Singh',
    amount: 4000,
    date: '2024-04-05',
    paymentMode: 'cash',
    reference: '',
    notes: 'Partial payment for April',
    type: 'regular'
  },
  {
    id: 'pay2',
    studentId: '3',
    studentName: 'Ankit Patel',
    amount: 5500,
    date: '2024-04-02',
    paymentMode: 'esewa_khalti',
    reference: 'ESEWA123456',
    notes: 'Full payment for April',
    type: 'regular'
  },
  {
    id: 'pay3',
    studentId: '5',
    studentName: 'Suresh Kumar',
    amount: 5800,
    date: '2024-04-03',
    paymentMode: 'bank_transfer',
    reference: 'NEFT789012',
    notes: 'Full payment for April',
    type: 'regular'
  },
  {
    id: 'pay4',
    studentId: '1',
    studentName: 'Rahul Singh',
    amount: 6600,
    date: '2024-03-05',
    paymentMode: 'cash',
    reference: '',
    notes: 'Full payment for March',
    type: 'regular'
  },
  {
    id: 'pay5',
    studentId: '2',
    studentName: 'Priya Sharma',
    amount: 6500,
    date: '2024-03-07',
    paymentMode: 'esewa_khalti',
    reference: 'ESEWA654321',
    notes: 'Full payment for March',
    type: 'regular'
  },
  {
    id: 'pay6',
    studentId: '1',
    studentName: 'Rahul Singh',
    amount: 2000,
    date: '2024-04-20',
    paymentMode: 'cash',
    reference: '',
    notes: 'Advance payment',
    type: 'advance'
  },
  {
    id: 'pay7',
    studentId: '3',
    studentName: 'Ankit Patel',
    amount: 5500,
    date: '2024-03-25',
    paymentMode: 'bank_transfer',
    reference: 'NEFT456789',
    notes: 'Advance payment',
    type: 'advance'
  }
];

export const initialLedger: LedgerEntry[] = [
  {
    id: 'led1',
    date: '2024-04-01',
    studentId: '1',
    studentName: 'Rahul Singh',
    type: 'fee',
    description: 'Monthly Fee for 04-2024',
    amount: 6000,
    balance: 6000
  },
  {
    id: 'led2',
    date: '2024-04-05',
    studentId: '1',
    studentName: 'Rahul Singh',
    type: 'expense',
    description: 'Extra Food',
    amount: 500,
    balance: 6500
  },
  {
    id: 'led3',
    date: '2024-04-05',
    studentId: '1',
    studentName: 'Rahul Singh',
    type: 'payment',
    description: 'Payment - cash',
    amount: -4000,
    balance: 2500
  },
  {
    id: 'led4',
    date: '2024-04-08',
    studentId: '1',
    studentName: 'Rahul Singh',
    type: 'expense',
    description: 'Laundry',
    amount: 300,
    balance: 2800
  },
  {
    id: 'led5',
    date: '2024-04-01',
    studentId: '2',
    studentName: 'Priya Sharma',
    type: 'fee',
    description: 'Monthly Fee for 04-2024',
    amount: 6500,
    balance: 6500
  },
  {
    id: 'led6',
    date: '2024-04-06',
    studentId: '2',
    studentName: 'Priya Sharma',
    type: 'expense',
    description: 'Stationery',
    amount: 150,
    balance: 6650
  },
  {
    id: 'led7',
    date: '2024-04-01',
    studentId: '3',
    studentName: 'Ankit Patel',
    type: 'fee',
    description: 'Monthly Fee for 04-2024',
    amount: 5500,
    balance: 5500
  },
  {
    id: 'led8',
    date: '2024-04-02',
    studentId: '3',
    studentName: 'Ankit Patel',
    type: 'payment',
    description: 'Payment - esewa_khalti (ESEWA123456)',
    amount: -5500,
    balance: 0
  },
  {
    id: 'led9',
    date: '2024-04-01',
    studentId: '5',
    studentName: 'Suresh Kumar',
    type: 'fee',
    description: 'Monthly Fee for 04-2024',
    amount: 5800,
    balance: 5800
  },
  {
    id: 'led10',
    date: '2024-04-03',
    studentId: '5',
    studentName: 'Suresh Kumar',
    type: 'payment',
    description: 'Payment - bank_transfer (NEFT789012)',
    amount: -5800,
    balance: 0
  },
  {
    id: 'led11',
    date: '2024-04-20',
    studentId: '1',
    studentName: 'Rahul Singh',
    type: 'payment',
    description: 'Payment - cash (Advance payment)',
    amount: -2000,
    balance: -2000
  }
];
