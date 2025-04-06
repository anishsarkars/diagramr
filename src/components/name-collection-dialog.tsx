import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-context";
import { UserRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function NameCollectionDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile, refreshProfile, updateProfile } = useAuth();

  useEffect(() => {
    // Check if we should show this dialog - only for signed in users with default username
    if (user && profile) {
      // If user has a default username (from email), and hasn't explicitly set a name before,
      // show the dialog
      const hasDefaultUsername = profile.username?.includes('@') || profile.username?.startsWith('user_');
      const hasSetNameBefore = localStorage.getItem(`diagramr-has-set-name-${user.id}`);
      
      setOpen(hasDefaultUsername && !hasSetNameBefore);
      
      // Pre-fill with existing username
      if (profile.username) {
        setName(profile.username);
      }
    }
  }, [user, profile]);

  const handleSaveName = async () => {
    if (!user || !name.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Use auth context's updateProfile instead of direct Supabase call
      const success = await updateProfile({ 
        username: name.trim() 
      });
      
      if (!success) {
        throw new Error("Failed to update profile");
      }
      
      // Mark that the user has set their name (to avoid showing this dialog again)
      localStorage.setItem(`diagramr-has-set-name-${user.id}`, 'true');
      
      toast.success("Your name has been saved");
      setOpen(false);
    } catch (error) {
      console.error("Error saving name:", error);
      toast.error("Failed to save your name. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      // Only allow closing if a name has been set
      if (!newOpen && user && !localStorage.getItem(`diagramr-has-set-name-${user.id}`)) {
        toast.info("Please enter your name to continue");
        return;
      }
      setOpen(newOpen);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserRound className="h-5 w-5 text-primary" />
            <span>Welcome! What's your name?</span>
          </DialogTitle>
          <DialogDescription>
            Help us personalize your experience by letting us know what to call you.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Input
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11"
            required
          />
          {!name.trim() && (
            <p className="text-xs text-destructive mt-2">
              Please enter your name to continue
            </p>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            onClick={handleSaveName}
            disabled={isLoading || !name.trim()}
            className="w-full sm:w-auto"
          >
            {isLoading ? "Saving..." : "Save Name"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 