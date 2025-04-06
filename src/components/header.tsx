import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { DiagramrLogo } from "@/components/diagramr-logo";
import { useAuth } from "@/components/auth-context";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogIn, Settings, LogOut, Sparkles, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const { user, signOut, profile } = useAuth();
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  const [profileInitial, setProfileInitial] = useState("U");

  // Handle scroll event to change header appearance
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update profile initial when profile changes
  useEffect(() => {
    if (profile?.username) {
      setProfileInitial(profile.username.charAt(0).toUpperCase());
    } else if (user?.email) {
      setProfileInitial(user.email.charAt(0).toUpperCase());
    } else {
      setProfileInitial("U");
    }
  }, [profile, user]);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const updatedProfile = customEvent.detail?.profile;
      
      if (updatedProfile?.username) {
        setProfileInitial(updatedProfile.username.charAt(0).toUpperCase());
      }
    };

    window.addEventListener('profile-updated', handleProfileUpdate as EventListener);
    
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate as EventListener);
    };
  }, []);

  // Get user's plan
  const getUserPlan = () => {
    if (!user || !profile) return "Free";
    return profile.is_premium ? "Premium" : "Free";
  };

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`fixed-header transition-all duration-300 ${
        scrolled 
          ? "border-b border-border/30 bg-background/85 backdrop-blur-lg shadow-sm" 
          : "border-b border-border/10 bg-transparent"
      }`}
    >
      <div className="container flex h-14 sm:h-16 items-center px-3 sm:px-4">
        <div className="flex items-center mr-2 sm:mr-4">
          <Link to="/" className="flex items-center">
            <DiagramrLogo size={isMobile ? "sm" : "lg"} />
          </Link>
        </div>
        
        <div className="flex-1"></div>
        
        <div className="flex items-center justify-end space-x-2 sm:space-x-4">
          {user && !profile?.is_premium ? (
            <Link to="/pricing">
              <Button 
                variant="premium" 
                size="sm" 
                className="text-white font-medium h-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 border-0 shadow-md transition-all duration-200 hover:shadow-lg"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                <span>Upgrade</span>
              </Button>
            </Link>
          ) : !user ? (
            <Link to="/pricing">
              <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground transition-colors gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Pricing</span>
              </Button>
            </Link>
          ) : (
            <Link to="/pricing">
              <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground transition-colors gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Pricing</span>
                {getUserPlan() === "Premium" && (
                  <Badge variant="outline" className="ml-1 py-0 h-5 px-1.5 text-xs bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-0 text-white">
                    PREMIUM
                  </Badge>
                )}
              </Button>
            </Link>
          )}
          
          {user && (
            <Link to="/liked">
              <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground transition-colors gap-2">
                <Heart className="h-3.5 w-3.5 text-primary" />
                <span>Liked</span>
              </Button>
            </Link>
          )}
          
          <ThemeToggle />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full p-0 h-8 w-8 sm:h-8 sm:w-8 overflow-hidden hover:bg-background/0 hover:opacity-90">
                  <Avatar className="h-7 w-7 sm:h-7 sm:w-7 transition-opacity hover:opacity-90">
                    <AvatarImage src={user.user_metadata?.avatar_url || ""} alt={profile?.username || user.email || "User"} />
                    <AvatarFallback className="bg-primary/5 text-primary text-xs">
                      {profileInitial}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-background/95 backdrop-blur-sm border-border/30 rounded-md">
                {isMobile && (
                  <>
                    <DropdownMenuItem asChild className="py-1.5 px-3 text-sm">
                      <Link to="/liked" className="cursor-pointer flex items-center">
                        <Heart className="mr-2 h-3.5 w-3.5 opacity-70" />
                        <span>Liked</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="bg-border/20 my-1" />
                  </>
                )}
                
                <DropdownMenuItem asChild className="py-1.5 px-3 text-sm">
                  <Link to="/account" className="cursor-pointer flex items-center">
                    <Settings className="mr-2 h-3.5 w-3.5 opacity-70" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-border/20 my-1" />
                
                <DropdownMenuItem 
                  onClick={async (e) => {
                    e.preventDefault();
                    try {
                      await signOut();
                    } catch (error) {
                      console.error("Error signing out:", error);
                    }
                  }} 
                  className="text-destructive focus:text-destructive py-1.5 px-3 text-sm cursor-pointer"
                >
                  <LogOut className="mr-2 h-3.5 w-3.5 opacity-70" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button variant="default" size="sm" className="h-8 px-3 rounded-md flex items-center gap-1.5 shadow-none bg-primary/90 hover:bg-primary/100">
                <LogIn className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Sign In</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
}
