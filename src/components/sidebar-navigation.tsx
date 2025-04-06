import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Heart, Settings, User, ChevronLeft, ChevronRight, LogOut, Sparkles } from "lucide-react";
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
  const { user, profile, signOut } = useAuth();
  
  const userInitial = profile?.username 
    ? profile.username[0].toUpperCase() 
    : user?.email 
      ? user.email[0].toUpperCase() 
      : "U";
  
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

  // Determine if user should see upgrade button
  const showUpgradeButton = user && profile && !profile.is_premium;

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
      {/* Subtle premium accent */}
      <div className="absolute top-0 bottom-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-primary/20 to-transparent"></div>
      
      {/* Menu header */}
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
        
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            variant="ghost"
            size="icon"
            className={cn(isCollapsed ? "mx-auto" : "ml-auto")}
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
        </motion.div>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 overflow-auto py-6">
        <nav className="space-y-1 px-2">
          {/* Upgrade button for non-premium users */}
          {showUpgradeButton && (
            <Link to="/pricing">
              <Button
                variant="ghost"
                className={cn(
                  "w-full mb-4 group relative overflow-hidden border border-dashed border-primary/30 hover:border-primary/50 text-foreground/90 hover:text-primary/90 transition-all duration-300",
                  isCollapsed ? "justify-center p-2" : "px-3 py-2 justify-start gap-3"
                )}
                title={isCollapsed ? "Upgrade to Pro" : undefined}
              >
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Sparkles 
                  size={20} 
                  className="text-primary relative z-10 group-hover:animate-pulse" 
                />
                {!isCollapsed && (
                  <span className="relative z-10 flex-1">
                    Upgrade to Pro
                    <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-indigo-500/40 via-purple-500/40 to-pink-500/40 transform origin-right group-hover:origin-left group-hover:scale-x-100 scale-x-0 transition-transform duration-300"></span>
                  </span>
                )}
              </Button>
            </Link>
          )}

          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                whileHover={{ x: isCollapsed ? 0 : 2 }}
              >
                <Link to={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 mb-1",
                      isCollapsed ? "justify-center p-2" : "px-3 py-2",
                      isActive && "bg-primary/10 text-primary hover:bg-primary/15"
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <item.icon size={20} className={isActive ? "animate-pulse" : ""} />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>
      
      {/* Theme toggle */}
      <motion.div 
        className={cn(
          "px-2 py-2",
          isCollapsed ? "flex justify-center" : ""
        )}
        whileHover={{ y: -2 }}
      >
        <ThemeToggle />
      </motion.div>
      
      {/* User Profile */}
      <div className={cn(
        "border-t border-border/40 p-4",
        isCollapsed ? "flex justify-center" : ""
      )}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div 
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer",
                isCollapsed ? "justify-center" : ""
              )}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Avatar className="h-9 w-9 border border-primary/10">
                <AvatarImage src={profile?.avatar_url || ""} alt={profile?.username || user?.email || "User"} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              
              {!isCollapsed && (
                <div className="truncate">
                  <p className="text-sm font-medium truncate">{profile?.username || user?.email}</p>
                  <p className="text-xs text-muted-foreground">{profile?.is_premium ? "Premium Plan" : "Free Plan"}</p>
                </div>
              )}
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px] rounded-lg shadow-lg animate-in slide-in-from-bottom-5 fade-in-80">
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
            {showUpgradeButton && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/pricing')} className="text-primary">
                  <Sparkles className="mr-2 h-4 w-4" />
                  <span>Upgrade to Pro</span>
                </DropdownMenuItem>
              </>
            )}
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
