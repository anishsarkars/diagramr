
import { useSearchLimit } from "@/hooks/use-search-limit";
import { useAuth } from "@/components/auth-context";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Info } from "lucide-react";
import { PremiumPlanDialog } from "@/components/premium-plan-dialog";
import { useNavigate } from "react-router-dom";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SearchLimitIndicatorProps {
  className?: string;
  compact?: boolean;
}

export function SearchLimitIndicator({ className, compact = false }: SearchLimitIndicatorProps) {
  const { 
    remainingSearches, 
    hasReachedLimit, 
    requiresLogin,
    dailySearchLimit,
    isPremium
  } = useSearchLimit();
  
  const { user, profile } = useAuth();
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const navigate = useNavigate();
  
  // If the user has a profile and it's a premium user, don't show this indicator
  // unless they've reached a limit
  if (user && isPremium && !hasReachedLimit) return null;
  
  return (
    <>
      <motion.div 
        className={`${className} bg-background/80 backdrop-blur-md border border-border/50 rounded-full px-3 py-1.5 shadow-sm ${compact ? 'scale-90' : ''}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {hasReachedLimit ? (
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">
              {user ? "Daily search limit reached" : "Free trial ended"}
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
              <span className="font-medium">{Math.max(0, remainingSearches)}</span>/{dailySearchLimit} {user ? (isPremium ? "premium" : "free") : "guest"} searches left
            </p>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-4 w-4 p-0"
                  >
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    {isPremium 
                      ? `Premium users get ${dailySearchLimit} searches per day` 
                      : user 
                        ? `Free users get ${dailySearchLimit} searches per day. Upgrade for more!`
                        : `Guests get 3 searches per day. Sign in for 20 free searches!`
                    }
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
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
        Diagramr is in early stages and improving gradually. Some results may vary in quality.
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
