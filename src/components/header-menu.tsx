
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
import { motion } from "framer-motion";

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
          className="flex items-center gap-1 group transition-all duration-300"
        >
          <Menu className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform duration-300" />
          <span className="font-medium">Menu</span>
          <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
          {isPremiumUser && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Badge variant="outline" className="ml-1 bg-purple-500/10 text-xs border-purple-500/30 text-purple-500">
                {isAnishInvite ? "Invite" : "Premium"}
              </Badge>
            </motion.div>
          )}
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
              <Link to="/account" className="cursor-pointer w-full flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Account Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="hover:bg-accent/50 transition-colors">
              <Link to="/liked" className="cursor-pointer w-full flex items-center">
                <Heart className="mr-2 h-4 w-4" />
                <span>Liked Diagrams</span>
              </Link>
            </DropdownMenuItem>
            {isPremiumUser && (
              <DropdownMenuItem className="text-purple-500 bg-purple-500/5 hover:bg-purple-500/10 transition-colors">
                <Crown className="mr-2 h-4 w-4 text-amber-400" />
                <span>{isAnishInvite ? "@Anish's Invite" : "Premium Access"}</span>
              </DropdownMenuItem>
            )}
            {!hasValidAccessCode && (
              <DropdownMenuItem onClick={handleAccessCode} className="hover:bg-accent/50 transition-colors">
                <Key className="mr-2 h-4 w-4" />
                <span>Enter Access Code</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem onClick={handleSignOut} className="hover:bg-accent/50 transition-colors">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuLabel className="px-3 py-2">Diagramr Menu</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem asChild className="hover:bg-accent/50 transition-colors">
              <Link to="/auth" className="cursor-pointer w-full flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Sign In</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="hover:bg-accent/50 transition-colors">
              <Link to="/auth?signup=true" className="cursor-pointer w-full flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Create Account</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleAccessCode} className="hover:bg-accent/50 transition-colors">
              <Key className="mr-2 h-4 w-4" />
              <span>Enter Access Code</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
