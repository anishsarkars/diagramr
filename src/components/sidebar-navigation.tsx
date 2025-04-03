
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Settings, User, ChevronLeft, ChevronRight, Search, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth-context";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function SidebarNavigation() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  
  const userInitial = user?.email ? user.email[0].toUpperCase() : "U";
  
  const navItems = [
    {
      name: "Search",
      icon: Search,
      path: "/dashboard",
      description: "Search for diagrams"
    },
    {
      name: "New Diagram",
      icon: Plus,
      path: "/create",
      description: "Create a new diagram"
    },
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

  return (
    <TooltipProvider delayDuration={300}>
      <motion.div 
        className={cn(
          "h-screen fixed left-0 top-0 z-40 flex flex-col border-r border-border/40 bg-background/95 backdrop-blur-sm transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b border-border/40">
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-medium">D</span>
              </div>
              <span className="font-semibold">Diagramr</span>
            </motion.div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
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
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    <Link to={item.path}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-3 mb-1",
                          isCollapsed ? "justify-center p-2" : "px-3 py-2",
                          isActive && "bg-primary/10 text-primary hover:bg-primary/15"
                        )}
                      >
                        <item.icon size={20} />
                        {!isCollapsed && <span>{item.name}</span>}
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      {item.description}
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </nav>
        </div>
        
        {/* User Profile */}
        <div className={cn(
          "border-t border-border/40 p-4",
          isCollapsed ? "flex justify-center" : ""
        )}>
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
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
