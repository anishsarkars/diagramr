
import { useSearchLimit } from "@/hooks/use-search-limit";
import { useAuth } from "@/components/auth-context";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { PremiumPlanDialog } from "@/components/premium-plan-dialog";
import { useNavigate } from "react-router-dom";

interface SearchLimitIndicatorProps {
  className?: string;
  compact?: boolean;
}

export function SearchLimitIndicator({ className, compact = false }: SearchLimitIndicatorProps) {
  const { 
    remainingSearches, 
    hasReachedLimit, 
    requiresLogin,
    remainingGenerations,
    hasReachedGenerationLimit
  } = useSearchLimit();
  
  const { user, profile } = useAuth();
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const navigate = useNavigate();
  
  const isPremium = profile?.is_premium || false;
  
  // If the user has a profile, they've signed up - don't show this indicator
  // unless they've reached a limit
  if (user && !hasReachedLimit && !hasReachedGenerationLimit) return null;
  
  const hasReachedAnyLimit = hasReachedLimit || hasReachedGenerationLimit;
  
  return (
    <>
      <motion.div 
        className={`${className} bg-background/80 backdrop-blur-md border border-border/50 rounded-full px-3 py-1.5 shadow-sm ${compact ? 'scale-90' : ''}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {hasReachedAnyLimit ? (
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">
              {user ? (
                hasReachedLimit ? "Daily search limit reached" : "Daily generation limit reached"
              ) : (
                "Free trial ended"
              )}
            </p>
            <Button 
              size="sm" 
              onClick={() => user ? setShowPremiumDialog(true) : navigate("/auth")}
              className="text-xs h-7 px-2 gap-1"
            >
              {user ? (
                <>
                  <Sparkles className="h-3 w-3" />
                  <span>Upgrade</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">{Math.max(0, remainingSearches)}</span> trial searches left
            </p>
            {!compact && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => navigate("/auth")}
                className="text-xs h-5 px-2"
              >
                Sign in for more
              </Button>
            )}
          </div>
        )}
      </motion.div>
      
      <PremiumPlanDialog 
        open={showPremiumDialog} 
        onClose={() => setShowPremiumDialog(false)} 
        showLogin={requiresLogin}
        onLoginClick={() => navigate("/auth")}
      />
    </>
  );
}
