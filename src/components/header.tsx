import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { DiagramrLogo } from "@/components/diagramr-logo";
import { useAuth } from "@/components/auth-context";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, Heart, Settings, LogOut, ChevronUp } from "lucide-react";
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
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);

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
          {!isMobile && (
            <nav className="flex items-center space-x-2">
              {user && (
                <>
                  <Link to="/liked">
                    <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground transition-colors group">
                      <Heart className="mr-1.5 h-3.5 w-3.5 text-primary/80 group-hover:text-primary transition-colors" />
                      <span>Saved Diagrams</span>
                    </Button>
                  </Link>
                  <Link to="/pricing">
                    <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground transition-colors group">
                      <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary group-hover:rotate-12 transition-transform" />
                      <span>Upgrade</span>
                    </Button>
                  </Link>
                </>
              )}
              {!user && (
                <Link to="/pricing">
                  <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground transition-colors group">
                    <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary group-hover:rotate-12 transition-transform" />
                    <span>Pricing</span>
                  </Button>
                </Link>
              )}
            </nav>
          )}
          
          <ThemeToggle />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full p-0 h-8 w-8 sm:h-8 sm:w-8 overflow-hidden hover:bg-background/0 hover:opacity-90">
                  <Avatar className="h-7 w-7 sm:h-7 sm:w-7 transition-opacity hover:opacity-90">
                    <AvatarImage src={user.user_metadata?.avatar_url || ""} alt={user.email || "User"} />
                    <AvatarFallback className="bg-primary/5 text-primary text-xs">
                      {user.email ? user.email.substring(0, 2).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 bg-background/95 backdrop-blur-sm border-border/30 rounded-md">
                {isMobile && (
                  <>
                    <DropdownMenuItem asChild className="py-1.5 px-3 text-sm">
                      <Link to="/liked" className="cursor-pointer flex items-center">
                        <Heart className="mr-2 h-3.5 w-3.5 text-primary/80" />
                        <span>Saved Diagrams</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="py-1.5 px-3 text-sm">
                      <Link to="/pricing" className="cursor-pointer flex items-center">
                        <Sparkles className="mr-2 h-3.5 w-3.5 text-primary" />
                        <span>Upgrade</span>
                        <Badge variant="outline" className="ml-auto text-[10px] py-0 px-1.5 h-4 bg-primary/5">Pro</Badge>
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
                <DropdownMenuItem 
                  onClick={async () => {
                    try {
                      await signOut();
                      // For immediate feedback - this runs before the redirect in auth-context
                      localStorage.removeItem('diagramr-session');
                      window.location.href = '/';
                    } catch (error) {
                      console.error("Sign out error:", error);
                      // Fallback redirect on error
                      window.location.href = '/';
                    }
                  }} 
                  className="text-destructive focus:text-destructive py-1.5 px-3 text-sm"
                >
                  <LogOut className="mr-2 h-3.5 w-3.5 opacity-70" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button variant="default" size="sm" className="h-8 px-3 rounded-md flex items-center gap-1.5 shadow-none bg-primary/90 hover:bg-primary/100">
                <ChevronUp className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Sign In</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
}
