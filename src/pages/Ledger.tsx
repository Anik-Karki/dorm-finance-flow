
import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Search, Download } from "lucide-react";
import { formatCurrency } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const Ledger = () => {
  const { ledgerEntries, students } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStudent, setFilterStudent] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState({
    from: '',
    to: ''
  });

  // Apply filters
  const filteredEntries = ledgerEntries.filter(entry => {
    // Text search
    const matchesSearch = 
      entry.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Student filter
    const matchesStudent = filterStudent === 'all' || entry.studentId === filterStudent;
    
    // Type filter
    const matchesType = filterType === 'all' || entry.type === filterType;
    
    // Date range filter
    let matchesDateRange = true;
    if (filterDateRange.from) {
      matchesDateRange = matchesDateRange && new Date(entry.date) >= new Date(filterDateRange.from);
    }
    if (filterDateRange.to) {
      matchesDateRange = matchesDateRange && new Date(entry.date) <= new Date(filterDateRange.to);
    }
    
    return matchesSearch && matchesStudent && matchesType && matchesDateRange;
  });

  // Calculate totals
  const totalDebit = filteredEntries
    .filter(entry => entry.amount > 0)
    .reduce((sum, entry) => sum + entry.amount, 0);
    
  const totalCredit = filteredEntries
    .filter(entry => entry.amount < 0)
    .reduce((sum, entry) => sum + Math.abs(entry.amount), 0);
    
  const balance = totalDebit - totalCredit;
  
  // Sort entries by date (newest first)
  const sortedEntries = [...filteredEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleReset = () => {
    setSearchTerm('');
    setFilterStudent('all');
    setFilterType('all');
    setFilterDateRange({ from: '', to: '' });
  };
  
  const exportLedger = () => {
    alert('Export functionality will be implemented in a future update.');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Hostel Ledger</h1>
        <Button variant="outline" onClick={exportLedger}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ledger Filters</CardTitle>
          <CardDescription>Filter the ledger entries by various criteria.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search ledger..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={filterStudent} onValueChange={setFilterStudent}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by student" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="fee">Fee</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-1">
                <p className="text-sm">From Date</p>
                <div className="flex">
                  <Input
                    type="date"
                    value={filterDateRange.from}
                    onChange={(e) => setFilterDateRange({...filterDateRange, from: e.target.value})}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="flex-1 space-y-1">
                <p className="text-sm">To Date</p>
                <div className="flex">
                  <Input
                    type="date"
                    value={filterDateRange.to}
                    onChange={(e) => setFilterDateRange({...filterDateRange, to: e.target.value})}
                    className="w-full"
                  />
                </div>
              </div>
              
              <Button variant="outline" className="mt-auto" onClick={handleReset}>
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Debit (Dr.)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalDebit)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Credit (Cr.)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalCredit)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {balance >= 0 ? 'Dr. ' : 'Cr. '}
              {formatCurrency(Math.abs(balance))}
            </div>
          </CardContent>
        </Card>
      </div>

      {sortedEntries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground">No ledger entries match your search criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Ledger Entries</CardTitle>
            <CardDescription>
              {sortedEntries.length} entries found {filterStudent !== 'all' ? `for ${students.find(s => s.id === filterStudent)?.name}` : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Debit (Dr.)</TableHead>
                  <TableHead>Credit (Cr.)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{new Date(entry.date).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell>
                      <Link to={`/students/${entry.studentId}`} className="text-primary hover:underline">
                        {entry.studentName}
                      </Link>
                    </TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          entry.type === 'payment' ? 'default' : 
                          entry.type === 'fee' ? 'secondary' :
                          entry.type === 'expense' ? 'outline' : 'secondary'
                        }
                      >
                        {entry.type === 'payment' ? 'Payment' : 
                         entry.type === 'fee' ? 'Fee' :
                         entry.type === 'expense' ? 'Expense' : 'Adjustment'}
                      </Badge>
                    </TableCell>
                    <TableCell>{entry.amount > 0 ? formatCurrency(entry.amount) : '-'}</TableCell>
                    <TableCell>{entry.amount < 0 ? formatCurrency(Math.abs(entry.amount)) : '-'}</TableCell>
                  </TableRow>
                ))}
                
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={4} className="font-bold">Total</TableCell>
                  <TableCell className="font-bold">{formatCurrency(totalDebit)}</TableCell>
                  <TableCell className="font-bold">{formatCurrency(totalCredit)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Ledger;
