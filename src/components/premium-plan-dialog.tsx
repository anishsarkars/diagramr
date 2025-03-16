
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ExternalLink, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-context";
import { useNavigate } from "react-router-dom";

interface PremiumPlanDialogProps {
  open: boolean;
  onClose: () => void;
  showLogin?: boolean;
  onLoginClick?: () => void;
}

export function PremiumPlanDialog({ open, onClose, showLogin = false, onLoginClick }: PremiumPlanDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    if (!user && showLogin) {
      if (onLoginClick) {
        onLoginClick();
      } else {
        navigate("/auth");
      }
      onClose();
      return;
    }
    
    setIsLoading(true);
    
    try {
      window.open("https://diagramr.lemonsqueezy.com/buy/5c0b7ecd-65a5-4e74-95c3-fa001496e2e2", "_blank");
      toast.success("Redirecting to payment page");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to open payment page");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      navigate("/auth");
    }
    onClose();
  };

  const features = [
    { title: "Unlimited searches & generations", premium: true, free: false },
    { title: "High-quality diagram images", premium: true, free: true },
    { title: "AI-generated diagrams (Gemini powered)", premium: true, free: false },
    { title: "Bookmark favorite diagrams", premium: true, free: false },
    { title: "Advanced filters & sorting", premium: true, free: false },
    { title: "Priority support", premium: true, free: false },
  ];

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Upgrade to Premium</DialogTitle>
          <DialogDescription>
            {showLogin && !user 
              ? "Create an account and unlock unlimited searches and advanced features."
              : "Unlock unlimited searches and advanced features to enhance your learning experience."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 py-4">
          <div className="col-span-3 sm:col-span-1">
            <div className="text-center p-4">
              <h3 className="font-medium">Free</h3>
              <div className="mt-2 text-2xl font-bold">₹0</div>
              <div className="text-xs text-muted-foreground">forever</div>
            </div>
          </div>
          
          <div className="col-span-3 sm:col-span-2 rounded-lg border-2 border-primary p-4 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 rotate-45 bg-primary text-white text-xs py-1 px-10 shadow-md">
              Beta Special
            </div>
            <div className="text-center">
              <h3 className="font-medium">Premium</h3>
              <div className="mt-2 text-2xl font-bold">₹89</div>
              <div className="text-sm text-muted-foreground">monthly</div>
            </div>
          </div>
          
          <div className="col-span-3 space-y-4 mt-4">
            {features.map((feature, i) => (
              <motion.div 
                key={feature.title}
                className="grid grid-cols-3 items-center text-sm"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
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

        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg mb-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800 dark:text-yellow-400">
              <span className="font-semibold">Beta Special:</span> All features are free during beta testing. Premium subscription will activate after beta period ends.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="sm:w-auto w-full">
            Maybe later
          </Button>
          
          {showLogin && !user ? (
            <Button onClick={handleSignIn} className="sm:w-auto w-full">
              Sign in / Sign up
            </Button>
          ) : (
            <Button 
              onClick={handleUpgrade}
              className="gap-1.5 sm:w-auto w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Premium Subscription (₹89/month)</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
