import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth-context";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { User, Sparkles, Loader2 } from "lucide-react";
import { DiagramrLogo } from "@/components/diagramr-logo";

interface NamePromptDialogProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function NamePromptDialog({ isOpen, onComplete }: NamePromptDialogProps) {
  const { updateProfileName, user } = useAuth();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Track dialog state explicitly
  useEffect(() => {
    setDialogOpen(isOpen);
  }, [isOpen]);

  // Fix: Use email to suggest a name if empty with useEffect
  useEffect(() => {
    if (dialogOpen && user?.email && !name.trim()) {
      console.log("Suggesting name from email", user.email);
      const suggestedName = user.email.split('@')[0];
      // Capitalize first letter and replace dots/underscores with spaces
      const formattedName = suggestedName
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      setName(formattedName);
    }
  }, [dialogOpen, user, name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await updateProfileName(name.trim());
      
      if (success) {
        toast.success("Profile updated successfully!");
        
        // Dispatch custom event to notify name was updated
        const nameUpdatedEvent = new Event('nameUpdated');
        window.dispatchEvent(nameUpdatedEvent);
        
        // Save name to local storage for immediate display
        localStorage.setItem('diagramr-username', name.trim());
        
        // Call onComplete after a brief delay
        setTimeout(() => {
          onComplete();
        }, 300);
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating name:", error);
      toast.error("Failed to update your name. Please try again.");
      setError("Failed to update your name. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={dialogOpen} 
      onOpenChange={(open) => {
        // Prevent closing the dialog by clicking outside
        // since name is mandatory
        if (!open && isOpen) {
          return; // Block closing
        }
        setDialogOpen(open);
      }}
    >
      <DialogContent className="sm:max-w-[425px] border-opacity-40 bg-card/95 backdrop-blur-sm dark:shadow-2xl dark:border-gray-800/50">
        <div className="w-full flex justify-center mb-2">
          <DiagramrLogo size="md" />
        </div>
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            <motion.div
              className="flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Welcome to Diagramr!
            </motion.div>
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground/90">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Please tell us your name to complete your account setup.
            </motion.p>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <motion.div 
            className="my-6 space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="space-y-2">
              <div className="flex justify-center mb-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <User className="h-10 w-10 text-primary" />
                </div>
              </div>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Enter your name"
                autoComplete="name"
                autoFocus
                required
                className={`bg-white/80 dark:bg-gray-950/80 shadow-sm border-gray-200 dark:border-gray-800 ${error ? "border-red-500" : ""}`}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <p className="text-xs text-muted-foreground">
                This is the name that will be displayed in greetings and throughout the app.
              </p>
            </div>
          </motion.div>
          <DialogFooter>
            <motion.div 
              className="w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button 
                type="submit" 
                disabled={isSubmitting || !name.trim()}
                className="w-full shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Continue
                  </span>
                )}
              </Button>
            </motion.div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 