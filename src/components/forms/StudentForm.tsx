import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Student, ExtraService } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, User, Home, Phone, DollarSign, FileText, Upload, X, Check, Search } from 'lucide-react';

const studentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  room: z.string().min(1, 'Room number is required'),
  phone: z.string().min(10, 'Phone number must be valid'),
  guardianName: z.string().min(2, 'Guardian name is required'),
  guardianPhone: z.string().min(10, 'Guardian phone must be valid'),
  permanentAddress: z.string().min(5, 'Permanent address is required'),
  localGuardianName: z.string().optional(),
  localGuardianPhone: z.string().optional(),
  localGuardianAddress: z.string().optional(),
  enrollmentDate: z.string().min(1, 'Enrollment date is required'),
  feeAmount: z.number().min(0, 'Fee amount must be positive'),
  advanceBalance: z.number().min(0, 'Advance balance must be non-negative'),
  status: z.enum(['active', 'inactive']),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  student?: Student;
  onSubmit: (data: Omit<Student, 'id'>) => void;
  onCancel: () => void;
}

const predefinedExpenses = [
  { name: 'Laundry Service', amount: 500 },
  { name: 'Cleaning Service', amount: 300 },
  { name: 'Wi-Fi Access', amount: 200 },
  { name: 'Study Materials', amount: 400 },
  { name: 'Recreation Activities', amount: 350 },
  { name: 'Medical Insurance', amount: 600 },
  { name: 'Transportation', amount: 450 },
  { name: 'Food Package Upgrade', amount: 800 },
];

const documentTypes = [
  { key: 'idDocument', label: 'ID Document', description: 'Citizenship, Passport, or any valid ID', icon: FileText },
  { key: 'photo', label: 'Student Photo', description: 'Recent passport-size photograph', icon: User },
  { key: 'educationCertificate', label: 'Education Certificate', description: 'School leaving certificate or transcript', icon: FileText },
  { key: 'medicalReport', label: 'Medical Report', description: 'Health checkup report (optional)', icon: FileText },
  { key: 'otherDocument', label: 'Other Document', description: 'Any additional relevant document', icon: FileText }
];

// Mock data from "kaha app" - replace with actual API call
const mockKahaAppData = [
  {
    phone: '9841234567',
    name: 'Ram Sharma',
    guardianName: 'Krishna Sharma',
    guardianPhone: '9841234566',
    permanentAddress: 'Kathmandu, Nepal'
  },
  {
    phone: '9851234567',
    name: 'Shyam Thapa',
    guardianName: 'Hari Thapa',
    guardianPhone: '9851234566',
    permanentAddress: 'Pokhara, Nepal'
  },
  {
    phone: '9861234567',
    name: 'Sita Rai',
    guardianName: 'Maya Rai',
    guardianPhone: '9861234566',
    permanentAddress: 'Dharan, Nepal'
  }
];

const StudentForm: React.FC<StudentFormProps> = ({ student, onSubmit, onCancel }) => {
  const [extraServices, setExtraServices] = useState<ExtraService[]>(student?.extraServices || []);
  const [customExpense, setCustomExpense] = useState({ name: '', amount: 0 });
  const [documents, setDocuments] = useState<{ [key: string]: File | null }>(
    student?.documents || {}
  );
  const [searchPhone, setSearchPhone] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: student?.name || '',
      room: student?.room || '',
      phone: student?.phone || '',
      guardianName: student?.guardianName || '',
      guardianPhone: student?.guardianPhone || '',
      permanentAddress: student?.permanentAddress || student?.address || '',
      localGuardianName: student?.localGuardianName || '',
      localGuardianPhone: student?.localGuardianPhone || '',
      localGuardianAddress: student?.localGuardianAddress || '',
      enrollmentDate: student?.enrollmentDate || new Date().toISOString().split('T')[0],
      feeAmount: student?.feeAmount || 0,
      advanceBalance: student?.advanceBalance || 0,
      status: student?.status || 'active',
    },
  });

  const addPredefinedExpense = (expense: { name: string; amount: number }) => {
    const exists = extraServices.find(service => service.name === expense.name);
    if (exists) {
      toast.error('This service is already added');
      return;
    }
    
    const newService: ExtraService = {
      id: Date.now().toString(36),
      name: expense.name,
      amount: expense.amount,
    };
    setExtraServices([...extraServices, newService]);
    toast.success(`${expense.name} added successfully`);
  };

  const addCustomExpense = () => {
    if (!customExpense.name.trim()) {
      toast.error('Please enter expense name');
      return;
    }
    if (customExpense.amount <= 0) {
      toast.error('Please enter valid amount');
      return;
    }

    const exists = extraServices.find(service => service.name === customExpense.name);
    if (exists) {
      toast.error('This service already exists');
      return;
    }

    const newService: ExtraService = {
      id: Date.now().toString(36),
      name: customExpense.name,
      amount: customExpense.amount,
    };
    setExtraServices([...extraServices, newService]);
    setCustomExpense({ name: '', amount: 0 });
    toast.success('Custom expense added successfully');
  };

  const removeExtraService = (id: string) => {
    setExtraServices(extraServices.filter(service => service.id !== id));
    toast.success('Service removed successfully');
  };

  const updateServiceAmount = (id: string, newAmount: number) => {
    setExtraServices(extraServices.map(service => 
      service.id === id ? { ...service, amount: newAmount } : service
    ));
  };

  const handleFileUpload = (documentType: string, file: File | null) => {
    setDocuments(prev => ({
      ...prev,
      [documentType]: file
    }));
    
    if (file) {
      toast.success(`${documentTypes.find(dt => dt.key === documentType)?.label} uploaded successfully`);
    }
  };

  const removeDocument = (documentType: string) => {
    setDocuments(prev => ({
      ...prev,
      [documentType]: null
    }));
    toast.success('Document removed successfully');
  };

  const calculateTotalFee = () => {
    const baseFee = form.watch('feeAmount') || 0;
    const extraTotal = extraServices.reduce((sum, service) => sum + service.amount, 0);
    return baseFee + extraTotal;
  };

  const searchKahaAppStudent = async (phoneNumber: string) => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    setIsSearching(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const foundStudent = mockKahaAppData.find(student => 
        student.phone === phoneNumber.trim()
      );
      
      if (foundStudent) {
        // Auto-populate form fields
        form.setValue('name', foundStudent.name);
        form.setValue('phone', foundStudent.phone);
        form.setValue('guardianName', foundStudent.guardianName);
        form.setValue('guardianPhone', foundStudent.guardianPhone);
        form.setValue('permanentAddress', foundStudent.permanentAddress);
        
        toast.success(`Student found: ${foundStudent.name}`);
        setSearchPhone('');
      } else {
        toast.error('Student not found in Kaha App database');
      }
      
      setIsSearching(false);
    }, 1000);
  };

  const handleFormSubmit = (data: StudentFormData) => {
    const totalFeeAmount = calculateTotalFee();
    
    const studentData: Omit<Student, 'id'> = {
      name: data.name,
      room: data.room,
      phone: data.phone,
      guardianName: data.guardianName,
      guardianPhone: data.guardianPhone,
      address: data.permanentAddress, // Keep for compatibility
      permanentAddress: data.permanentAddress,
      localGuardianName: data.localGuardianName,
      localGuardianPhone: data.localGuardianPhone,
      localGuardianAddress: data.localGuardianAddress,
      enrollmentDate: data.enrollmentDate,
      feeAmount: totalFeeAmount,
      advanceBalance: data.advanceBalance,
      status: data.status,
      extraServices,
      documents,
    };

    onSubmit(studentData);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Kaha App Search Card */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-cyan-50 to-blue-50">
        <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl flex items-center gap-3">
            <Search className="h-6 w-6" />
            Search from Kaha App
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-4">
            <p className="text-gray-600 text-lg">
              Search for existing students in your Kaha App database by phone number to auto-populate their information.
            </p>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter phone number (e.g., 9841234567)"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  className="h-12 text-lg border-2 border-gray-200 focus:border-cyan-400 rounded-xl"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      searchKahaAppStudent(searchPhone);
                    }
                  }}
                />
              </div>
              <Button
                type="button"
                onClick={() => searchKahaAppStudent(searchPhone)}
                disabled={isSearching}
                className="h-12 px-8 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
              >
                {isSearching ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Searching...
                  </div>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
              <p className="text-sm text-cyan-800">
                <strong>Test Phone Numbers:</strong> 9841234567 (Ram Sharma), 9851234567 (Shyam Thapa), 9861234567 (Sita Rai)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
          {/* Personal Information Card */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl flex items-center gap-3">
                <User className="h-6 w-6" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-gray-700">Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-12 text-lg border-2 border-gray-200 focus:border-blue-400 rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="room"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-gray-700">Room Number</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-12 text-lg border-2 border-gray-200 focus:border-blue-400 rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-gray-700">Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-12 text-lg border-2 border-gray-200 focus:border-blue-400 rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="enrollmentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-gray-700">Enrollment Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          className="h-12 text-lg border-2 border-gray-200 focus:border-blue-400 rounded-xl" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Address Information Card */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl flex items-center gap-3">
                <Home className="h-6 w-6" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <FormField
                control={form.control}
                name="permanentAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-gray-700">Permanent Address</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        className="min-h-24 text-lg border-2 border-gray-200 focus:border-green-400 rounded-xl resize-none" 
                        placeholder="Enter complete permanent address..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Guardian Information Card */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-violet-50">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl flex items-center gap-3">
                <Phone className="h-6 w-6" />
                Guardian Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <FormField
                  control={form.control}
                  name="guardianName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-gray-700">Primary Guardian Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-12 text-lg border-2 border-gray-200 focus:border-purple-400 rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="guardianPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-gray-700">Primary Guardian Phone</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-12 text-lg border-2 border-gray-200 focus:border-purple-400 rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="localGuardianName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-gray-700">Local Guardian Name (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-12 text-lg border-2 border-gray-200 focus:border-purple-400 rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="localGuardianPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-gray-700">Local Guardian Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-12 text-lg border-2 border-gray-200 focus:border-purple-400 rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="localGuardianAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-gray-700">Local Guardian Address (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        className="min-h-20 text-lg border-2 border-gray-200 focus:border-purple-400 rounded-xl resize-none" 
                        placeholder="Enter local guardian address if applicable..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Document Upload Card */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-amber-50">
            <CardHeader className="bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl flex items-center gap-3">
                <Upload className="h-6 w-6" />
                Document Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {documentTypes.map((docType) => {
                  const IconComponent = docType.icon;
                  const uploadedFile = documents[docType.key];
                  
                  return (
                    <div key={docType.key} className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <IconComponent className="h-5 w-5 text-orange-600" />
                        <Label className="font-semibold text-gray-700">{docType.label}</Label>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{docType.description}</p>
                      
                      {uploadedFile ? (
                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Check className="h-5 w-5 text-green-600" />
                              <span className="text-sm font-medium text-green-800 truncate max-w-32">
                                {uploadedFile.name}
                              </span>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => removeDocument(docType.key)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-orange-400 transition-colors">
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              handleFileUpload(docType.key, file);
                            }}
                            className="hidden"
                            id={`file-${docType.key}`}
                          />
                          <Label
                            htmlFor={`file-${docType.key}`}
                            className="flex flex-col items-center justify-center cursor-pointer text-center space-y-2 py-4"
                          >
                            <Upload className="h-8 w-8 text-gray-400" />
                            <span className="text-sm text-gray-600">Click to upload</span>
                            <span className="text-xs text-gray-500">PDF, JPG, PNG, DOC</span>
                          </Label>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Fee Management Card */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-teal-50">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl flex items-center gap-3">
                <DollarSign className="h-6 w-6" />
                Fee Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="feeAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-gray-700">Base Monthly Fee</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="h-12 text-lg border-2 border-gray-200 focus:border-emerald-400 rounded-xl" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="advanceBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-gray-700">Advance Payment</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="h-12 text-lg border-2 border-gray-200 focus:border-emerald-400 rounded-xl" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-gray-700">Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 text-lg border-2 border-gray-200 focus:border-emerald-400 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
            </CardContent>
          </Card>

          {/* Extra Services Card */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl flex items-center gap-3">
                <Plus className="h-6 w-6" />
                Extra Services & Expenses
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {/* Predefined Expenses */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Quick Add Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {predefinedExpenses.map((expense, index) => (
                    <div key={index} className="bg-white p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-300 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-800">{expense.name}</span>
                        <Badge variant="secondary">NPR {expense.amount}</Badge>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => addPredefinedExpense(expense)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Service
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Expense */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Add Custom Service</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Service name"
                    value={customExpense.name}
                    onChange={(e) => setCustomExpense({ ...customExpense, name: e.target.value })}
                    className="h-12 text-lg border-2 border-gray-200 focus:border-indigo-400 rounded-xl"
                  />
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={customExpense.amount || ''}
                    onChange={(e) => setCustomExpense({ ...customExpense, amount: Number(e.target.value) })}
                    className="h-12 text-lg border-2 border-gray-200 focus:border-indigo-400 rounded-xl"
                  />
                  <Button
                    type="button"
                    onClick={addCustomExpense}
                    className="h-12 bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Custom
                  </Button>
                </div>
              </div>

              {/* Added Services List */}
              {extraServices.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700">Selected Services</h3>
                  <div className="grid gap-4">
                    {extraServices.map((service) => (
                      <div key={service.id} className="bg-white p-4 rounded-xl border-2 border-indigo-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <span className="font-medium text-gray-800">{service.name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm">Amount:</Label>
                              <Input
                                type="number"
                                value={service.amount}
                                onChange={(e) => updateServiceAmount(service.id, Number(e.target.value))}
                                className="w-24 h-8 text-sm"
                              />
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => removeExtraService(service.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Total Fee Summary */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-teal-50">
            <CardContent className="p-6">
              <div className="bg-gradient-to-r from-emerald-100 to-teal-100 p-6 rounded-xl border border-emerald-200">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-emerald-800">Total Monthly Fee:</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    NPR {calculateTotalFee().toLocaleString()}
                  </span>
                </div>
                <div className="mt-2 text-sm text-emerald-700">
                  Base Fee: NPR {(form.watch('feeAmount') || 0).toLocaleString()} + 
                  Extra Services: NPR {extraServices.reduce((sum, service) => sum + service.amount, 0).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 p-6 bg-gray-50 rounded-xl">
            <Button type="button" variant="outline" onClick={onCancel} className="px-8 py-3 text-lg">
              Cancel
            </Button>
            <Button type="submit" className="px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              {student ? 'Update Student' : 'Add Student'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default StudentForm;
