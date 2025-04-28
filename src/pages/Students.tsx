
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, AlertTriangle } from "lucide-react";
import { formatCurrency } from '@/lib/utils';

const Students = () => {
  const { students, invoices, deleteStudent, addStudent } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [newStudent, setNewStudent] = useState({
    name: '',
    room: '',
    phone: '',
    guardianName: '',
    guardianPhone: '',
    address: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    feeAmount: 0,
    advanceBalance: 0,
    status: 'active' as const
  });

  // Filter students based on search term
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phone.includes(searchTerm)
  );

  const handleAddStudent = () => {
    addStudent(newStudent);
    setNewStudent({
      name: '',
      room: '',
      phone: '',
      guardianName: '',
      guardianPhone: '',
      address: '',
      enrollmentDate: new Date().toISOString().split('T')[0],
      feeAmount: 0,
      advanceBalance: 0,
      status: 'active'
    });
    setShowAddDialog(false);
  };

  const handleDeleteClick = (id: string) => {
    setStudentToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      // Check if student has any invoices
      const studentInvoices = invoices.filter(inv => inv.studentId === studentToDelete);
      if (studentInvoices.length > 0) {
        // Show an error or warning message
        alert("Cannot delete student with existing invoices. Please delete the invoices first or mark the student as inactive.");
      } else {
        deleteStudent(studentToDelete);
      }
      setStudentToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Students</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>
                  Enter the details of the new student.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="room">Room Number</Label>
                    <Input
                      id="room"
                      value={newStudent.room}
                      onChange={(e) => setNewStudent({...newStudent, room: e.target.value})}
                      placeholder="e.g., 101"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={newStudent.phone}
                      onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                      placeholder="e.g., 9876543210"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="enrollmentDate">Enrollment Date</Label>
                    <Input
                      id="enrollmentDate"
                      type="date"
                      value={newStudent.enrollmentDate}
                      onChange={(e) => setNewStudent({...newStudent, enrollmentDate: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newStudent.address}
                    onChange={(e) => setNewStudent({...newStudent, address: e.target.value})}
                    placeholder="Enter complete address"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guardianName">Guardian's Name</Label>
                    <Input
                      id="guardianName"
                      value={newStudent.guardianName}
                      onChange={(e) => setNewStudent({...newStudent, guardianName: e.target.value})}
                      placeholder="Guardian's full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guardianPhone">Guardian's Phone</Label>
                    <Input
                      id="guardianPhone"
                      value={newStudent.guardianPhone}
                      onChange={(e) => setNewStudent({...newStudent, guardianPhone: e.target.value})}
                      placeholder="e.g., 9876543210"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="feeAmount">Monthly Fee Amount</Label>
                    <Input
                      id="feeAmount"
                      type="number"
                      value={newStudent.feeAmount || ''}
                      onChange={(e) => setNewStudent({...newStudent, feeAmount: Number(e.target.value)})}
                      placeholder="e.g., 6000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="advanceBalance">Initial Advance Balance</Label>
                    <Input
                      id="advanceBalance"
                      type="number"
                      value={newStudent.advanceBalance || ''}
                      onChange={(e) => setNewStudent({...newStudent, advanceBalance: Number(e.target.value)})}
                      placeholder="e.g., 0"
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button onClick={handleAddStudent}>Add Student</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Delete Confirmation Dialog */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Confirm Deletion
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this student? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
                <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground">No students match your search criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Student List</CardTitle>
            <CardDescription>Manage student information, fees, and payments.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Monthly Fee</TableHead>
                  <TableHead>Advance Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.room}</TableCell>
                    <TableCell>{formatCurrency(student.feeAmount)}</TableCell>
                    <TableCell>{formatCurrency(student.advanceBalance)}</TableCell>
                    <TableCell>
                      <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                        {student.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button asChild size="sm" variant="ghost">
                        <Link to={`/students/${student.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClick(student.id)}
                      >
                        <Trash2 className="h-4 w-4" />
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

export default Students;
