
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { DiagramrLogo } from "@/components/diagramr-logo";
import { useAuth } from "@/components/auth-context";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LayoutDashboard, Heart, LogIn } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center">
        <div className="flex items-center mr-4">
          <Link to="/" className="flex items-center space-x-2">
            <DiagramrLogo size="sm" />
          </Link>
        </div>
        
        <div className="flex-1"></div>
        
        <div className="flex items-center justify-end space-x-4">
          <nav className="hidden md:flex items-center space-x-1">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-foreground/90 hover:text-foreground transition-colors">
                Home
              </Button>
            </Link>
            
            {user && (
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="text-foreground/90 hover:text-foreground transition-colors">
                  Dashboard
                </Button>
              </Link>
            )}
            
            <Link to="/pricing">
              <Button variant="ghost" size="sm" className="text-foreground/90 hover:text-foreground transition-colors">
                Pricing
              </Button>
            </Link>
          </nav>
          
          <ThemeToggle />
          
          {user ? (
            <>
              <Link to="/liked" className="hidden md:flex">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full p-0 h-9 w-9 overflow-hidden">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.user_metadata?.avatar_url || ""} alt={user.email || "User"} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.email ? user.email.substring(0, 2).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer flex items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/liked" className="cursor-pointer flex items-center">
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Liked Diagrams</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-red-500 focus:text-red-500">
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="default" size="sm" className="ml-2 flex items-center gap-1">
                <LogIn className="h-4 w-4 mr-1" />
                <span>Sign In</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
}
