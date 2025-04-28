
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  FileText,
  ArrowUpDown
} from "lucide-react";
import { formatCurrency } from '@/lib/utils';

const Invoices = () => {
  const { invoices } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(invoice => 
    invoice.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.id.includes(searchTerm) ||
    invoice.monthYear.includes(searchTerm)
  );
  
  // Sort invoices
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (!sortField) return 0;
    
    if (sortField === 'issueDate') {
      return sortDirection === 'asc' 
        ? new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime()
        : new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
    }
    
    if (sortField === 'dueDate') {
      return sortDirection === 'asc' 
        ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    }
    
    if (sortField === 'totalAmount') {
      return sortDirection === 'asc' 
        ? a.totalAmount - b.totalAmount
        : b.totalAmount - a.totalAmount;
    }
    
    if (sortField === 'status') {
      const statusOrder = { paid: 0, partially_paid: 1, unpaid: 2, overdue: 3 };
      return sortDirection === 'asc' 
        ? statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder]
        : statusOrder[b.status as keyof typeof statusOrder] - statusOrder[a.status as keyof typeof statusOrder];
    }
    
    return 0;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button asChild>
            <Link to="/invoices/new">
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Link>
          </Button>
        </div>
      </div>

      {filteredInvoices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground">No invoices match your search criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>All Invoices</CardTitle>
            <CardDescription>Manage and view all student invoices.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead onClick={() => handleSort('issueDate')} className="cursor-pointer">
                    <div className="flex items-center">
                      Issue Date
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort('dueDate')} className="cursor-pointer">
                    <div className="flex items-center">
                      Due Date
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort('totalAmount')} className="cursor-pointer">
                    <div className="flex items-center">
                      Amount
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort('status')} className="cursor-pointer">
                    <div className="flex items-center">
                      Status
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>
                      <Link to={`/students/${invoice.studentId}`} className="text-primary hover:underline">
                        {invoice.studentName}
                      </Link>
                    </TableCell>
                    <TableCell>{invoice.monthYear}</TableCell>
                    <TableCell>{new Date(invoice.issueDate).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell>{new Date(invoice.dueDate).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          invoice.status === 'paid' ? 'default' : 
                          invoice.status === 'partially_paid' ? 'secondary' :
                          invoice.status === 'overdue' ? 'destructive' : 'outline'
                        }
                      >
                        {invoice.status === 'paid' ? 'Paid' : 
                         invoice.status === 'partially_paid' ? 'Partially Paid' :
                         invoice.status === 'overdue' ? 'Overdue' : 'Unpaid'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/invoices/${invoice.id}`}>
                          <FileText className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Invoices;
