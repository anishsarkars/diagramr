import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./auth-context";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Settings, Heart } from "lucide-react";
import { toast } from "sonner";

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
      const customEvent = event as CustomEvent;
      const updatedProfile = customEvent.detail?.profile;
      
      if (updatedProfile?.username) {
        setDisplayName(updatedProfile.username);
        setUserInitial(updatedProfile.username.charAt(0).toUpperCase());
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
            className="relative h-8 w-8 rounded-full"
          >
            {user ? (
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || ""} alt={displayName} />
                <AvatarFallback className="text-xs">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
            ) : (
              <User className="h-5 w-5" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 mt-1 p-1.5">
          {user ? (
            <>
              <div className="flex flex-col gap-1.5 p-3">
                <div className="text-sm font-medium">
                  {displayName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {user.email}
                </div>
              </div>
              <DropdownMenuSeparator className="bg-border/20 my-1" />
              <DropdownMenuItem asChild className="py-1.5 px-3 text-sm">
                <Link to="/dashboard" className="cursor-pointer w-full flex items-center">
                  <User className="mr-2 h-3.5 w-3.5 opacity-70" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="py-1.5 px-3 text-sm">
                <Link to="/liked" className="cursor-pointer w-full flex items-center">
                  <Heart className="mr-2 h-3.5 w-3.5 opacity-70" />
                  <span>Liked Diagrams</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="py-1.5 px-3 text-sm">
                <Link to="/account" className="cursor-pointer w-full flex items-center">
                  <Settings className="mr-2 h-3.5 w-3.5 opacity-70" />
                  <span>Account</span>
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
              <DropdownMenuItem asChild className="py-1.5 px-3 text-sm text-blue-600 dark:text-blue-400">
                <Link to="/admin/api-status" className="cursor-pointer w-full flex items-center">
                  <Settings className="mr-2 h-3.5 w-3.5 opacity-70" />
                  <span>Admin Dashboard</span>
                </Link>
              </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-border/20 my-1" />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive py-1.5 px-3 text-sm">
                <LogOut className="mr-2 h-3.5 w-3.5 opacity-70" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem asChild className="py-1.5 px-3 text-sm">
                <Link to="/pricing" className="cursor-pointer w-full flex items-center">
                  <span>Pricing</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="py-1.5 px-3 text-sm">
                <Link to="/auth" className="cursor-pointer w-full flex items-center">
                  <span>Sign In</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
