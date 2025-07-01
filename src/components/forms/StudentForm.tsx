
import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, User, Home, Phone, Calendar, DollarSign } from 'lucide-react';
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
    address: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    baseFee: 0,
    extraServices: [] as ExtraService[],
    advanceBalance: 0,
    status: 'active' as const
  });

  const [newService, setNewService] = useState({
    name: '',
    amount: 0
  });

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

  const removeExtraService = (id: string) => {
    setStudentData(prev => ({
      ...prev,
      extraServices: prev.extraServices.filter(service => service.id !== id)
    }));
  };

  const totalMonthlyFee = studentData.baseFee + studentData.extraServices.reduce((sum, service) => sum + service.amount, 0);

  const handleSubmit = () => {
    const finalStudentData = {
      ...studentData,
      feeAmount: totalMonthlyFee
    };
    onSubmit(finalStudentData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Basic Information */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <User className="h-5 w-5" />
            Student Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
              <Input
                id="name"
                value={studentData.name}
                onChange={(e) => setStudentData({...studentData, name: e.target.value})}
                placeholder="Enter full name"
                className="border-2 border-gray-200 focus:border-blue-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room" className="text-sm font-semibold">Room Number</Label>
              <Input
                id="room"
                value={studentData.room}
                onChange={(e) => setStudentData({...studentData, room: e.target.value})}
                placeholder="e.g., A-101"
                className="border-2 border-gray-200 focus:border-blue-400"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold">Phone Number</Label>
              <Input
                id="phone"
                value={studentData.phone}
                onChange={(e) => setStudentData({...studentData, phone: e.target.value})}
                placeholder="e.g., 9876543210"
                className="border-2 border-gray-200 focus:border-blue-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="enrollmentDate" className="text-sm font-semibold">Enrollment Date</Label>
              <Input
                id="enrollmentDate"
                type="date"
                value={studentData.enrollmentDate}
                onChange={(e) => setStudentData({...studentData, enrollmentDate: e.target.value})}
                className="border-2 border-gray-200 focus:border-blue-400"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-semibold">Address</Label>
            <Input
              id="address"
              value={studentData.address}
              onChange={(e) => setStudentData({...studentData, address: e.target.value})}
              placeholder="Enter complete address"
              className="border-2 border-gray-200 focus:border-blue-400"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guardianName" className="text-sm font-semibold">Guardian's Name</Label>
              <Input
                id="guardianName"
                value={studentData.guardianName}
                onChange={(e) => setStudentData({...studentData, guardianName: e.target.value})}
                placeholder="Guardian's full name"
                className="border-2 border-gray-200 focus:border-blue-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardianPhone" className="text-sm font-semibold">Guardian's Phone</Label>
              <Input
                id="guardianPhone"
                value={studentData.guardianPhone}
                onChange={(e) => setStudentData({...studentData, guardianPhone: e.target.value})}
                placeholder="e.g., 9876543210"
                className="border-2 border-gray-200 focus:border-blue-400"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Structure */}
      <Card className="border-2 border-green-200">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <DollarSign className="h-5 w-5" />
            Fee Structure
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="baseFee" className="text-sm font-semibold">Base Monthly Fee</Label>
              <Input
                id="baseFee"
                type="number"
                value={studentData.baseFee || ''}
                onChange={(e) => setStudentData({...studentData, baseFee: Number(e.target.value)})}
                placeholder="e.g., 8000"
                className="border-2 border-gray-200 focus:border-green-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="advanceBalance" className="text-sm font-semibold">Initial Advance Balance</Label>
              <Input
                id="advanceBalance"
                type="number"
                value={studentData.advanceBalance || ''}
                onChange={(e) => setStudentData({...studentData, advanceBalance: Number(e.target.value)})}
                placeholder="e.g., 0"
                className="border-2 border-gray-200 focus:border-green-400"
              />
            </div>
          </div>

          {/* Extra Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-800">Extra Services</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="serviceName" className="text-sm font-semibold">Service Name</Label>
                <Input
                  id="serviceName"
                  value={newService.name}
                  onChange={(e) => setNewService({...newService, name: e.target.value})}
                  placeholder="e.g., Laundry, Meals, Internet"
                  className="border-2 border-gray-200 focus:border-green-400"
                />
              </div>
              <div>
                <Label htmlFor="serviceAmount" className="text-sm font-semibold">Monthly Amount</Label>
                <div className="flex gap-2">
                  <Input
                    id="serviceAmount"
                    type="number"
                    value={newService.amount || ''}
                    onChange={(e) => setNewService({...newService, amount: Number(e.target.value)})}
                    placeholder="Amount"
                    className="border-2 border-gray-200 focus:border-green-400"
                  />
                  <Button onClick={addExtraService} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {studentData.extraServices.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-green-700">Added Services:</h4>
                <div className="space-y-2">
                  {studentData.extraServices.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-green-700">
                          {service.name}
                        </Badge>
                        <span className="font-semibold text-green-800">
                          {formatCurrency(service.amount)}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeExtraService(service.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-blue-800">Total Monthly Fee:</span>
                <span className="text-2xl font-bold text-blue-900">{formatCurrency(totalMonthlyFee)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onCancel} className="px-6 py-2">
          Cancel
        </Button>
        <Button onClick={handleSubmit} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          Add Student
        </Button>
      </div>
    </div>
  );
};

export default StudentForm;
