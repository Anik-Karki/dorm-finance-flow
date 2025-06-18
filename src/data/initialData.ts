
import { Student, Invoice, Payment, LedgerEntry } from '@/types';

export const initialStudents: Student[] = [
  {
    id: '1',
    name: 'Rajesh Kumar Sharma',
    room: 'A-101',
    phone: '9841234567',
    guardianName: 'Ram Bahadur Sharma',
    guardianPhone: '9851234567',
    address: 'Baneshwor, Kathmandu',
    enrollmentDate: '2024-01-15',
    feeAmount: 8000,
    advanceBalance: 2000,
    status: 'active'
  },
  {
    id: '2',
    name: 'Sita Kumari Thapa',
    room: 'B-205',
    phone: '9812345678',
    guardianName: 'Krishna Bahadur Thapa',
    guardianPhone: '9862345678',
    address: 'Patan Dhoka, Lalitpur',
    enrollmentDate: '2024-02-10',
    feeAmount: 7500,
    advanceBalance: 0,
    status: 'active'
  },
  {
    id: '3',
    name: 'Arjun Bahadur Gurung',
    room: 'C-301',
    phone: '9823456789',
    guardianName: 'Bir Bahadur Gurung',
    guardianPhone: '9873456789',
    address: 'Pokhara Sub-Metropolitan City, Kaski',
    enrollmentDate: '2024-01-20',
    feeAmount: 8500,
    advanceBalance: 5000,
    status: 'active'
  },
  {
    id: '4',
    name: 'Anita Rai',
    room: 'A-105',
    phone: '9834567890',
    guardianName: 'Santosh Kumar Rai',
    guardianPhone: '9884567890',
    address: 'Bhaktapur Durbar Square, Bhaktapur',
    enrollmentDate: '2024-03-05',
    feeAmount: 7000,
    advanceBalance: 1500,
    status: 'active'
  },
  {
    id: '5',
    name: 'Deepak Tamang',
    room: 'B-202',
    phone: '9845678901',
    guardianName: 'Lal Bahadur Tamang',
    guardianPhone: '9895678901',
    address: 'Boudhanath, Kathmandu',
    enrollmentDate: '2024-02-15',
    feeAmount: 7800,
    advanceBalance: 0,
    status: 'inactive'
  },
  {
    id: '6',
    name: 'Sunita Karki',
    room: 'C-305',
    phone: '9856789012',
    guardianName: 'Mohan Prasad Karki',
    guardianPhone: '9906789012',
    address: 'Thamel, Kathmandu',
    enrollmentDate: '2024-01-30',
    feeAmount: 8200,
    advanceBalance: 3000,
    status: 'active'
  },
  {
    id: '7',
    name: 'Bikash Shrestha',
    room: 'A-103',
    phone: '9867890123',
    guardianName: 'Hari Krishna Shrestha',
    guardianPhone: '9917890123',
    address: 'Kirtipur Municipality, Kathmandu',
    enrollmentDate: '2024-02-20',
    feeAmount: 7600,
    advanceBalance: 800,
    status: 'active'
  },
  {
    id: '8',
    name: 'Priya Maharjan',
    room: 'B-207',
    phone: '9878901234',
    guardianName: 'Keshav Maharjan',
    guardianPhone: '9928901234',
    address: 'Lalitpur Sub-Metropolitan City, Lalitpur',
    enrollmentDate: '2024-03-10',
    feeAmount: 8300,
    advanceBalance: 0,
    status: 'active'
  }
];

export const initialInvoices: Invoice[] = [
  {
    id: 'inv-001',
    studentId: '1',
    studentName: 'Rajesh Kumar Sharma',
    monthYear: '03-2024',
    issueDate: '2024-03-01',
    dueDate: '2024-03-10',
    baseFee: 8000,
    extraExpenses: [
      {
        id: 'exp-001',
        description: 'Electricity Bill',
        amount: 500,
        date: '2024-03-01'
      }
    ],
    totalAmount: 8500,
    status: 'paid',
    paidAmount: 8500,
    balanceAmount: 0
  },
  {
    id: 'inv-002',
    studentId: '2',
    studentName: 'Sita Kumari Thapa',
    monthYear: '03-2024',
    issueDate: '2024-03-01',
    dueDate: '2024-03-10',
    baseFee: 7500,
    extraExpenses: [],
    totalAmount: 7500,
    status: 'unpaid',
    paidAmount: 0,
    balanceAmount: 7500
  },
  {
    id: 'inv-003',
    studentId: '3',
    studentName: 'Arjun Bahadur Gurung',
    monthYear: '03-2024',
    issueDate: '2024-03-01',
    dueDate: '2024-03-10',
    baseFee: 8500,
    extraExpenses: [
      {
        id: 'exp-002',
        description: 'Internet Charges',
        amount: 300,
        date: '2024-03-01'
      }
    ],
    totalAmount: 8800,
    status: 'partially_paid',
    paidAmount: 4000,
    balanceAmount: 4800
  }
];

export const initialPayments: Payment[] = [
  {
    id: 'pay-001',
    studentId: '1',
    studentName: 'Rajesh Kumar Sharma',
    amount: 8500,
    date: '2024-03-05',
    paymentMode: 'esewa_khalti',
    reference: 'ESW-2024030501',
    notes: 'March 2024 fee payment',
    type: 'regular'
  },
  {
    id: 'pay-002',
    studentId: '3',
    studentName: 'Arjun Bahadur Gurung',
    amount: 4000,
    date: '2024-03-03',
    paymentMode: 'bank_transfer',
    reference: 'TXN-2024030301',
    notes: 'Partial payment for March',
    type: 'regular'
  },
  {
    id: 'pay-003',
    studentId: '6',
    studentName: 'Sunita Karki',
    amount: 3000,
    date: '2024-02-28',
    paymentMode: 'cash',
    reference: '',
    notes: 'Advance payment',
    type: 'advance'
  }
];

export const initialLedger: LedgerEntry[] = [
  {
    id: 'led-001',
    date: '2024-03-01',
    studentId: '1',
    studentName: 'Rajesh Kumar Sharma',
    type: 'fee',
    description: 'Monthly Fee for 03-2024',
    amount: 8500,
    balance: 8500
  },
  {
    id: 'led-002',
    date: '2024-03-05',
    studentId: '1',
    studentName: 'Rajesh Kumar Sharma',
    type: 'payment',
    description: 'Payment - esewa_khalti (ESW-2024030501)',
    amount: -8500,
    balance: 0
  },
  {
    id: 'led-003',
    date: '2024-03-01',
    studentId: '2',
    studentName: 'Sita Kumari Thapa',
    type: 'fee',
    description: 'Monthly Fee for 03-2024',
    amount: 7500,
    balance: 7500
  },
  {
    id: 'led-004',
    date: '2024-03-01',
    studentId: '3',
    studentName: 'Arjun Bahadur Gurung',
    type: 'fee',
    description: 'Monthly Fee for 03-2024',
    amount: 8800,
    balance: 8800
  },
  {
    id: 'led-005',
    date: '2024-03-03',
    studentId: '3',
    studentName: 'Arjun Bahadur Gurung',
    type: 'payment',
    description: 'Payment - bank_transfer (TXN-2024030301)',
    amount: -4000,
    balance: 4800
  },
  {
    id: 'led-006',
    date: '2024-02-28',
    studentId: '6',
    studentName: 'Sunita Karki',
    type: 'payment',
    description: 'Advance Payment - cash',
    amount: -3000,
    balance: -3000
  }
];
