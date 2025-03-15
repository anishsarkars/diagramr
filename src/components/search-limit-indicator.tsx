
import { useSearchLimit } from "@/hooks/use-search-limit";
import { useAuth } from "@/components/auth-context";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { PremiumPlanDialog } from "@/components/premium-plan-dialog";

interface SearchLimitIndicatorProps {
  className?: string;
}

export function SearchLimitIndicator({ className }: SearchLimitIndicatorProps) {
  const { remainingSearches, hasReachedLimit, requiresLogin } = useSearchLimit();
  const { user, profile } = useAuth();
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  
  const isPremium = profile?.is_premium || false;
  
  if (isPremium) return null;
  
  return (
    <>
      <motion.div 
        className={`${className} bg-background/80 backdrop-blur-md border border-border/50 rounded-full px-4 py-2 shadow-md`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {hasReachedLimit ? (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground">
              You've reached your {user ? "daily" : "free trial"} search limit
            </p>
            <Button 
              size="sm" 
              onClick={() => setShowPremiumDialog(true)}
              className="text-xs gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Upgrade to Premium</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">{Math.max(0, remainingSearches)}</span> {user ? "free" : "trial"} searches remaining
            </p>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setShowPremiumDialog(true)}
              className="text-xs h-6 px-2"
            >
              Upgrade
            </Button>
          </div>
        )}
      </motion.div>
      
      <PremiumPlanDialog 
        open={showPremiumDialog} 
        onClose={() => setShowPremiumDialog(false)} 
        showLogin={requiresLogin}
      />
    </>
  );
}
