
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
import { UserRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function NameCollectionDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [retries, setRetries] = useState(0);
  const { user, profile, refreshProfile, updateProfile } = useAuth();

  useEffect(() => {
    // Check if we should show this dialog - only for signed in users with default username
    if (user && profile) {
      // If user has a default username (from email), and hasn't explicitly set a name before,
      // show the dialog
      const hasDefaultUsername = profile.username?.includes('@') || profile.username?.startsWith('user_');
      const hasSetNameBefore = localStorage.getItem(`diagramr-has-set-name-${user.id}`);
      
      setOpen(hasDefaultUsername && !hasSetNameBefore);
      
      // Pre-fill with existing username if not default-looking
      if (profile.username && !hasDefaultUsername) {
        setName(profile.username);
      } else if (user.email) {
        // Try to extract a name from the email
        const emailName = user.email.split('@')[0];
        // Capitalize first letter and replace dots/underscores with spaces
        const formattedName = emailName
          .replace(/[._]/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());
        setName(formattedName);
      }
    }
  }, [user, profile]);

  const handleSaveName = async () => {
    if (!user || !name.trim()) return;
    
    setIsLoading(true);
    
    try {
      console.log("Attempting to save name:", name.trim());
      
      // Try direct Supabase update with retries
      let success = false;
      let attempt = 0;
      const maxAttempts = 3;
      
      while (!success && attempt < maxAttempts) {
        attempt++;
        
        try {
          // Use direct Supabase call for more reliability
          const { data, error } = await supabase
            .from("profiles")
            .update({ username: name.trim() })
            .eq("id", user.id)
            .select();
          
          if (error) {
            console.error(`Attempt ${attempt}: Error updating profile directly:`, error);
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          
          if (data && data.length > 0) {
            success = true;
            console.log(`Profile updated successfully on attempt ${attempt}:`, data);
          }
        } catch (err) {
          console.error(`Attempt ${attempt}: Unexpected error in direct update:`, err);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // If direct updates failed, try the context method
      if (!success) {
        success = await updateProfile({ 
          username: name.trim() 
        });
      }
      
      if (!success) {
        // If we're still not successful but haven't reached max retries
        if (retries < 2) {
          setRetries(prev => prev + 1);
          toast.error("Failed to update name. Retrying...");
          setIsLoading(false);
          return;
        }
        
        throw new Error("Failed to update profile after multiple attempts");
      }
      
      // Mark that the user has set their name
      localStorage.setItem(`diagramr-has-set-name-${user.id}`, 'true');
      
      // Refresh profile to ensure UI is updated
      await refreshProfile();
      
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
            className="w-full sm:w-auto gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? "Saving..." : "Save Name"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
