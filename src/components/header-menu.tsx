import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./auth-context";
import { motion, AnimatePresence } from "framer-motion";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Settings, Heart, Sparkles, Menu } from "lucide-react";
import { toast } from "sonner";

interface ProfileUpdateEvent extends CustomEvent {
  detail: {
    profile: {
      username: string;
    }
  }
}

export function HeaderMenu() {
  const { user, profile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [userInitial, setUserInitial] = useState("U");
  
  // Admin emails for access control
  const adminEmails = ['admin@diagramr.com']; // Add your admin emails here
  const isAdmin = user && user.email && adminEmails.includes(user.email);

  // Update display name and initials when user or profile changes
  useEffect(() => {
    if (profile?.username) {
      setDisplayName(profile.username);
      setUserInitial(profile.username.charAt(0).toUpperCase());
    } else if (user?.email) {
      setDisplayName(user.email.split('@')[0]);
      setUserInitial(user.email.charAt(0).toUpperCase());
    } else {
      setDisplayName("User");
      setUserInitial("U");
    }
  }, [user, profile]);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = (event: Event) => {
      const customEvent = event as ProfileUpdateEvent;
      console.log("Header menu received profile update:", customEvent.detail);
      
      if (customEvent.detail?.profile?.username) {
        setDisplayName(customEvent.detail.profile.username);
        setUserInitial(customEvent.detail.profile.username.charAt(0).toUpperCase());
      }
    };

    window.addEventListener('profile-updated', handleProfileUpdate as EventListener);
    
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate as EventListener);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      // Navigation is now handled in auth-context
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  return (
    <div className="relative inline-block">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative overflow-hidden h-8 w-8 rounded-full hover:bg-primary/10 transition-colors duration-200"
          >
            <AnimatePresence mode="wait">
              {user ? (
                <motion.div
                  key="user-avatar"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-full h-full"
                >
                  <Avatar className="h-8 w-8 border border-border/40">
                    <AvatarImage src={profile?.avatar_url || ""} alt={displayName} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
              ) : (
                <motion.div
                  key="user-icon"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Menu className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-60 mt-1 p-1.5 border border-border/40 bg-card/95 backdrop-blur-sm shadow-lg rounded-xl"
          forceMount
          sideOffset={8}
        >
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {user ? (
                <>
                  <motion.div 
                    className="flex flex-col gap-1.5 p-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                  >
                    <div className="text-sm font-medium">
                      {displayName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {user.email}
                    </div>
                    {!profile?.is_premium && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="mt-2"
                      >
                        <Button 
                          asChild 
                          variant="premium" 
                          size="sm" 
                          className="w-full h-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-medium"
                        >
                          <Link to="/pricing" className="flex items-center justify-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Upgrade to Pro</span>
                          </Link>
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                  <DropdownMenuSeparator className="bg-border/20 my-1" />
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.25 }}
                  >
                    <DropdownMenuItem asChild className="py-1.5 px-3 text-sm focus:bg-primary/10 rounded-lg transition-colors duration-200">
                      <Link to="/dashboard" className="cursor-pointer w-full flex items-center">
                        <User className="mr-2 h-3.5 w-3.5 opacity-70" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="py-1.5 px-3 text-sm focus:bg-primary/10 rounded-lg transition-colors duration-200">
                      <Link to="/liked" className="cursor-pointer w-full flex items-center">
                        <Heart className="mr-2 h-3.5 w-3.5 opacity-70" />
                        <span>Liked Diagrams</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="py-1.5 px-3 text-sm focus:bg-primary/10 rounded-lg transition-colors duration-200">
                      <Link to="/account" className="cursor-pointer w-full flex items-center">
                        <Settings className="mr-2 h-3.5 w-3.5 opacity-70" />
                        <span>Account</span>
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                    <DropdownMenuItem asChild className="py-1.5 px-3 text-sm text-blue-600 dark:text-blue-400 focus:bg-blue-100 dark:focus:bg-blue-900/20 rounded-lg transition-colors duration-200">
                      <Link to="/admin/api-status" className="cursor-pointer w-full flex items-center">
                        <Settings className="mr-2 h-3.5 w-3.5 opacity-70" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    )}
                  </motion.div>
                  <DropdownMenuSeparator className="bg-border/20 my-1" />
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <DropdownMenuItem 
                      onClick={handleSignOut} 
                      className="text-destructive focus:text-destructive py-1.5 px-3 text-sm cursor-pointer focus:bg-destructive/10 rounded-lg transition-colors duration-200">
                      <LogOut className="mr-2 h-3.5 w-3.5 opacity-70" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </motion.div>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild className="py-2 px-3 text-sm focus:bg-primary/10 rounded-lg transition-colors duration-200">
                    <Link to="/pricing" className="cursor-pointer w-full flex items-center">
                      <Sparkles className="mr-2 h-3.5 w-3.5 opacity-70" />
                      <span>Pricing</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="py-2 px-3 text-sm focus:bg-primary/10 rounded-lg transition-colors duration-200">
                    <Link to="/auth" className="cursor-pointer w-full flex items-center">
                      <User className="mr-2 h-3.5 w-3.5 opacity-70" />
                      <span>Sign In</span>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
