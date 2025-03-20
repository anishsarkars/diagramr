
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, Star, Infinity, ArrowRight, Zap, CheckCircle2, GraduationCap, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PremiumPlanDialogProps {
  open: boolean;
  onClose: () => void;
  showLogin?: boolean;
  onLoginClick?: () => void;
}

export function PremiumPlanDialog({ 
  open, 
  onClose, 
  showLogin = false,
  onLoginClick
}: PremiumPlanDialogProps) {
  
  const handleUpgradeClick = () => {
    window.open("https://diagramr.lemonsqueezy.com/buy/5c0b7ecd-65a5-4e74-95c3-fa001496e2e2", "_blank");
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        <DialogHeader>
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-20 translate-x-20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          
          {showLogin ? (
            <>
              <DialogTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Sign in to continue learning
              </DialogTitle>
              <DialogDescription>
                Create a free account to access more educational diagrams and study resources.
              </DialogDescription>
            </>
          ) : (
            <>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Upgrade to Premium for Students & Researchers
              </DialogTitle>
              <DialogDescription>
                Get unlimited access to educational diagrams and advanced study resources.
              </DialogDescription>
            </>
          )}
        </DialogHeader>
        
        {showLogin ? (
          <div className="space-y-4 py-2">
            <div className="rounded-lg border p-3">
              <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Free account benefits for students:
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span>20 educational diagram searches per day</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Access to free educational resources</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Save favorites to your study collection</span>
                </li>
              </ul>
            </div>
            
            <div className="text-xs text-muted-foreground italic text-center">
              Diagramr is committed to supporting education with high-quality visual learning resources.
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="bg-card/60 p-4 rounded-lg border relative overflow-hidden">
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <span>Student Premium</span>
                </h3>
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-600">
                  <Star className="h-3 w-3 mr-1 fill-white" />
                  Special Pricing
                </Badge>
              </div>
              
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-bold">₹89</span>
                <span className="text-muted-foreground font-medium line-through">₹599</span>
                <span className="text-xs text-muted-foreground">/month</span>
              </div>
              
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Infinity className="h-4 w-4 text-primary" />
                  <span>Unlimited educational diagram searches</span>
                </li>
                <li className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span>Premium study resources & guides</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>High-resolution diagram downloads</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Ad-free learning experience</span>
                </li>
              </ul>
              
              <div className="text-xs text-muted-foreground italic mt-3">
                Special student pricing during beta - lock in this discount forever!
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {showLogin ? (
            <>
              <Button 
                variant="outline" 
                onClick={onClose} 
                className="sm:w-1/2"
              >
                Continue as Guest
              </Button>
              <Button 
                onClick={onLoginClick} 
                className="sm:w-1/2 gap-1"
              >
                Sign in
                <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={onClose} 
                className="sm:w-1/2"
              >
                Maybe Later
              </Button>
              <Button 
                onClick={handleUpgradeClick} 
                className="sm:w-1/2 gap-1"
              >
                <GraduationCap className="h-4 w-4 mr-1" />
                Upgrade for Students
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PremiumPlanDialog;
