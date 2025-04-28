
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Separator,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { Plus, Trash2, Edit, Save, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

// Mock service items data
const initialServiceItems = [
  { id: '1', name: 'Extra Food', rate: 50, description: 'Per meal extra food charge' },
  { id: '2', name: 'Laundry', rate: 20, description: 'Per cloth laundry service' },
  { id: '3', name: 'Internet', rate: 100, description: 'High-speed internet add-on' },
  { id: '4', name: 'Printing', rate: 5, description: 'Per page printing service' },
];

const Settings = () => {
  // Hostel Settings
  const [hostelSettings, setHostelSettings] = useState({
    hostelName: 'HostelFin',
    address: '123 College Road, City, State',
    phone: '9876543210',
    email: 'contact@hostelfin.com',
    gracePeriod: 5,
    lateFeeAmount: 100,
    billingCycle: { start: '01', end: '30' },
    enableSmsNotifications: false,
    enableEmailNotifications: true,
  });
  
  // Extra Service Items
  const [serviceItems, setServiceItems] = useState(initialServiceItems);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  
  // New Service Item
  const [newServiceItem, setNewServiceItem] = useState({
    name: '',
    rate: 0,
    description: ''
  });
  
  // User Management
  const [users, setUsers] = useState([
    { id: '1', name: 'Admin User', email: 'admin@hostelfin.com', role: 'admin', lastLogin: '2024-04-26T10:30:00Z' },
    { id: '2', name: 'Manager', email: 'manager@hostelfin.com', role: 'manager', lastLogin: '2024-04-25T14:20:00Z' },
  ]);
  
  // Handle save hostel settings
  const saveHostelSettings = () => {
    // In a real app, this would save to a database
    toast.success('Hostel settings saved successfully');
  };
  
  // Handle add service item
  const handleAddServiceItem = () => {
    if (!newServiceItem.name || newServiceItem.rate <= 0) {
      toast.error('Please enter a valid name and rate');
      return;
    }
    
    const newItem = {
      id: Date.now().toString(),
      ...newServiceItem
    };
    
    setServiceItems([...serviceItems, newItem]);
    setNewServiceItem({ name: '', rate: 0, description: '' });
    toast.success(`Service item '${newItem.name}' added successfully`);
  };
  
  // Handle update service item
  const handleUpdateItem = (id: string, field: string, value: string | number) => {
    setServiceItems(serviceItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };
  
  // Handle delete service item
  const handleDeleteItem = (id: string) => {
    setServiceItems(serviceItems.filter(item => item.id !== id));
    toast.success('Service item deleted successfully');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="services">Extra Service Items</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="system">System & Backup</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hostel Information</CardTitle>
              <CardDescription>Basic details used in invoices and reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hostelName">Hostel Name</Label>
                  <Input 
                    id="hostelName" 
                    value={hostelSettings.hostelName}
                    onChange={(e) => setHostelSettings({...hostelSettings, hostelName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={hostelSettings.phone}
                    onChange={(e) => setHostelSettings({...hostelSettings, phone: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  value={hostelSettings.address}
                  onChange={(e) => setHostelSettings({...hostelSettings, address: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={hostelSettings.email}
                  onChange={(e) => setHostelSettings({...hostelSettings, email: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Billing Settings</CardTitle>
              <CardDescription>Configure how billing works in your hostel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Billing Cycle</Label>
                  <div className="flex gap-2 items-center">
                    <Input 
                      value={hostelSettings.billingCycle.start}
                      onChange={(e) => setHostelSettings({
                        ...hostelSettings, 
                        billingCycle: {...hostelSettings.billingCycle, start: e.target.value}
                      })}
                      className="w-20"
                      placeholder="01"
                    />
                    <span>to</span>
                    <Input 
                      value={hostelSettings.billingCycle.end}
                      onChange={(e) => setHostelSettings({
                        ...hostelSettings, 
                        billingCycle: {...hostelSettings.billingCycle, end: e.target.value}
                      })}
                      className="w-20"
                      placeholder="30"
                    />
                    <span className="text-sm text-muted-foreground">of each month</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gracePeriod">Grace Period (Days)</Label>
                  <Input 
                    id="gracePeriod" 
                    type="number"
                    value={hostelSettings.gracePeriod}
                    onChange={(e) => setHostelSettings({...hostelSettings, gracePeriod: Number(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lateFeeAmount">Late Payment Fee</Label>
                <Input 
                  id="lateFeeAmount" 
                  type="number"
                  value={hostelSettings.lateFeeAmount}
                  onChange={(e) => setHostelSettings({...hostelSettings, lateFeeAmount: Number(e.target.value)})}
                  className="w-full md:w-1/3"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how and when notifications are sent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="smsNotifications">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send text message notifications to students
                  </p>
                </div>
                <Switch
                  id="smsNotifications"
                  checked={hostelSettings.enableSmsNotifications}
                  onCheckedChange={(checked) => setHostelSettings({...hostelSettings, enableSmsNotifications: checked})}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send email notifications for invoices and payments
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={hostelSettings.enableEmailNotifications}
                  onCheckedChange={(checked) => setHostelSettings({...hostelSettings, enableEmailNotifications: checked})}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveHostelSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Extra Service Items</CardTitle>
                <CardDescription>Manage additional services that can be charged to students</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Service Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Service Item</DialogTitle>
                    <DialogDescription>
                      Create a new extra service that can be added to student invoices.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="itemName">Service Name</Label>
                      <Input
                        id="itemName"
                        value={newServiceItem.name}
                        onChange={(e) => setNewServiceItem({...newServiceItem, name: e.target.value})}
                        placeholder="e.g., Extra Food, Laundry, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="itemRate">Rate (₹)</Label>
                      <Input
                        id="itemRate"
                        type="number"
                        value={newServiceItem.rate || ''}
                        onChange={(e) => setNewServiceItem({...newServiceItem, rate: Number(e.target.value)})}
                        placeholder="Enter rate amount"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="itemDescription">Description</Label>
                      <Input
                        id="itemDescription"
                        value={newServiceItem.description}
                        onChange={(e) => setNewServiceItem({...newServiceItem, description: e.target.value})}
                        placeholder="Brief description of the service"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddServiceItem}>Add Item</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Rate (₹)</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {editingItem === item.id ? (
                          <Input
                            value={item.name}
                            onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                          />
                        ) : (
                          <div className="font-medium">{item.name}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingItem === item.id ? (
                          <Input
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleUpdateItem(item.id, 'rate', Number(e.target.value))}
                          />
                        ) : (
                          <div>₹{item.rate}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingItem === item.id ? (
                          <Input
                            value={item.description}
                            onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                          />
                        ) : (
                          <div className="text-muted-foreground">{item.description}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {editingItem === item.id ? (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setEditingItem(null)}
                          >
                            <Save className="h-4 w-4 mr-1" /> Save
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => setEditingItem(item.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                Confirm Deletion
                              </DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete "{item.name}"? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => {}}>Cancel</Button>
                              <Button variant="destructive" onClick={() => handleDeleteItem(item.id)}>Delete</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}

                  {serviceItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        No service items found. Add your first service item.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>System Users</CardTitle>
                <CardDescription>Manage staff accounts and permissions</CardDescription>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin' ? 'Admin' : 'Manager'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.lastLogin).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-destructive hover:text-destructive"
                          disabled={user.role === 'admin'} // Can't delete admin
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
        </TabsContent>
        
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Backup</CardTitle>
              <CardDescription>Export and backup your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Export Data</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Download a complete backup of your system data.
                  </p>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export All Data
                  </Button>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-1">Selective Export</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Export specific data from your system.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">Export Students</Button>
                    <Button variant="outline" size="sm">Export Invoices</Button>
                    <Button variant="outline" size="sm">Export Payments</Button>
                    <Button variant="outline" size="sm">Export Ledger</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>Details about your system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">System Version</p>
                  <p className="font-medium">HostelFin v1.0.0</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Last Backup</p>
                  <p className="font-medium">Never</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Database Size</p>
                  <p className="font-medium">12 MB</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Activated On</p>
                  <p className="font-medium">April 28, 2024</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                These actions are destructive and cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Reset System</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  This will delete all data and reset the system to its initial state.
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive">Reset System</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Extremely Dangerous Action
                      </DialogTitle>
                      <DialogDescription>
                        Are you absolutely sure you want to reset the entire system? This will delete ALL data including students, invoices, payments, and settings. This action CANNOT be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="my-2">
                      <Input placeholder="Type 'RESET' to confirm" />
                    </div>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button variant="destructive">I understand, Reset Everything</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
