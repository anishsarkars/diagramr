
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ExternalLink, AlertCircle, Zap } from "lucide-react";
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
    { title: "Searches per day", free: "30", premium: "Unlimited" },
    { title: "AI-generated diagrams per day", free: "5", premium: "15" },
    { title: "High-quality diagram images", free: true, premium: true },
    { title: "Bookmark favorite diagrams", free: true, premium: true },
    { title: "Advanced filters & sorting", free: true, premium: true },
    { title: "Priority support", free: false, premium: true },
  ];

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            {showLogin && !user ? "Create an Account" : "Upgrade to Premium"}
          </DialogTitle>
          <DialogDescription>
            {showLogin && !user 
              ? "Create an account and get 30 free searches and 5 AI generations per day."
              : "Unlock unlimited searches and more AI generations to enhance your experience."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="col-span-2 sm:col-span-1">
            <div className="text-center p-3 border rounded-lg">
              <h3 className="font-medium text-sm">Free Plan</h3>
              <div className="mt-2 text-xl font-bold">₹0</div>
              <div className="text-xs text-muted-foreground">forever</div>
            </div>
          </div>
          
          <div className="col-span-2 sm:col-span-1 rounded-lg border-2 border-primary p-3 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 rotate-45 bg-primary text-xs text-white py-1 px-10 shadow-md">
              Beta Special
            </div>
            <div className="text-center">
              <h3 className="font-medium text-sm">Premium</h3>
              <div className="mt-2 text-xl font-bold">₹89</div>
              <div className="text-xs text-muted-foreground">monthly</div>
            </div>
          </div>
          
          <div className="col-span-2 space-y-3 mt-2">
            {features.map((feature, i) => (
              <motion.div 
                key={feature.title}
                className="grid grid-cols-3 items-center text-sm"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <div className="col-span-1 font-medium">{feature.title}</div>
                <div className="col-span-1 text-center">
                  {typeof feature.free === 'boolean' ? (
                    feature.free ? (
                      <CheckCircle className="h-4 w-4 mx-auto text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 mx-auto text-muted-foreground/50" />
                    )
                  ) : (
                    <span className="text-xs font-medium">{feature.free}</span>
                  )}
                </div>
                <div className="col-span-1 text-center">
                  {typeof feature.premium === 'boolean' ? (
                    feature.premium ? (
                      <CheckCircle className="h-4 w-4 mx-auto text-primary" />
                    ) : (
                      <XCircle className="h-4 w-4 mx-auto text-muted-foreground/50" />
                    )
                  ) : (
                    <span className="text-xs font-medium text-primary">{feature.premium}</span>
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
              <span className="font-semibold">Beta Special:</span> Most premium features are available to free users during the beta period. Enjoy!
            </p>
          </div>
        </div>

        <div className="text-xs text-muted-foreground/60 text-center italic mb-2">
          Diagramr is in early beta. Features and results may vary in quality as we improve the service.
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
                  <span>Get Premium (₹89/month)</span>
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
