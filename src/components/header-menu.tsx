
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { useAuth } from "./auth-context";
import { User, LogOut, Settings, Heart, Menu, ChevronDown } from "lucide-react";
import { toast } from "sonner";

export function HeaderMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Successfully signed out");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center gap-1 group transition-all duration-300"
        >
          <Menu className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform duration-300" />
          <span className="font-medium">Menu</span>
          <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
        {user ? (
          <>
            <DropdownMenuLabel className="flex items-center gap-2 px-3 py-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="truncate text-sm font-medium">{user.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem asChild className="hover:bg-accent/50 transition-colors">
              <Link to="/dashboard" className="cursor-pointer w-full flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="hover:bg-accent/50 transition-colors">
              <Link to="/liked" className="cursor-pointer w-full flex items-center">
                <Heart className="mr-2 h-4 w-4" />
                <span>Liked Diagrams</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="hover:bg-accent/50 transition-colors">
              <Link to="/account" className="cursor-pointer w-full flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem onClick={handleSignOut} className="hover:bg-accent/50 transition-colors text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuLabel className="px-3 py-2">Diagramr</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem asChild className="hover:bg-accent/50 transition-colors">
              <Link to="/auth" className="cursor-pointer w-full flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Sign In</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
