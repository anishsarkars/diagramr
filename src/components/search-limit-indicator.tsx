
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
  
  // If the user has a profile and it's a premium user, don't show this indicator
  // unless they've reached a limit
  if (user && isPremium) return null;
  
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
              <span className="font-medium">{Math.max(0, remainingSearches)}</span> {user ? "daily" : "guest"} searches left
            </p>
            {!compact && !user && (
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
      
      <div className="text-[10px] text-muted-foreground/60 mt-1 text-center italic max-w-xs mx-auto">
        Diagramr is in beta and improving every day. Results may vary in quality and relevance.
      </div>
      
      <PremiumPlanDialog 
        open={showPremiumDialog} 
        onClose={() => setShowPremiumDialog(false)} 
        showLogin={requiresLogin}
        onLoginClick={() => navigate("/auth")}
      />
    </>
  );
}
