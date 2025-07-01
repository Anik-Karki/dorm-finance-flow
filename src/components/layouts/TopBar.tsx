
import React from 'react';
import { Button } from "@/components/ui/button";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

interface TopBarProps {
  children?: React.ReactNode;
}

const TopBar: React.FC<TopBarProps> = ({ children }) => {
  const isMobile = useIsMobile();

  return (
    <header className="border-b border-border bg-background h-14 sm:h-16 flex items-center px-2 sm:px-4 justify-between">
      <div className="flex items-center flex-1">
        {children}
        {!isMobile && (
          <div className="relative ml-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search..." 
              className="pl-10 w-[200px] lg:w-[250px] h-9"
            />
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {isMobile && (
          <Button variant="ghost" size="icon" className="sm:hidden">
            <Search className="h-4 w-4" />
          </Button>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-destructive"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 sm:w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-96 overflow-auto">
              <DropdownMenuItem className="p-3 cursor-pointer">
                <div className="space-y-1">
                  <p className="font-medium text-sm">Payment Overdue</p>
                  <p className="text-xs text-muted-foreground">Rahul Singh has an overdue payment of ₹5,000</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-3 cursor-pointer">
                <div className="space-y-1">
                  <p className="font-medium text-sm">Low Advance Balance</p>
                  <p className="text-xs text-muted-foreground">Priya Sharma's advance balance is below ₹1,000</p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative flex items-center h-8 sm:h-10" size="sm">
              <Avatar className="h-6 w-6 sm:h-8 sm:w-8 mr-1 sm:mr-2">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">AD</AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm">Admin</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default TopBar;
