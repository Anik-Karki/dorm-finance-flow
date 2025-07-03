
import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Link } from 'react-router-dom';
import StudentForm from '@/components/forms/StudentForm';
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2, AlertTriangle, Users, DollarSign } from "lucide-react";
import { formatCurrency } from '@/lib/utils';

const Students = () => {
  const { students, invoices, deleteStudent, addStudent } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

  // Filter students based on search term
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phone.includes(searchTerm)
  );

  const handleAddStudent = (studentData: any) => {
    addStudent(studentData);
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
        alert("Cannot delete student with existing invoices. Please delete the invoices first or mark the student as inactive.");
      } else {
        deleteStudent(studentToDelete);
      }
      setStudentToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8 space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Student Management
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg lg:text-xl max-w-2xl mx-auto px-4">
            Comprehensive student information system with advanced fee management and service tracking
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm sm:text-base">Total Students</p>
                  <p className="text-2xl sm:text-3xl font-bold">{students.length}</p>
                </div>
                <Users className="h-8 w-8 sm:h-12 sm:w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm sm:text-base">Active Students</p>
                  <p className="text-2xl sm:text-3xl font-bold">{students.filter(s => s.status === 'active').length}</p>
                </div>
                <Users className="h-8 w-8 sm:h-12 sm:w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm sm:text-base">Total Advance</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold">
                    {formatCurrency(students.reduce((sum, s) => sum + s.advanceBalance, 0))}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 sm:h-12 sm:w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
          <div className="relative flex-1 max-w-full sm:max-w-md">
            <Search className="absolute left-3 sm:left-4 top-3 sm:top-4 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <Input
              placeholder="Search students by name, room, or phone..."
              className="pl-10 sm:pl-12 h-12 sm:h-14 border-2 border-gray-200 focus:border-blue-400 rounded-xl text-base sm:text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg rounded-xl shadow-lg w-full sm:w-auto">
                <Plus className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                Add New Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-7xl max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-800">Add New Student</DialogTitle>
                <DialogDescription className="text-blue-600 text-base sm:text-lg">
                  Enter complete student details including fee structure and required documents
                </DialogDescription>
              </DialogHeader>
              <StudentForm 
                onSubmit={handleAddStudent}
                onCancel={() => setShowAddDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {filteredStudents.length === 0 ? (
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <Users className="h-20 w-20 text-gray-400 mb-6" />
              <p className="text-muted-foreground text-xl">No students match your search criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
              <CardTitle className="text-2xl font-bold">Student Directory</CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                Complete registry with fee structures and advance balance tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50 hover:from-gray-50 hover:to-blue-50">
                      <TableHead className="font-bold text-gray-700 text-sm sm:text-base lg:text-lg whitespace-nowrap">Name</TableHead>
                      <TableHead className="font-bold text-gray-700 text-sm sm:text-base lg:text-lg whitespace-nowrap">Room</TableHead>
                      <TableHead className="font-bold text-gray-700 text-sm sm:text-base lg:text-lg whitespace-nowrap hidden md:table-cell">Phone</TableHead>
                      <TableHead className="font-bold text-gray-700 text-sm sm:text-base lg:text-lg whitespace-nowrap">Monthly Fee</TableHead>
                      <TableHead className="font-bold text-gray-700 text-sm sm:text-base lg:text-lg whitespace-nowrap hidden lg:table-cell">Advance Balance</TableHead>
                      <TableHead className="font-bold text-gray-700 text-sm sm:text-base lg:text-lg whitespace-nowrap">Status</TableHead>
                      <TableHead className="text-right font-bold text-gray-700 text-sm sm:text-base lg:text-lg whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border-b">
                        <TableCell className="font-bold text-gray-900 text-sm sm:text-base lg:text-lg py-3 sm:py-4">
                          <div className="truncate max-w-32 sm:max-w-none">{student.name}</div>
                        </TableCell>
                        <TableCell className="font-bold text-blue-600 text-sm sm:text-base lg:text-lg">{student.room}</TableCell>
                        <TableCell className="font-medium text-gray-700 text-sm sm:text-base hidden md:table-cell">{student.phone}</TableCell>
                        <TableCell className="font-bold text-green-600 text-sm sm:text-base lg:text-lg">{formatCurrency(student.feeAmount)}</TableCell>
                        <TableCell className={`font-bold text-sm sm:text-base lg:text-lg hidden lg:table-cell ${student.advanceBalance > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                          {formatCurrency(student.advanceBalance)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={student.status === 'active' ? 'default' : 'secondary'} 
                            className={`font-semibold px-2 sm:px-3 py-1 text-xs sm:text-sm ${
                              student.status === 'active' 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : 'bg-gray-100 text-gray-800 border-gray-200'
                            }`}
                          >
                            {student.status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-1 sm:space-x-2">
                          <Button asChild size="sm" variant="ghost" className="hover:bg-blue-100 h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-lg">
                            <Link to={`/students/${student.id}`}>
                              <Edit className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                            </Link>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-destructive hover:text-destructive hover:bg-red-100 h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-lg"
                            onClick={() => handleDeleteClick(student.id)}
                          >
                            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-[425px] rounded-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                Confirm Deletion
              </DialogTitle>
              <DialogDescription className="text-lg">
                Are you sure you want to delete this student? This action cannot be undone and will permanently remove all student data.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-3">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="px-6">
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete} className="px-6">
                Delete Student
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Students;
