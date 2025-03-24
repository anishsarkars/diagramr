
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
import { useAccess } from "./access-context";
import { useAuth } from "./auth-context";
import { Key, User, LogOut, Settings, Heart, Crown, Menu, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface HeaderMenuProps {
  onShowAccessModal?: () => void;
}

export function HeaderMenu({ onShowAccessModal }: HeaderMenuProps) {
  const { hasValidAccessCode, isPremiumUser, isAnishInvite, setShowAccessForm } = useAccess();
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

  const handleAccessCode = () => {
    setShowAccessForm(true);
    if (onShowAccessModal) {
      onShowAccessModal();
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center gap-1"
        >
          <Menu className="h-4 w-4 mr-1" />
          Menu
          <ChevronDown className="h-3 w-3 opacity-50" />
          {isPremiumUser && (
            <Badge variant="outline" className="ml-1 bg-purple-500/10 text-xs border-purple-500/30 text-purple-500">
              {isAnishInvite ? "Invite" : "Premium"}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {user ? (
          <>
            <DropdownMenuLabel className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{user.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/account" className="cursor-pointer w-full">
                <Settings className="mr-2 h-4 w-4" />
                <span>Account Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/liked" className="cursor-pointer w-full">
                <Heart className="mr-2 h-4 w-4" />
                <span>Liked Diagrams</span>
              </Link>
            </DropdownMenuItem>
            {isPremiumUser && (
              <DropdownMenuItem className="text-purple-500 bg-purple-500/5">
                <Crown className="mr-2 h-4 w-4 text-amber-400" />
                <span>{isAnishInvite ? "@Anish's Invite" : "Premium Access"}</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleAccessCode}>
              <Key className="mr-2 h-4 w-4" />
              <span>{hasValidAccessCode ? "View Access Status" : "Enter Access Code"}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuLabel>Diagramr Menu</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/auth" className="cursor-pointer w-full">
                <User className="mr-2 h-4 w-4" />
                <span>Sign In</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/auth?signup=true" className="cursor-pointer w-full">
                <User className="mr-2 h-4 w-4" />
                <span>Create Account</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleAccessCode}>
              <Key className="mr-2 h-4 w-4" />
              <span>Enter Access Code</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
