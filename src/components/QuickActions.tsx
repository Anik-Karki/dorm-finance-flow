
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, FileText, CreditCard, Users, BarChart3, Settings } from 'lucide-react';

const QuickActions = () => {
  const actions = [
    {
      title: "Add New Student",
      description: "Register a new student to the hostel",
      icon: Users,
      link: "/students",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Record Payment",
      description: "Add a payment from any student",
      icon: CreditCard,
      link: "/payments",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "Create Invoice",
      description: "Generate monthly fee invoice",
      icon: FileText,
      link: "/invoices/new",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "View Reports",
      description: "Check financial reports and analytics",
      icon: BarChart3,
      link: "/reports",
      color: "bg-orange-500 hover:bg-orange-600"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Common tasks for hostel management
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          {actions.map((action) => (
            <Button
              key={action.title}
              asChild
              variant="outline"
              className="h-auto p-4 justify-start group hover:shadow-md transition-all"
            >
              <Link to={action.link}>
                <div className="flex items-start gap-3 w-full">
                  <div className={`p-2 rounded-md ${action.color} text-white group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
