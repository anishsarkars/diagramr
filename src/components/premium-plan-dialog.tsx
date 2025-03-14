
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PremiumPlanDialogProps {
  open: boolean;
  onClose: () => void;
}

export function PremiumPlanDialog({ open, onClose }: PremiumPlanDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    
    try {
      // In a real app, this would connect to Stripe or another payment processor
      // For demo purposes, we'll just update the user's profile
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("profiles")
        .update({ is_premium: true })
        .eq("id", user.id);
        
      if (error) throw error;
      
      toast.success("You've been upgraded to Premium!");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to upgrade");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { title: "Unlimited searches", premium: true, free: false },
    { title: "High-quality diagram images", premium: true, free: true },
    { title: "AI-generated diagrams", premium: true, free: false },
    { title: "Export diagrams", premium: true, free: false },
    { title: "Save favorite diagrams", premium: true, free: false },
  ];

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Upgrade to Premium</DialogTitle>
          <DialogDescription>
            Unlock unlimited searches and advanced features to enhance your learning experience.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 py-4">
          <div className="col-span-3 sm:col-span-1">
            <div className="text-center p-4">
              <h3 className="font-medium">Free</h3>
              <div className="mt-2 text-2xl font-bold">$0</div>
              <div className="text-xs text-muted-foreground">forever</div>
            </div>
          </div>
          
          <div className="col-span-3 sm:col-span-2 rounded-lg border-2 border-primary p-4">
            <div className="text-center">
              <h3 className="font-medium">Premium</h3>
              <div className="mt-2 text-2xl font-bold">$9.99</div>
              <div className="text-xs text-muted-foreground">per month</div>
            </div>
          </div>
          
          <div className="col-span-3 space-y-4 mt-4">
            {features.map((feature, i) => (
              <motion.div 
                key={feature.title}
                className="grid grid-cols-3 items-center text-sm"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="col-span-1">{feature.title}</div>
                <div className="col-span-1 text-center">
                  {feature.free ? (
                    <CheckCircle className="h-5 w-5 mx-auto text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 mx-auto text-muted-foreground/50" />
                  )}
                </div>
                <div className="col-span-1 text-center">
                  {feature.premium && (
                    <CheckCircle className="h-5 w-5 mx-auto text-primary" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="sm:w-auto w-full">
            Maybe later
          </Button>
          <Button onClick={handleUpgrade} disabled={isLoading} className="sm:w-auto w-full">
            {isLoading ? "Processing..." : "Upgrade now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
