import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Heart, Settings, User, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SidebarNavigation() {
  const [isCollapsed, setIsCollapsed] = useState(true); // Default to collapsed for mobile-first
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const userInitial = user?.email ? user.email[0].toUpperCase() : "U";
  
  const navItems = [
    {
      name: "Liked",
      icon: Heart,
      path: "/liked",
      description: "Your saved diagrams"
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/account",
      description: "Account settings"
    },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      // No need to navigate manually since auth-context will handle it
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <motion.div 
      className={cn(
        "h-screen fixed left-0 top-0 z-40 flex flex-col border-r border-border/40 bg-background/95 backdrop-blur-sm transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Empty space for header alignment */}
      <div className="p-4 flex items-center justify-between border-b border-border/40">
        {!isCollapsed && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-semibold"
          >
            Menu
          </motion.span>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className={cn(isCollapsed ? "mx-auto" : "ml-auto")}
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 overflow-auto py-6">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link key={item.name} to={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 mb-1",
                    isCollapsed ? "justify-center p-2" : "px-3 py-2",
                    isActive && "bg-primary/10 text-primary hover:bg-primary/15"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon size={20} />
                  {!isCollapsed && <span>{item.name}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* Theme toggle */}
      <div className={cn(
        "px-2 py-2",
        isCollapsed ? "flex justify-center" : ""
      )}>
        <ThemeToggle />
      </div>
      
      {/* User Profile */}
      <div className={cn(
        "border-t border-border/40 p-4",
        isCollapsed ? "flex justify-center" : ""
      )}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className={cn(
              "flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer",
              isCollapsed ? "justify-center" : ""
            )}>
              <Avatar className="h-9 w-9">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              
              {!isCollapsed && (
                <div className="truncate">
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">Free Plan</p>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/account')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/liked')}>
              <Heart className="mr-2 h-4 w-4" />
              <span>Liked Diagrams</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
