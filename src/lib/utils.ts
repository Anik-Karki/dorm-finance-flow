
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-NP', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function calculateBalance(
  totalFees: number,
  extraCharges: number,
  paymentsMade: number
): number {
  return totalFees + extraCharges - paymentsMade;
}

// Nepali month names
const nepaliMonths = [
  'Baishakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

// Simple English to Nepali date conversion (approximate)
export function convertToNepaliDate(englishDate: string | Date): { month: string; year: number } {
  const date = new Date(englishDate);
  const englishMonth = date.getMonth();
  const englishYear = date.getFullYear();
  
  // Approximate conversion: Nepali year is about 56-57 years ahead
  // and month shifts by about 8-9 months
  let nepaliYear = englishYear + 56;
  let nepaliMonthIndex = (englishMonth + 8) % 12;
  
  // Adjust for year boundary
  if (englishMonth >= 4) { // May onwards
    nepaliYear = englishYear + 57;
    nepaliMonthIndex = (englishMonth - 4) % 12;
  }
  
  return {
    month: nepaliMonths[nepaliMonthIndex],
    year: nepaliYear
  };
}

export function formatNepaliMonthYear(englishDate: string | Date): string {
  const nepaliDate = convertToNepaliDate(englishDate);
  return `${nepaliDate.month} ${nepaliDate.year}`;
}
