
import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, User, Home, Phone, Calendar, DollarSign, FileText, Users, Edit } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ExtraService {
  id: string;
  name: string;
  amount: number;
}

interface StudentFormProps {
  onSubmit: (studentData: any) => void;
  onCancel: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ onSubmit, onCancel }) => {
  const [studentData, setStudentData] = useState({
    name: '',
    room: '',
    phone: '',
    guardianName: '',
    guardianPhone: '',
    permanentAddress: '',
    localGuardianName: '',
    localGuardianPhone: '',
    localGuardianAddress: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    baseFee: 0,
    extraServices: [] as ExtraService[],
    advanceBalance: 0,
    status: 'active' as const,
    documents: {
      idDocument: null as File | null,
      photo: null as File | null,
      educationCertificate: null as File | null,
      medicalReport: null as File | null,
      otherDocument: null as File | null
    }
  });

  const [newService, setNewService] = useState({
    name: '',
    amount: 0
  });

  const [editingService, setEditingService] = useState<string | null>(null);

  // Enhanced predefined expenses with editable amounts
  const predefinedExpenses = [
    { name: 'Laundry Service', amount: 800 },
    { name: 'Mess/Food Service', amount: 4500 },
    { name: 'Internet/WiFi', amount: 1200 },
    { name: 'Cleaning Service', amount: 600 },
    { name: 'Security Deposit', amount: 3000 },
    { name: 'Electricity Bill', amount: 1500 },
    { name: 'Water Bill', amount: 500 },
    { name: 'Parking Fee', amount: 800 },
    { name: 'Study Room Access', amount: 1000 },
    { name: 'Gym/Recreation', amount: 1200 },
    { name: 'Maintenance Fee', amount: 700 },
    { name: 'Library Access', amount: 500 }
  ];

  const addPredefinedService = (expense: { name: string; amount: number }) => {
    const service: ExtraService = {
      id: Date.now().toString(),
      name: expense.name,
      amount: expense.amount
    };
    
    setStudentData(prev => ({
      ...prev,
      extraServices: [...prev.extraServices, service]
    }));
  };

  const addExtraService = () => {
    if (!newService.name.trim() || newService.amount <= 0) return;
    
    const service: ExtraService = {
      id: Date.now().toString(),
      name: newService.name,
      amount: newService.amount
    };
    
    setStudentData(prev => ({
      ...prev,
      extraServices: [...prev.extraServices, service]
    }));
    
    setNewService({ name: '', amount: 0 });
  };

  const updateServiceAmount = (id: string, newAmount: number) => {
    setStudentData(prev => ({
      ...prev,
      extraServices: prev.extraServices.map(service => 
        service.id === id ? { ...service, amount: newAmount } : service
      )
    }));
    setEditingService(null);
  };

  const removeExtraService = (id: string) => {
    setStudentData(prev => ({
      ...prev,
      extraServices: prev.extraServices.filter(service => service.id !== id)
    }));
  };

  const handleDocumentUpload = (docType: keyof typeof studentData.documents, file: File | null) => {
    setStudentData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docType]: file
      }
    }));
  };

  const totalMonthlyFee = studentData.baseFee + studentData.extraServices.reduce((sum, service) => sum + service.amount, 0);

  const handleSubmit = () => {
    const finalStudentData = {
      ...studentData,
      feeAmount: totalMonthlyFee,
      address: studentData.permanentAddress
    };
    onSubmit(finalStudentData);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* Basic Information */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold">
            <User className="h-6 w-6" />
            Student Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name</Label>
              <Input
                id="name"
                value={studentData.name}
                onChange={(e) => setStudentData({...studentData, name: e.target.value})}
                placeholder="Enter full name"
                className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl text-lg"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="room" className="text-sm font-semibold text-gray-700">Room Number</Label>
              <Input
                id="room"
                value={studentData.room}
                onChange={(e) => setStudentData({...studentData, room: e.target.value})}
                placeholder="e.g., A-101"
                className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl text-lg"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number</Label>
              <Input
                id="phone"
                value={studentData.phone}
                onChange={(e) => setStudentData({...studentData, phone: e.target.value})}
                placeholder="e.g., 9876543210"
                className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl text-lg"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="enrollmentDate" className="text-sm font-semibold text-gray-700">Enrollment Date</Label>
              <Input
                id="enrollmentDate"
                type="date"
                value={studentData.enrollmentDate}
                onChange={(e) => setStudentData({...studentData, enrollmentDate: e.target.value})}
                className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl text-lg"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="permanentAddress" className="text-sm font-semibold text-gray-700">Permanent Address</Label>
            <Textarea
              id="permanentAddress"
              value={studentData.permanentAddress}
              onChange={(e) => setStudentData({...studentData, permanentAddress: e.target.value})}
              placeholder="Enter complete permanent address"
              className="border-2 border-gray-200 focus:border-blue-500 rounded-xl text-lg"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="guardianName" className="text-sm font-semibold text-gray-700">Guardian's Name</Label>
              <Input
                id="guardianName"
                value={studentData.guardianName}
                onChange={(e) => setStudentData({...studentData, guardianName: e.target.value})}
                placeholder="Guardian's full name"
                className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl text-lg"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="guardianPhone" className="text-sm font-semibold text-gray-700">Guardian's Phone</Label>
              <Input
                id="guardianPhone"
                value={studentData.guardianPhone}
                onChange={(e) => setStudentData({...studentData, guardianPhone: e.target.value})}
                placeholder="e.g., 9876543210"
                className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl text-lg"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Local Guardian Information */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-xl">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold">
            <Users className="h-6 w-6" />
            Local Guardian Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="localGuardianName" className="text-sm font-semibold text-gray-700">Local Guardian's Name</Label>
              <Input
                id="localGuardianName"
                value={studentData.localGuardianName}
                onChange={(e) => setStudentData({...studentData, localGuardianName: e.target.value})}
                placeholder="Local guardian's full name"
                className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl text-lg"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="localGuardianPhone" className="text-sm font-semibold text-gray-700">Local Guardian's Phone</Label>
              <Input
                id="localGuardianPhone"
                value={studentData.localGuardianPhone}
                onChange={(e) => setStudentData({...studentData, localGuardianPhone: e.target.value})}
                placeholder="e.g., 9876543210"
                className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl text-lg"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="localGuardianAddress" className="text-sm font-semibold text-gray-700">Local Guardian's Address</Label>
            <Textarea
              id="localGuardianAddress"
              value={studentData.localGuardianAddress}
              onChange={(e) => setStudentData({...studentData, localGuardianAddress: e.target.value})}
              placeholder="Enter local guardian's complete address"
              className="border-2 border-gray-200 focus:border-purple-500 rounded-xl text-lg"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Documents Section */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-yellow-50">
        <CardHeader className="bg-gradient-to-r from-orange-600 to-yellow-600 text-white rounded-t-xl">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold">
            <FileText className="h-6 w-6" />
            Document Upload (Safety & Verification)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="idDocument" className="text-sm font-semibold text-gray-700">ID Document (Citizenship/Passport/Any Valid ID)</Label>
              <Input
                id="idDocument"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => handleDocumentUpload('idDocument', e.target.files?.[0] || null)}
                className="h-12 border-2 border-gray-200 focus:border-orange-500 rounded-xl"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="photo" className="text-sm font-semibold text-gray-700">Passport Size Photo</Label>
              <Input
                id="photo"
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={(e) => handleDocumentUpload('photo', e.target.files?.[0] || null)}
                className="h-12 border-2 border-gray-200 focus:border-orange-500 rounded-xl"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="educationCertificate" className="text-sm font-semibold text-gray-700">Education Certificate</Label>
              <Input
                id="educationCertificate"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => handleDocumentUpload('educationCertificate', e.target.files?.[0] || null)}
                className="h-12 border-2 border-gray-200 focus:border-orange-500 rounded-xl"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="medicalReport" className="text-sm font-semibold text-gray-700">Medical Report (Optional)</Label>
              <Input
                id="medicalReport"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => handleDocumentUpload('medicalReport', e.target.files?.[0] || null)}
                className="h-12 border-2 border-gray-200 focus:border-orange-500 rounded-xl"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="otherDocument" className="text-sm font-semibold text-gray-700">Other Document (Optional)</Label>
            <Input
              id="otherDocument"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => handleDocumentUpload('otherDocument', e.target.files?.[0] || null)}
              className="h-12 border-2 border-gray-200 focus:border-orange-500 rounded-xl"
            />
          </div>
          
          <div className="text-sm text-gray-600 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
            <p><strong>Note:</strong> Documents are stored securely for safety and verification. Any valid ID document is acceptable for underage students. Accepted formats: JPG, JPEG, PNG, PDF (Max 5MB each)</p>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Fee Structure */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-xl">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold">
            <DollarSign className="h-6 w-6" />
            Fee Structure & Services
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="baseFee" className="text-sm font-semibold text-gray-700">Base Monthly Fee</Label>
              <Input
                id="baseFee"
                type="number"
                value={studentData.baseFee || ''}
                onChange={(e) => setStudentData({...studentData, baseFee: Number(e.target.value)})}
                placeholder="e.g., 8000"
                className="h-12 border-2 border-gray-200 focus:border-green-500 rounded-xl text-lg"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="advanceBalance" className="text-sm font-semibold text-gray-700">Initial Advance Balance</Label>
              <Input
                id="advanceBalance"
                type="number"
                value={studentData.advanceBalance || ''}
                onChange={(e) => setStudentData({...studentData, advanceBalance: Number(e.target.value)})}
                placeholder="e.g., 0"
                className="h-12 border-2 border-gray-200 focus:border-green-500 rounded-xl text-lg"
              />
            </div>
          </div>

          {/* Quick Add Predefined Expenses */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-green-800">Quick Add Common Services</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {predefinedExpenses.map((expense) => (
                <Button
                  key={expense.name}
                  variant="outline"
                  size="sm"
                  onClick={() => addPredefinedService(expense)}
                  className="text-xs p-3 h-auto flex-col border-2 border-green-200 hover:bg-green-100 hover:border-green-400 rounded-xl transition-all duration-200"
                  disabled={studentData.extraServices.some(service => service.name === expense.name)}
                >
                  <span className="font-semibold text-center">{expense.name}</span>
                  <span className="text-green-600 font-bold">Rs. {expense.amount}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Extra Services */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-green-800">Add Custom Service</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="serviceName" className="text-sm font-semibold text-gray-700">Service Name</Label>
                <Input
                  id="serviceName"
                  value={newService.name}
                  onChange={(e) => setNewService({...newService, name: e.target.value})}
                  placeholder="e.g., Custom Service"
                  className="h-12 border-2 border-gray-200 focus:border-green-500 rounded-xl text-lg"
                />
              </div>
              <div>
                <Label htmlFor="serviceAmount" className="text-sm font-semibold text-gray-700">Monthly Amount</Label>
                <div className="flex gap-2">
                  <Input
                    id="serviceAmount"
                    type="number"
                    value={newService.amount || ''}
                    onChange={(e) => setNewService({...newService, amount: Number(e.target.value)})}
                    placeholder="Amount"
                    className="h-12 border-2 border-gray-200 focus:border-green-500 rounded-xl text-lg"
                  />
                  <Button onClick={addExtraService} className="h-12 px-4 bg-green-600 hover:bg-green-700 rounded-xl">
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {studentData.extraServices.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-bold text-green-700 text-lg">Added Services:</h4>
                <div className="space-y-3">
                  {studentData.extraServices.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-green-200 shadow-sm">
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary" className="text-green-700 px-3 py-1 text-sm font-semibold">
                          {service.name}
                        </Badge>
                        {editingService === service.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              defaultValue={service.amount}
                              className="w-24 h-8"
                              onBlur={(e) => updateServiceAmount(service.id, Number(e.target.value))}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  updateServiceAmount(service.id, Number((e.target as HTMLInputElement).value));
                                }
                              }}
                              autoFocus
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-green-800 text-lg">
                              {formatCurrency(service.amount)}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingService(service.id)}
                              className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeExtraService(service.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-6 rounded-xl border-2 border-blue-300">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-blue-800">Total Monthly Fee:</span>
                <span className="text-3xl font-bold text-blue-900">{formatCurrency(totalMonthlyFee)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-4">
        <Button variant="outline" onClick={onCancel} className="px-8 py-3 text-lg rounded-xl">
          Cancel
        </Button>
        <Button onClick={handleSubmit} className="px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl">
          Add Student
        </Button>
      </div>
    </div>
  );
};

export default StudentForm;
